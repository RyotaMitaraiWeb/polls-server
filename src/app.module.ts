import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';


@Module({
    imports: [
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
            synchronize: process.env.ENV === 'DEV',
        }),

    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
