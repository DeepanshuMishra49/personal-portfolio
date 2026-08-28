# Multi-stage Dockerfile for Spring Boot 3 & Java 21

# Stage 1: Build JAR using Maven
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom.xml and source files
COPY pom.xml .
COPY src ./src

# Build production JAR skipping unit tests
RUN mvn clean package -DskipTests

# Stage 2: Minimal Java 21 runtime
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copy JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port (Render sets $PORT dynamically)
EXPOSE 8085 8080

# Run Spring Boot with dynamic port mapping
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8085} -Djava.security.egd=file:/dev/./urandom -jar app.jar"]
