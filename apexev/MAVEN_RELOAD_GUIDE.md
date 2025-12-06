# 🔄 MAVEN RELOAD GUIDE

## ✅ ĐÃ THÊM AWS SDK V2 VÀO POM.XML

### **Dependency đã thêm:**

```xml
<!-- AWS SDK BOM for version management -->
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
    <!-- ... other dependencies ... -->
    
    <!-- AWS SDK v2 for S3 (version managed by BOM) -->
    <dependency>
        <groupId>software.amazon.awssdk</groupId>
        <artifactId>s3</artifactId>
    </dependency>
</dependencies>
```

---

## 🔧 BƯỚC TIẾP THEO: RELOAD MAVEN

### **Cách 1: IntelliJ IDEA** (Khuyến nghị)

1. **Mở Maven panel:**
   - View → Tool Windows → Maven
   - Hoặc nhấn `Ctrl + Shift + A` → gõ "Maven"

2. **Reload project:**
   - Click icon "Reload All Maven Projects" (🔄)
   - Hoặc Right-click project → Maven → Reload Project

3. **Đợi download dependencies** (~30 giây - 2 phút)

4. **Verify:**
   - Mở `External Libraries`
   - Tìm `software.amazon.awssdk:s3:2.21.1`

---

### **Cách 2: Command Line**

```bash
# Clean và install
mvn clean install

# Hoặc chỉ download dependencies
mvn dependency:resolve

# Verify dependencies
mvn dependency:tree | grep awssdk
```

**Output mong đợi:**
```
[INFO] +- software.amazon.awssdk:s3:jar:2.21.1:compile
[INFO] |  +- software.amazon.awssdk:aws-core:jar:2.21.1:compile
[INFO] |  +- software.amazon.awssdk:aws-xml-protocol:jar:2.21.1:compile
[INFO] |  +- software.amazon.awssdk:protocol-core:jar:2.21.1:compile
...
```

---

### **Cách 3: Eclipse**

1. Right-click project
2. Maven → Update Project
3. Check "Force Update of Snapshots/Releases"
4. Click OK

---

### **Cách 4: VS Code**

1. Mở Command Palette (`Ctrl + Shift + P`)
2. Gõ: "Java: Update Project Configuration"
3. Chọn project
4. Đợi reload

---

## 🐛 TROUBLESHOOTING

### **Lỗi: "Cannot resolve symbol 'S3Client'"**

**Nguyên nhân:** Maven chưa download dependency

**Giải pháp:**
```bash
# Force reload
mvn clean install -U

# Hoặc xóa cache
rm -rf ~/.m2/repository/software/amazon/awssdk
mvn clean install
```

---

### **Lỗi: "BOM version conflict"**

**Nguyên nhân:** Có dependency khác dùng AWS SDK v1

**Giải pháp:**
```bash
# Check conflicts
mvn dependency:tree | grep amazonaws

# Exclude v1 nếu có
<dependency>
    <groupId>some-library</groupId>
    <artifactId>some-artifact</artifactId>
    <exclusions>
        <exclusion>
            <groupId>com.amazonaws</groupId>
            <artifactId>aws-java-sdk-s3</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

---

### **Lỗi: "Download failed"**

**Nguyên nhân:** Network issue hoặc Maven repository down

**Giải pháp:**
```bash
# Thử lại với verbose
mvn clean install -X

# Hoặc dùng mirror khác (settings.xml)
<mirrors>
    <mirror>
        <id>aliyun</id>
        <mirrorOf>central</mirrorOf>
        <url>https://maven.aliyun.com/repository/central</url>
    </mirror>
</mirrors>
```

---

## ✅ VERIFY INSTALLATION

### **1. Check imports trong IDE:**

```java
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
```

Nếu không có lỗi đỏ → ✅ Success!

---

### **2. Run application:**

```bash
mvn spring-boot:run
```

**Nếu thấy log:**
```
[main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port(s): 8081 (http)
[main] com.apexev.ApexevApplication             : Started ApexevApplication in X seconds
```

→ ✅ Success!

---

### **3. Test S3Service:**

```java
@SpringBootTest
class S3ServiceTest {
    
    @Autowired
    private S3Service s3Service;
    
    @Test
    void testS3ClientInjected() {
        assertNotNull(s3Service);
    }
}
```

---

## 📦 DEPENDENCY SIZE

**AWS SDK v2 S3:**
- Core: ~5MB
- Total with dependencies: ~15MB

**Download time:**
- Fast network: 30 seconds
- Slow network: 2-3 minutes

---

## 🎯 NEXT STEPS

Sau khi Maven reload xong:

1. ✅ Set AWS credentials trong `.env` hoặc `application.properties`
2. ✅ Run application
3. ✅ Test upload endpoint
4. ✅ Test view endpoint

---

## 📝 CHECKLIST

- [ ] Maven reload thành công
- [ ] Không có lỗi import trong IDE
- [ ] Application start thành công
- [ ] S3Service được inject thành công
- [ ] AWS credentials đã set
- [ ] Test API thành công

---

## 💡 TIPS

### **Speed up Maven download:**

```bash
# Parallel download (Maven 3.6+)
mvn clean install -T 4

# Skip tests
mvn clean install -DskipTests

# Offline mode (nếu đã download)
mvn clean install -o
```

### **Clear Maven cache:**

```bash
# Windows
rmdir /s /q %USERPROFILE%\.m2\repository\software\amazon\awssdk

# Linux/Mac
rm -rf ~/.m2/repository/software/amazon/awssdk

# Then reload
mvn clean install
```

---

## 🎓 KẾT LUẬN

**Dependency đã được thêm vào pom.xml!**

Bây giờ chỉ cần:
1. Reload Maven project
2. Set AWS credentials
3. Test API

Done! 🎉
