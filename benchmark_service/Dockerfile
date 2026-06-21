FROM eclipse-temurin:21-jdk AS build
WORKDIR /workspace

COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle* ./

RUN chmod +x gradlew

RUN ./gradlew dependencies --no-daemon || true

COPY --from=protos benchmark ../proto/benchmark
COPY src src

RUN ./gradlew clean bootJar --no-daemon -x test

FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

RUN addgroup -S app && adduser -S app -G app

COPY --from=build /workspace/build/libs/*.jar application.jar

USER app

EXPOSE 9090

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-jar", \
  "application.jar"]