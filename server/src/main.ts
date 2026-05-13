import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

/**
 * 应用启动入口
 * 配置全局管道、Swagger文档、CORS等
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局API前缀
  app.setGlobalPrefix('api');

  // 全局验证管道，启用class-validator自动校验
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 启用CORS（小程序端和Web管理后台跨域访问）
  app.enableCors();

  // Swagger API文档配置
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
