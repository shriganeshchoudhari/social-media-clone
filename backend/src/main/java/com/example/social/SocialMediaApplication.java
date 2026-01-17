package com.example.social;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class SocialMediaApplication {
    public static void main(String[] args) {
        SpringApplication.run(SocialMediaApplication.class, args);
    }
}
