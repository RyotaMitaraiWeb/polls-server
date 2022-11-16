import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity'
import { Repository } from 'typeorm';
import { VerifyLackOfToken, VerifyToken } from 'src/middlewares/jwt.middleware';
@Module({
    imports: [TypeOrmModule.forFeature([User])],
    controllers: [UserController],
    providers: [UserService, Repository<User>]
})
export class UserModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(VerifyToken).forRoutes({
                path: 'user/logout', method: RequestMethod.POST,
            })
            .apply(VerifyLackOfToken).forRoutes({
                path: 'user/login', method: RequestMethod.POST
            })
            .apply(VerifyLackOfToken).forRoutes({
                path: 'user/register', method: RequestMethod.POST
            })
    }
}
