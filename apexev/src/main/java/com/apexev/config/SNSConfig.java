package com.apexev.config;

import com.amazonaws.auth.DefaultAWSCredentialsProviderChain;
import com.amazonaws.services.sns.AmazonSNS;
import com.amazonaws.services.sns.AmazonSNSClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class SNSConfig {

    @Value("${aws.sns.region:ap-southeast-1}")
    private String region;

    @Bean
    public AmazonSNS amazonSNS() {
        log.info("Initializing AmazonSNS client with region: {}", region);
        
        return AmazonSNSClientBuilder
                .standard()
                .withRegion(region)
                .withCredentials(new DefaultAWSCredentialsProviderChain())
                .build();
    }
}
