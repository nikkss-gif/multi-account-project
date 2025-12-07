FROM maven:3.9.4-eclipse-temurin-17 as build
WORKDIR /workspace
COPY pom.xml .
COPY src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /workspace/target/worker-0.0.1-SNAPSHOT.jar /app/worker.jar
ENTRYPOINT ["java","-jar","/app/worker.jar"]
