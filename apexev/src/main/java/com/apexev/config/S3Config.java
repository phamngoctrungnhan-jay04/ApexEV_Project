package com.apexev.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider; // Import cái này
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

@Configuration
public class S3Config {

    @Value("${aws.s3.region}")
    private String region;

    // BỎ 2 biến access-key và secret-key đi

    @Bean
    public S3Client s3Client() {
        // DefaultCredentialsProvider sẽ tự động tìm kiếm credential theo thứ tự:
        // 1. Biến môi trường (AWS_ACCESS_KEY_ID...)
        // 2. Java System Properties
        // 3. Credential profile file (~/.aws/credentials)
        // 4. Container Credentials (ECS Task Role) -> ĐÂY LÀ CÁI FARGATE DÙNG!
        return S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }

    @Bean
    public S3Presigner s3Presigner() {
        return S3Presigner.builder()
                .region(Region.of(region))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }
}