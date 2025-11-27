# 🔄 AWS SDK v1 vs v2 - SO SÁNH

## 📊 TỔNG QUAN

Bạn đang dùng **AWS SDK v2** - Đây là lựa chọn ĐÚNG ĐẮN!

```xml
<!-- AWS SDK v2 với BOM (Best Practice) ✅ -->
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>software.amazon.awssdk</groupId>
            <artifactId>bom</artifactId>
            <version>2.21.1</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<dependencies>
    <dependency>
        <groupId>software.amazon.awssdk</groupId>
        <artifactId>s3</artifactId>
        <!-- Version được quản lý bởi BOM -->
    </dependency>
</dependencies>
```

---

## ✅ ƯU ĐIỂM AWS SDK v2

### **1. Performance**
- ⚡ Nhanh hơn 20-30%
- 🔄 Non-blocking I/O (async support)
- 💾 Memory footprint nhỏ hơn

### **2. Modern API**
- 🎯 Builder pattern (dễ đọc, dễ maintain)
- 🔒 Immutable objects (thread-safe)
- 📦 Modular (chỉ import service cần dùng)

### **3. Better Error Handling**
- 🐛 Exception hierarchy rõ ràng hơn
- 📝 Error messages chi tiết hơn

### **4. Future-proof**
- 🚀 AWS đang focus vào v2
- 🔄 v1 sẽ deprecated trong tương lai

---

## 📝 SO SÁNH CODE

### **AWS SDK v1 (Cũ):**

```java
// Config
@Bean
public AmazonS3 amazonS3Client() {
    BasicAWSCredentials awsCredentials = new BasicAWSCredentials(accessKeyId, secretAccessKey);
    
    return AmazonS3ClientBuilder
            .standard()
            .withRegion(region)
            .withCredentials(new AWSStaticCredentialsProvider(awsCredentials))
            .build();
}

// Upload
ObjectMetadata metadata = new ObjectMetadata();
metadata.setContentType(file.getContentType());
metadata.setContentLength(file.getSize());

PutObjectRequest putRequest = new PutObjectRequest(
    bucketName,
    fileKey,
    file.getInputStream(),
    metadata
);

s3Client.putObject(putRequest);

// Pre-signed URL
Date expiration = new Date();
expiration.setTime(expiration.getTime() + (expirationMinutes * 60 * 1000));

GeneratePresignedUrlRequest request = new GeneratePresignedUrlRequest(bucketName, fileKey)
    .withMethod(HttpMethod.GET)
    .withExpiration(expiration);

URL url = s3Client.generatePresignedUrl(request);
```

---

### **AWS SDK v2 (Mới) ✅:**

```java
// Config
@Bean
public S3Client s3Client() {
    AwsBasicCredentials awsCredentials = AwsBasicCredentials.create(accessKeyId, secretAccessKey);
    
    return S3Client.builder()
            .region(Region.of(region))
            .credentialsProvider(StaticCredentialsProvider.create(awsCredentials))
            .build();
}

@Bean
public S3Presigner s3Presigner() {
    AwsBasicCredentials awsCredentials = AwsBasicCredentials.create(accessKeyId, secretAccessKey);
    
    return S3Presigner.builder()
            .region(Region.of(region))
            .credentialsProvider(StaticCredentialsProvider.create(awsCredentials))
            .build();
}

// Upload (Builder Pattern - Dễ đọc hơn!)
PutObjectRequest putObjectRequest = PutObjectRequest.builder()
        .bucket(bucketName)
        .key(fileKey)
        .contentType(file.getContentType())
        .contentLength(file.getSize())
        .build();

s3Client.putObject(putObjectRequest, 
        RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

// Pre-signed URL (Đơn giản hơn!)
GetObjectRequest getObjectRequest = GetObjectRequest.builder()
        .bucket(bucketName)
        .key(fileKey)
        .build();

GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
        .signatureDuration(Duration.ofMinutes(expirationMinutes))
        .getObjectRequest(getObjectRequest)
        .build();

PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);
String url = presignedRequest.url().toString();
```

---

## 🎯 KHUYẾN NGHỊ

### **Dùng AWS SDK v2 khi:**
- ✅ Dự án mới
- ✅ Muốn performance tốt
- ✅ Cần async support
- ✅ Long-term maintenance

### **Dùng AWS SDK v1 khi:**
- ⚠️  Legacy code (đã có sẵn)
- ⚠️  Không muốn refactor
- ⚠️  Team chưa quen v2

---

## 📦 DEPENDENCY COMPARISON

### **v1 (Monolithic):**
```xml
<!-- Tải toàn bộ AWS SDK (~100MB) -->
<dependency>
    <groupId>com.amazonaws</groupId>
    <artifactId>aws-java-sdk</artifactId>
    <version>1.12.529</version>
</dependency>

<!-- Hoặc chỉ S3 (~20MB) -->
<dependency>
    <groupId>com.amazonaws</groupId>
    <artifactId>aws-java-sdk-s3</artifactId>
    <version>1.12.529</version>
</dependency>
```

### **v2 (Modular) ✅:**
```xml
<!-- BOM quản lý version -->
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>software.amazon.awssdk</groupId>
            <artifactId>bom</artifactId>
            <version>2.21.1</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<!-- Chỉ import S3 (~5MB) -->
<dependencies>
    <dependency>
        <groupId>software.amazon.awssdk</groupId>
        <artifactId>s3</artifactId>
    </dependency>
</dependencies>
```

**Lợi ích BOM:**
- ✅ Không cần specify version cho từng dependency
- ✅ Tự động compatible giữa các AWS services
- ✅ Dễ upgrade (chỉ đổi BOM version)

---

## 🔄 MIGRATION GUIDE (v1 → v2)

### **1. Update Dependencies:**
```xml
<!-- Remove v1 -->
<dependency>
    <groupId>com.amazonaws</groupId>
    <artifactId>aws-java-sdk-s3</artifactId>
    <version>1.12.529</version>
</dependency>

<!-- Add v2 -->
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>software.amazon.awssdk</groupId>
            <artifactId>bom</artifactId>
            <version>2.21.1</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<dependencies>
    <dependency>
        <groupId>software.amazon.awssdk</groupId>
        <artifactId>s3</artifactId>
    </dependency>
</dependencies>
```

### **2. Update Imports:**
```java
// v1
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.*;

// v2
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
```

### **3. Update Config:**
```java
// v1
@Bean
public AmazonS3 amazonS3Client() {
    return AmazonS3ClientBuilder.standard()...build();
}

// v2
@Bean
public S3Client s3Client() {
    return S3Client.builder()...build();
}

@Bean
public S3Presigner s3Presigner() {
    return S3Presigner.builder()...build();
}
```

### **4. Update Service Methods:**
Xem code đã update ở `S3Service.java`

---

## 🎓 KẾT LUẬN

**Bạn đã chọn đúng!** 

AWS SDK v2 với BOM là:
- ✅ Modern
- ✅ Performant
- ✅ Future-proof
- ✅ Best practice

**Code đã được update để dùng v2!**

Files đã sửa:
- ✅ `S3Config.java` - Dùng S3Client và S3Presigner
- ✅ `S3Service.java` - Dùng Builder pattern của v2
- ✅ `FileUploadController.java` - Không đổi (vẫn hoạt động)

**Bạn chỉ cần:**
1. Maven reload project
2. Set AWS credentials
3. Test API

Done! 🎉
