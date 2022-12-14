import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity'
import { BlacklistToken, CheckIfLogged, VerifyLackOfToken, VerifyToken } from '../middlewares/jwt.middleware';
import { JwtService } from '@nestjs/jwt';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    controllers: [UserController],
    providers: [UserService, JwtService]
})
export class UserModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(CheckIfLogged, VerifyToken, BlacklistToken).forRoutes({
                path: 'user/logout', method: RequestMethod.DELETE,
            })
            .apply(VerifyLackOfToken).forRoutes({
                path: 'user/login', method: RequestMethod.POST,
            })
            .apply(VerifyLackOfToken).forRoutes({
                path: 'user/register', method: RequestMethod.POST,
            })
            .apply(CheckIfLogged).forRoutes({
                path: 'user/isLogged', method: RequestMethod.POST,
            })
    }
}
