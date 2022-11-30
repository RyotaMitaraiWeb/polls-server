import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors({
        origin: process.env.CLIENT_PORT || '*',
    });
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
    await app.listen(3000);
}
bootstrap();
