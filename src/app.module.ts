import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'wemgwenwewiowjhe',
            secretOrPrivateKey: process.env.JWT_SECRET || 'wemgwenwewiowjhe',
        }),
        ConfigModule.forRoot({
            envFilePath: '../variables.env',
            isGlobal: true,
        }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.HOST || 'localhost',
            port: Number(process.env.PORT) || 5432,
            username: process.env.POSTGRE_USERNAME || 'postgres',
            password: process.env.DB_PASSWORD || '1234',
            database: 'test',
            entities: [User],
            synchronize: process.env.ENV === 'DEV',
        }),
        UserModule,

    ],
    controllers: [AppController],
    providers: [AppService, JwtService],
})
export class AppModule { }
