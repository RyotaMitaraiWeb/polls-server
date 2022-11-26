import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PollModule } from './poll/poll.module';
import { Poll } from './poll/entities/poll.entity';
import { ChoiceModule } from './choice/choice.module';
import { Choice } from './choice/entities/choice.entity';
import { PollPreviousTitle } from './poll/entities/poll-previous-title.entity';

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'wemgwenwewiowjhe',
            secretOrPrivateKey: process.env.JWT_SECRET || 'wemgwenwewiowjhe',
        }),
        ConfigModule.forRoot({
            envFilePath: './variables.env',
            isGlobal: true,
        }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.HOST || 'localhost',
            port: Number(process.env.DB_PORT) || 5432,
            username: process.env.POSTGRE_USERNAME || 'postgres',
            password: process.env.DB_PASSWORD || '1234',
            database: process.env.DB_NAME || 'test',
            entities: [User, Poll, Choice, PollPreviousTitle],
            synchronize: process.env.ENV === 'DEV',
        }),
        UserModule,
        PollModule,
        ChoiceModule,

    ],
    controllers: [AppController],
    providers: [AppService, JwtService],
})
export class AppModule { }
