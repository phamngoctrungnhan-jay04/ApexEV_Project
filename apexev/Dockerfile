# ==========================================
# Multi-stage Dockerfile for ApexEV Spring Boot Application
# ==========================================
# This Dockerfile uses multi-stage build to create a smaller, more secure image
# Stage 1: Build the application with Maven
# Stage 2: Run the application with JRE only

# ==========================================
# STAGE 1: Build Stage
# ==========================================
FROM maven:3.9-eclipse-temurin-17 AS build

# Set working directory
WORKDIR /app

# Copy pom.xml first to leverage Docker cache
# Dependencies will be cached if pom.xml doesn't change
COPY pom.xml .

# Download dependencies (this layer will be cached)
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
# -DskipTests: Skip tests for faster build (run tests in CI/CD instead)
# -B: Batch mode (non-interactive)
RUN mvn clean package -DskipTests -B

# ==========================================
# STAGE 2: Runtime Stage
# ==========================================
FROM eclipse-temurin:17-jre-alpine

# Install wget for health check
RUN apk add --no-cache wget

# Set working directory
WORKDIR /app

# Create a non-root user for security best practices
RUN addgroup -S spring && adduser -S spring -G spring

# Copy the jar file from build stage
COPY --from=build /app/target/*.jar app.jar

# Change ownership to spring user
RUN chown spring:spring app.jar

# Switch to non-root user
USER spring:spring

# Expose port 8080 (default for production)
EXPOSE 8080

# Health check for Docker and AWS ECS
# This will check if the application is healthy every 30 seconds
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Run the application
# -Dspring.profiles.active=prod: Use production profile
# -Djava.security.egd=file:/dev/./urandom: Faster startup (non-blocking entropy source)
ENTRYPOINT ["java", \
    "-Dspring.profiles.active=prod", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", \
    "app.jar"]
