# 🏗️ THAY ĐỔI KIẾN TRÚC AWS - IMPACT ANALYSIS

## 📊 TỔNG QUAN KIẾN TRÚC MỚI

### **Các thành phần mới được thêm vào:**

1. **AWS Cognito** - User Authentication & Authorization
2. **API Gateway** - API Management & Rate Limiting
3. **Lambda Functions** - Serverless processing
4. **ElastiCache (Redis)** - Caching layer
5. **SNS (Simple Notification Service)** - Event notifications
6. **SES (Simple Email Service)** - Email sending
7. **Private Subnet** - Network isolation
8. **CloudWatch** - Monitoring & Logging
9. **GitLab Integration** - CI/CD pipeline

---

## 🔄 THAY ĐỔI CHI TIẾT

### **1. AUTHENTICATION - AWS Cognito** 🆕

#### **Thay đổi:**
- ❌ **Loại bỏ:** JWT tự implement (JwtAuthenticationFilter, JwtUtil)
- ✅ **Thay bằng:** AWS Cognito User Pools

#### **Lợi ích:**
- ✅ Không cần quản lý JWT secret
- ✅ Tự động handle token refresh
- ✅ Built-in MFA, password policies
- ✅ Social login (Google, Facebook)
- ✅ Forgot password flow

#### **Code changes cần thiết:**

**a) Thêm dependency:**
```xml
<!-- pom.xml -->
<dependency>
    <groupId>com.amazonaws</groupId>
    <artifactId>aws-java-sdk-cognitoidentityprovider</artifactId>
    <version>1.12.529</version>
</dependency>
```

**b) Cấu hình Cognito:**
```properties
# application.properties
aws.cognito.user-pool-id=${AWS_COGNITO_USER_POOL_ID}
aws.cognito.client-id=${AWS_COGNITO_CLIENT_ID}
aws.cognito.region=${AWS_REGION:ap-southeast-1}
```

**c) Thay thế SecurityConfig:**
```java
@Configuration
@EnableWebSecurity
public class CognitoSecurityConfig {
    
    @Value("${aws.cognito.user-pool-id}")
    private String userPoolId;
    
    @Value("${aws.cognito.region}")
    private String region;
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/actuator/health").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.decoder(jwtDecoder()))
            );
        
        return http.build();
    }
    
    @Bean
    public JwtDecoder jwtDecoder() {
        String jwkSetUri = String.format(
            "https://cognito-idp.%s.amazonaws.com/%s/.well-known/jwks.json",
            region, userPoolId
        );
        return NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();
    }
}
```

**d) Authentication Controller:**
```java
@RestController
@RequestMapping("/api/auth")
public class CognitoAuthController {
    
    @Autowired
    private AWSCognitoIdentityProvider cognitoClient;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // Cognito authentication
        AdminInitiateAuthRequest authRequest = new AdminInitiateAuthRequest()
            .withAuthFlow(AuthFlowType.ADMIN_NO_SRP_AUTH)
            .withUserPoolId(userPoolId)
            .withClientId(clientId)
            .withAuthParameters(Map.of(
                "USERNAME", request.getEmail(),
                "PASSWORD", request.getPassword()
            ));
        
        AdminInitiateAuthResult result = cognitoClient.adminInitiateAuth(authRequest);
        
        return ResponseEntity.ok(Map.of(
            "accessToken", result.getAuthenticationResult().getAccessToken(),
            "idToken", result.getAuthenticationResult().getIdToken(),
            "refreshToken", result.getAuthenticationResult().getRefreshToken()
        ));
    }
}
```

---

### **2. API GATEWAY** 🆕

#### **Thay đổi:**
- Request flow: `User → API Gateway → ALB → ECS`
- API Gateway xử lý: Rate limiting, API keys, request validation

#### **Cấu hình:**
```yaml
# API Gateway settings
- Throttling: 1000 requests/second
- Burst: 2000 requests
- API Key required: No (dùng Cognito)
- CORS: Enabled
```

#### **Code changes:**
- ✅ **Không cần thay đổi code** (API Gateway là proxy)
- ⚠️ Cần update CORS để allow API Gateway domain

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList(
        "https://apexev.com",
        "https://api.apexev.com",  // ← API Gateway domain
        "http://localhost:3000"
    ));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

---

### **3. ELASTICACHE (Redis)** 🆕

#### **Thay đổi:**
- Thêm caching layer cho: Sessions, API responses, Database queries

#### **Use cases:**
1. **Cache user sessions** (thay vì query DB mỗi request)
2. **Cache service prices** (ít thay đổi)
3. **Cache vehicle info** (ít thay đổi)
4. **Rate limiting** (track API calls)

#### **Code changes:**

**a) Thêm dependency:**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
</dependency>
```

**b) Cấu hình Redis:**
```properties
# application.properties
spring.data.redis.host=${REDIS_HOST:localhost}
spring.data.redis.port=${REDIS_PORT:6379}
spring.cache.type=redis
spring.cache.redis.time-to-live=3600000
```

**c) Enable caching:**
```java
@Configuration
@EnableCaching
public class CacheConfig {
    
    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofHours(1))
            .serializeKeysWith(
                RedisSerializationContext.SerializationPair.fromSerializer(
                    new StringRedisSerializer()
                )
            )
            .serializeValuesWith(
                RedisSerializationContext.SerializationPair.fromSerializer(
                    new GenericJackson2JsonRedisSerializer()
                )
            );
        
        return RedisCacheManager.builder(connectionFactory)
            .cacheDefaults(config)
            .build();
    }
}
```

**d) Sử dụng cache:**
```java
@Service
public class MaintenanceServiceImpl {
    
    @Cacheable(value = "services", key = "#serviceId")
    public MaintenanceService getServiceById(Long serviceId) {
        return serviceRepository.findById(serviceId).orElseThrow();
    }
    
    @CacheEvict(value = "services", key = "#service.id")
    public MaintenanceService updateService(MaintenanceService service) {
        return serviceRepository.save(service);
    }
}
```

---

### **4. LAMBDA FUNCTIONS** 🆕

#### **Use cases từ diagram:**
1. **Image Processing Lambda** - Resize/optimize ảnh từ S3
2. **Email Lambda** - Gửi email qua SES
3. **Notification Lambda** - Xử lý SNS events

#### **Ví dụ: Image Processing Lambda**

**Lambda function (Python):**
```python
import boto3
from PIL import Image
import io

s3 = boto3.client('s3')

def lambda_handler(event, context):
    # Triggered khi có file mới upload lên S3
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = event['Records'][0]['s3']['object']['key']
    
    # Download image
    response = s3.get_object(Bucket=bucket, Key=key)
    image = Image.open(io.BytesIO(response['Body'].read()))
    
    # Resize to thumbnail
    image.thumbnail((300, 300))
    
    # Upload thumbnail
    buffer = io.BytesIO()
    image.save(buffer, 'JPEG')
    buffer.seek(0)
    
    thumbnail_key = key.replace('original/', 'thumbnails/')
    s3.put_object(
        Bucket=bucket,
        Key=thumbnail_key,
        Body=buffer,
        ContentType='image/jpeg'
    )
    
    return {
        'statusCode': 200,
        'body': f'Thumbnail created: {thumbnail_key}'
    }
```

**Spring Boot integration:**
```java
// Không cần thay đổi code
// Lambda tự động trigger khi upload S3
// Spring Boot chỉ cần upload file như bình thường
```

---

### **5. SNS + SES (Notifications)** 🆕

#### **Thay đổi:**
- ❌ **Loại bỏ:** MailService tự implement SMTP
- ✅ **Thay bằng:** SNS → Lambda → SES

#### **Flow mới:**
```
Spring Boot → SNS Topic → Lambda → SES → Email
                ↓
            CloudWatch Logs
```

#### **Code changes:**

**a) Thêm dependency:**
```xml
<dependency>
    <groupId>com.amazonaws</groupId>
    <artifactId>aws-java-sdk-sns</artifactId>
    <version>1.12.529</version>
</dependency>
```

**b) SNS Service:**
```java
@Service
@RequiredArgsConstructor
public class NotificationService {
    
    private final AmazonSNS snsClient;
    
    @Value("${aws.sns.topic-arn}")
    private String topicArn;
    
    public void sendEmailNotification(String email, String subject, String message) {
        // Publish to SNS topic
        PublishRequest publishRequest = new PublishRequest()
            .withTopicArn(topicArn)
            .withSubject(subject)
            .withMessage(createEmailMessage(email, subject, message));
        
        snsClient.publish(publishRequest);
    }
    
    private String createEmailMessage(String email, String subject, String message) {
        return String.format("""
            {
                "email": "%s",
                "subject": "%s",
                "message": "%s"
            }
            """, email, subject, message);
    }
}
```

**c) Thay thế MailService:**
```java
// CŨ:
@Autowired
private MailService mailService;
mailService.sendEmail(to, subject, body);

// MỚI:
@Autowired
private NotificationService notificationService;
notificationService.sendEmailNotification(to, subject, body);
```

---

### **6. PRIVATE SUBNET** 🔒

#### **Thay đổi:**
- ECS Fargate, RDS, ElastiCache nằm trong Private Subnet
- Chỉ ALB có public IP
- Tăng bảo mật

#### **Impact:**
- ✅ **Không cần thay đổi code**
- ⚠️ Cần NAT Gateway để ECS pull image từ ECR
- ⚠️ Cần VPC Endpoints cho AWS services (S3, ECR, CloudWatch)

#### **Cấu hình VPC:**
```bash
# Public Subnet (ALB)
- 10.0.1.0/24 (AZ-1)
- 10.0.2.0/24 (AZ-2)

# Private Subnet (ECS, RDS, Redis)
- 10.0.10.0/24 (AZ-1)
- 10.0.11.0/24 (AZ-2)

# NAT Gateway in Public Subnet
# VPC Endpoints: S3, ECR, CloudWatch Logs
```

---

### **7. S3 CHANGES** 📦

#### **Thay đổi:**
- S3 bucket riêng cho Photos
- Lambda auto-process images
- CloudFront CDN cho faster delivery

#### **Code changes:**

**a) S3Service update:**
```java
@Service
public class S3Service {
    
    @Value("${aws.s3.photos-bucket}")
    private String photosBucket;  // ← Bucket riêng cho photos
    
    @Value("${aws.cloudfront.domain}")
    private String cloudFrontDomain;  // ← CDN domain
    
    public String uploadPhoto(MultipartFile file) {
        String key = "original/" + generateUniqueFilename(file);
        
        // Upload to S3
        s3Client.putObject(photosBucket, key, file.getInputStream(), metadata);
        
        // Return CloudFront URL (faster)
        return String.format("https://%s/%s", cloudFrontDomain, key);
        
        // Lambda sẽ tự động tạo thumbnail
        // Thumbnail URL: https://cdn.apexev.com/thumbnails/xxx.jpg
    }
}
```

---

### **8. GITLAB CI/CD** 🚀

#### **Thay đổi:**
- Tự động build & deploy khi push code
- GitLab → ECR → ECS

#### **Tạo file `.gitlab-ci.yml`:**
```yaml
stages:
  - build
  - deploy

variables:
  AWS_REGION: ap-southeast-1
  ECR_REPOSITORY: 029930584678.dkr.ecr.ap-southeast-1.amazonaws.com/apexev
  ECS_CLUSTER: apexev-cluster
  ECS_SERVICE: apexev-service

build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - apk add --no-cache aws-cli
    - aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPOSITORY
    - docker build -t apexev:$CI_COMMIT_SHORT_SHA .
    - docker tag apexev:$CI_COMMIT_SHORT_SHA $ECR_REPOSITORY:$CI_COMMIT_SHORT_SHA
    - docker tag apexev:$CI_COMMIT_SHORT_SHA $ECR_REPOSITORY:latest
    - docker push $ECR_REPOSITORY:$CI_COMMIT_SHORT_SHA
    - docker push $ECR_REPOSITORY:latest
  only:
    - main

deploy:
  stage: deploy
  image: amazon/aws-cli
  script:
    - aws ecs update-service --cluster $ECS_CLUSTER --service $ECS_SERVICE --force-new-deployment --region $AWS_REGION
  only:
    - main
```

---

## 📋 CHECKLIST THAY ĐỔI

### **Backend Code Changes:**
- [ ] Thay JWT bằng Cognito authentication
- [ ] Thêm Redis caching
- [ ] Thay MailService bằng SNS
- [ ] Update S3Service để dùng CloudFront URL
- [ ] Update CORS config cho API Gateway
- [ ] Thêm health check endpoints

### **AWS Infrastructure:**
- [ ] Setup Cognito User Pool
- [ ] Setup API Gateway
- [ ] Setup ElastiCache Redis
- [ ] Setup Lambda functions (image processing, email)
- [ ] Setup SNS topics
- [ ] Setup SES (verify domain)
- [ ] Setup Private Subnets + NAT Gateway
- [ ] Setup VPC Endpoints
- [ ] Setup CloudFront distribution
- [ ] Setup GitLab CI/CD

### **Configuration:**
- [ ] Update application.properties với các biến môi trường mới
- [ ] Tạo .gitlab-ci.yml
- [ ] Update deployment scripts

---

## 💰 CHI PHÍ ƯỚC TÍNH (THÁNG)

### **Kiến trúc CŨ:**
- ECR: Free
- RDS db.t3.micro: $12 (Free Tier: $0)
- S3: $1
- ECS Fargate: $15
- ALB: $16
- **Tổng: ~$44/tháng** (Free Tier: ~$32)

### **Kiến trúc MỚI:**
- ECR: Free
- RDS db.t3.micro: $12 (Free Tier: $0)
- ElastiCache t3.micro: $12 (Free Tier: $0)
- S3: $2
- ECS Fargate: $15
- ALB: $16
- API Gateway: $3.50 (1M requests)
- Lambda: $0.20 (Free Tier: $0)
- SNS: $0.50
- SES: $0.10 (1000 emails)
- Cognito: Free (< 50k MAU)
- CloudFront: $1
- NAT Gateway: $32 ⚠️ (đắt nhất!)
- **Tổng: ~$94/tháng** (Free Tier: ~$70)

### **Tối ưu chi phí:**
- Dùng VPC Endpoints thay NAT Gateway: Tiết kiệm $30/tháng
- **Tổng sau tối ưu: ~$64/tháng** (Free Tier: ~$40)

---

## 🎯 KẾT LUẬN

**Kiến trúc mới:**
- ✅ Bảo mật cao hơn (Private Subnet, Cognito)
- ✅ Performance tốt hơn (Redis, CloudFront)
- ✅ Scalable hơn (Lambda, API Gateway)
- ✅ Monitoring tốt hơn (CloudWatch)
- ⚠️ Phức tạp hơn
- ⚠️ Chi phí cao hơn ~$20-50/tháng

**Khuyến nghị:**
- Nếu **demo/học tập**: Dùng kiến trúc CŨ (đơn giản, rẻ)
- Nếu **production thực tế**: Dùng kiến trúc MỚI (chuyên nghiệp)
