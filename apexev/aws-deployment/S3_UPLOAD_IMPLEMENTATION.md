# 📸 S3 UPLOAD IMPLEMENTATION - KIẾN TRÚC MỚI

## 🏗️ KIẾN TRÚC UPLOAD HÌNH ẢNH

### **Flow với kiến trúc mới:**

```
┌─────────────┐
│ TECHNICIAN  │
│  (Mobile)   │
└──────┬──────┘
       │
       │ 1️⃣ Upload image
       ▼
┌──────────────────────────────────────────┐
│  API Gateway                             │
│  - Rate limiting: 100 uploads/minute     │
│  - Max file size: 10MB                   │
│  - Validate JWT from Cognito             │
└──────┬───────────────────────────────────┘
       │
       │ 2️⃣ Forward request
       ▼
┌──────────────────────────────────────────┐
│  ALB → ECS Fargate (Private Subnet)      │
│  FileUploadController                    │
│  - Validate file type                    │
│  - Generate unique filename              │
│  - Upload to S3                          │
└──────┬───────────────────────────────────┘
       │
       │ 3️⃣ Upload to S3
       ▼
┌──────────────────────────────────────────┐
│  S3 Bucket: apexev-photos                │
│  └── original/                           │
│      └── 2024-11-18_abc123.jpg           │
└──────┬───────────────────────────────────┘
       │
       │ 4️⃣ S3 Event Trigger
       ▼
┌──────────────────────────────────────────┐
│  Lambda: Image Processing                │
│  - Resize to 1920x1080 (optimized)       │
│  - Create thumbnail 300x300              │
│  - Save to thumbnails/ folder            │
│  - Publish SNS event (optional)          │
└──────┬───────────────────────────────────┘
       │
       │ 5️⃣ Save thumbnails
       ▼
┌──────────────────────────────────────────┐
│  S3 Bucket: apexev-photos                │
│  ├── original/2024-11-18_abc123.jpg      │
│  └── thumbnails/2024-11-18_abc123.jpg    │
└──────┬───────────────────────────────────┘
       │
       │ 6️⃣ Return CloudFront URL
       ▼
┌──────────────────────────────────────────┐
│  Response to Frontend                    │
│  {                                       │
│    "originalUrl": "https://cdn.apexev.com/original/...",  │
│    "thumbnailUrl": "https://cdn.apexev.com/thumbnails/..." │
│  }                                       │
└──────────────────────────────────────────┘
       │
       │ 7️⃣ Save to database
       ▼
┌──────────────────────────────────────────┐
│  RDS MySQL (Private Subnet)              │
│  service_checklist_results               │
│  - media_url: CloudFront URL             │
│  - thumbnail_url: CloudFront URL         │
└──────────────────────────────────────────┘
       │
       │ 8️⃣ Customer views
       ▼
┌──────────────────────────────────────────┐
│  CloudFront CDN                          │
│  - Cache images globally                 │
│  - Fast delivery                         │
│  - HTTPS by default                      │
└──────────────────────────────────────────┘
```

---

## 💻 CODE IMPLEMENTATION

### **1. Entity Update - Thêm thumbnail URL**

```java
@Entity
@Table(name = "service_checklist_results")
public class ServiceChecklistResult {
    
    @Column(name = "media_url", length = 500)
    private String mediaUrl; // Original image URL (CloudFront)
    
    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl; // Thumbnail URL (CloudFront) - MỚI
    
    @Column(name = "media_type", length = 20)
    private String mediaType; // IMAGE, VIDEO - MỚI
}
```

### **2. S3Service - Upload với CloudFront**

```java
@Service
@RequiredArgsConstructor
public class S3Service {
    
    private final AmazonS3 s3Client;
    
    @Value("${aws.s3.photos-bucket}")
    private String photosBucket;
    
    @Value("${aws.cloudfront.domain}")
    private String cloudFrontDomain;
    
    @Value("${aws.s3.region}")
    private String region;
    
    /**
     * Upload file to S3 and return CloudFront URL
     */
    public FileUploadResult uploadFile(MultipartFile file, String folder) {
        try {
            // Validate
            validateFile(file);
            
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = getFileExtension(originalFilename);
            String uniqueFilename = String.format(
                "%s/%s_%s%s",
                folder,
                LocalDate.now(),
                UUID.randomUUID().toString().substring(0, 8),
                extension
            );
            
            // Prepare metadata
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentType(file.getContentType());
            metadata.setContentLength(file.getSize());
            metadata.setCacheControl("max-age=31536000"); // Cache 1 year
            
            // Upload to S3
            PutObjectRequest putRequest = new PutObjectRequest(
                photosBucket,
                uniqueFilename,
                file.getInputStream(),
                metadata
            );
            
            // Set ACL to public-read (hoặc dùng bucket policy)
            putRequest.setCannedAcl(CannedAccessControlList.PublicRead);
            
            s3Client.putObject(putRequest);
            
            // Return CloudFront URL (not S3 direct URL)
            String cloudFrontUrl = String.format(
                "https://%s/%s",
                cloudFrontDomain,
                uniqueFilename
            );
            
            // Lambda sẽ tự động tạo thumbnail
            String thumbnailUrl = cloudFrontUrl.replace("/original/", "/thumbnails/");
            
            return FileUploadResult.builder()
                .originalUrl(cloudFrontUrl)
                .thumbnailUrl(thumbnailUrl)
                .fileName(uniqueFilename)
                .fileSize(file.getSize())
                .contentType(file.getContentType())
                .build();
            
        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi upload file: " + e.getMessage());
        }
    }
    
    /**
     * Delete file from S3
     */
    public void deleteFile(String fileUrl) {
        try {
            // Extract key from CloudFront URL
            String key = extractKeyFromUrl(fileUrl);
            
            // Delete original
            s3Client.deleteObject(photosBucket, key);
            
            // Delete thumbnail
            String thumbnailKey = key.replace("original/", "thumbnails/");
            s3Client.deleteObject(photosBucket, thumbnailKey);
            
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi xóa file: " + e.getMessage());
        }
    }
    
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File không được rỗng");
        }
        
        // Validate file type
        String contentType = file.getContentType();
        if (!isValidFileType(contentType)) {
            throw new IllegalArgumentException(
                "Chỉ chấp nhận ảnh (jpg, png, webp) hoặc video (mp4)"
            );
        }
        
        // Validate file size (max 10MB)
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new IllegalArgumentException("File không được vượt quá 10MB");
        }
    }
    
    private boolean isValidFileType(String contentType) {
        return contentType != null && (
            contentType.equals("image/jpeg") ||
            contentType.equals("image/png") ||
            contentType.equals("image/webp") ||
            contentType.equals("video/mp4")
        );
    }
    
    private String getFileExtension(String filename) {
        return filename.substring(filename.lastIndexOf("."));
    }
    
    private String extractKeyFromUrl(String url) {
        // https://cdn.apexev.com/original/2024-11-18_abc123.jpg
        // → original/2024-11-18_abc123.jpg
        return url.substring(url.indexOf(".com/") + 5);
    }
}
```

### **3. FileUploadController - API Gateway compatible**

```java
@RestController
@RequestMapping("/api/technician/files")
@RequiredArgsConstructor
public class FileUploadController {
    
    private final S3Service s3Service;
    
    /**
     * Upload file endpoint
     * Called via: API Gateway → ALB → ECS
     */
    @PostMapping("/upload")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<FileUploadResponse> uploadFile(
        @RequestParam("file") MultipartFile file,
        @RequestParam(value = "folder", defaultValue = "original") String folder,
        @AuthenticationPrincipal Jwt jwt // ← Cognito JWT
    ) {
        // Get user info from Cognito JWT
        String userId = jwt.getSubject();
        String email = jwt.getClaim("email");
        
        // Upload to S3
        FileUploadResult result = s3Service.uploadFile(file, folder);
        
        // Log to CloudWatch
        log.info("File uploaded by user: {} ({}), file: {}", 
            email, userId, result.getFileName());
        
        // Return response
        FileUploadResponse response = FileUploadResponse.builder()
            .originalUrl(result.getOriginalUrl())
            .thumbnailUrl(result.getThumbnailUrl())
            .fileName(result.getFileName())
            .fileSize(result.getFileSize())
            .uploadedAt(LocalDateTime.now())
            .build();
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Delete file endpoint
     */
    @DeleteMapping("/delete")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<Void> deleteFile(
        @RequestParam("url") String fileUrl,
        @AuthenticationPrincipal Jwt jwt
    ) {
        s3Service.deleteFile(fileUrl);
        
        log.info("File deleted by user: {}, file: {}", 
            jwt.getClaim("email"), fileUrl);
        
        return ResponseEntity.noContent().build();
    }
}
```

### **4. DTO Classes**

```java
@Data
@Builder
public class FileUploadResult {
    private String originalUrl;    // CloudFront URL for original
    private String thumbnailUrl;   // CloudFront URL for thumbnail
    private String fileName;
    private Long fileSize;
    private String contentType;
}

@Data
@Builder
public class FileUploadResponse {
    private String originalUrl;
    private String thumbnailUrl;
    private String fileName;
    private Long fileSize;
    private LocalDateTime uploadedAt;
}

@Data
public class SubmitChecklistRequest {
    private Long checklistId;
    private Long templateItemId;
    private ChecklistItemStatus status;
    private String notes;
    private String mediaUrl;       // Original URL
    private String thumbnailUrl;   // Thumbnail URL
    private String mediaType;      // IMAGE or VIDEO
}
```

### **5. TechnicianWorkService - Save URLs**

```java
@Service
@RequiredArgsConstructor
public class TechnicianWorkServiceImpl {
    
    private final ServiceChecklistResultRepository resultRepository;
    
    @Transactional
    public void submitChecklistResult(
        SubmitChecklistRequest request, 
        Jwt jwt
    ) {
        // Validate ownership
        // ...
        
        // Create result
        ServiceChecklistResult result = new ServiceChecklistResult();
        result.setServiceChecklist(checklist);
        result.setTemplateItem(templateItem);
        result.setStatus(request.getStatus());
        result.setTechnicianNotes(request.getNotes());
        result.setMediaUrl(request.getMediaUrl());           // ✅ CloudFront URL
        result.setThumbnailUrl(request.getThumbnailUrl());   // ✅ Thumbnail URL
        result.setMediaType(request.getMediaType());         // ✅ IMAGE/VIDEO
        
        resultRepository.save(result);
    }
}
```

---

## 🔧 LAMBDA FUNCTION - Image Processing

### **Lambda Code (Python):**

```python
import boto3
import os
from PIL import Image
import io

s3 = boto3.client('s3')
sns = boto3.client('sns')

BUCKET_NAME = os.environ['BUCKET_NAME']
SNS_TOPIC_ARN = os.environ['SNS_TOPIC_ARN']

def lambda_handler(event, context):
    """
    Triggered when new file uploaded to S3 original/ folder
    """
    try:
        # Get file info from S3 event
        bucket = event['Records'][0]['s3']['bucket']['name']
        key = event['Records'][0]['s3']['object']['key']
        
        # Only process files in original/ folder
        if not key.startswith('original/'):
            return {'statusCode': 200, 'body': 'Skipped'}
        
        # Download image from S3
        response = s3.get_object(Bucket=bucket, Key=key)
        image_data = response['Body'].read()
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if needed
        if image.mode in ('RGBA', 'LA', 'P'):
            image = image.convert('RGB')
        
        # Create optimized version (1920x1080 max)
        image.thumbnail((1920, 1080), Image.Resampling.LANCZOS)
        
        # Save optimized version
        optimized_buffer = io.BytesIO()
        image.save(optimized_buffer, 'JPEG', quality=85, optimize=True)
        optimized_buffer.seek(0)
        
        s3.put_object(
            Bucket=bucket,
            Key=key,  # Overwrite original with optimized
            Body=optimized_buffer,
            ContentType='image/jpeg',
            CacheControl='max-age=31536000'
        )
        
        # Create thumbnail (300x300)
        image.thumbnail((300, 300), Image.Resampling.LANCZOS)
        
        thumbnail_buffer = io.BytesIO()
        image.save(thumbnail_buffer, 'JPEG', quality=80, optimize=True)
        thumbnail_buffer.seek(0)
        
        # Save thumbnail
        thumbnail_key = key.replace('original/', 'thumbnails/')
        s3.put_object(
            Bucket=bucket,
            Key=thumbnail_key,
            Body=thumbnail_buffer,
            ContentType='image/jpeg',
            CacheControl='max-age=31536000'
        )
        
        # Publish SNS notification (optional)
        sns.publish(
            TopicArn=SNS_TOPIC_ARN,
            Subject='Image Processed',
            Message=f'Image processed: {key}\nThumbnail: {thumbnail_key}'
        )
        
        return {
            'statusCode': 200,
            'body': f'Processed: {key}'
        }
        
    except Exception as e:
        print(f'Error: {str(e)}')
        return {
            'statusCode': 500,
            'body': f'Error: {str(e)}'
        }
```

### **Lambda Configuration:**
```yaml
Runtime: Python 3.11
Memory: 512 MB
Timeout: 30 seconds
Environment Variables:
  - BUCKET_NAME: apexev-photos
  - SNS_TOPIC_ARN: arn:aws:sns:ap-southeast-1:xxx:image-processed

Trigger: S3 Event
  - Event: s3:ObjectCreated:*
  - Prefix: original/
  - Suffix: .jpg, .png, .jpeg

IAM Role Permissions:
  - s3:GetObject
  - s3:PutObject
  - sns:Publish
  - logs:CreateLogGroup
  - logs:CreateLogStream
  - logs:PutLogEvents
```

---

## ⚙️ APPLICATION.PROPERTIES

```properties
# AWS S3 Configuration
aws.s3.photos-bucket=${AWS_S3_PHOTOS_BUCKET:apexev-photos}
aws.s3.region=${AWS_REGION:ap-southeast-1}
aws.access-key-id=${AWS_ACCESS_KEY_ID}
aws.secret-access-key=${AWS_SECRET_ACCESS_KEY}

# CloudFront Configuration
aws.cloudfront.domain=${AWS_CLOUDFRONT_DOMAIN:cdn.apexev.com}

# File Upload Limits
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

---

## 🔒 S3 BUCKET POLICY

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::apexev-photos/*"
    },
    {
      "Sid": "AllowCloudFrontAccess",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::apexev-photos/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::029930584678:distribution/XXXXX"
        }
      }
    }
  ]
}
```

---

## 📱 FRONTEND EXAMPLE

```javascript
// React Native / React
const uploadImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('file', imageFile);
  formData.append('folder', 'original');
  
  const response = await fetch(
    'https://api.apexev.com/api/technician/files/upload',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cognitoAccessToken}`
      },
      body: formData
    }
  );
  
  const data = await response.json();
  
  return {
    originalUrl: data.originalUrl,    // https://cdn.apexev.com/original/xxx.jpg
    thumbnailUrl: data.thumbnailUrl   // https://cdn.apexev.com/thumbnails/xxx.jpg
  };
};

// Submit checklist with image
const submitChecklist = async (checklistData, imageUrls) => {
  await fetch('https://api.apexev.com/api/technician/checklist/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cognitoAccessToken}`
    },
    body: JSON.stringify({
      ...checklistData,
      mediaUrl: imageUrls.originalUrl,
      thumbnailUrl: imageUrls.thumbnailUrl,
      mediaType: 'IMAGE'
    })
  });
};
```

---

## 🎯 SO SÁNH KIẾN TRÚC CŨ VS MỚI

### **Kiến trúc CŨ:**
```
Upload → Spring Boot → S3 → Return S3 URL
                              ↓
                         Save to DB
```

### **Kiến trúc MỚI:**
```
Upload → API Gateway → Spring Boot → S3 → Lambda (auto-process)
                                      ↓         ↓
                              CloudFront URL   Thumbnail
                                      ↓
                                 Save to DB
```

### **Lợi ích kiến trúc mới:**
- ✅ **Faster delivery**: CloudFront CDN cache globally
- ✅ **Auto optimization**: Lambda tự động resize/optimize
- ✅ **Thumbnail**: Tự động tạo thumbnail cho list view
- ✅ **Rate limiting**: API Gateway protect từ abuse
- ✅ **Better security**: Cognito JWT validation
- ✅ **Monitoring**: CloudWatch logs tất cả uploads

---

## 💰 CHI PHÍ UPLOAD

### **Ước tính với 1000 uploads/tháng:**
- S3 Storage (10GB): $0.23
- S3 PUT requests (1000): $0.005
- Lambda invocations (1000): $0.20 (Free Tier: $0)
- CloudFront data transfer (10GB): $0.85
- **Tổng: ~$1.30/tháng**

Rất rẻ! 🎉
