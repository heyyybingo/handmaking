import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { RateLimitInterceptor } from './common/interceptors/rate-limit.interceptor';
import { CacheInterceptor } from './common/interceptors/cache.interceptor';
import { RedisService } from './common/redis/redis.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const redisService = app.get(RedisService);
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(
    new RateLimitInterceptor(redisService),
    new CacheInterceptor(redisService),
    new LoggingInterceptor(),
  );

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('手作展示平台 API')
    .setDescription('手作展示平台后端API文档，包含小程序端和管理端接口')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.APP_PORT ?? 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();
