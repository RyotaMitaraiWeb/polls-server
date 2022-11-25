import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { PollService } from './poll.service';
import { PollController } from './poll.controller';
import { Poll } from './entities/poll.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import { ChoiceService } from '../choice/choice.service';
import { Choice } from '../choice/entities/choice.entity';
import { NestModule } from '@nestjs/common/interfaces/modules';
import { CheckIfLogged, VerifyToken } from '../middlewares/jwt.middleware';
import { PollPreviousTitle } from './entities/poll-previous-title.entity';
import { IsAuthor, IsAuthorized } from '../middlewares/authorship.middleware';
import { HasVoted, CanVote } from '../middlewares/vote.middleware';

@Module({
    controllers: [PollController],
    providers: [PollService, UserService, JwtService, ChoiceService],
    imports: [TypeOrmModule.forFeature([Poll, PollPreviousTitle, User, Choice])]
})
export class PollModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(CheckIfLogged, VerifyToken, IsAuthor, IsAuthorized)
            .forRoutes({
                path: 'poll/:id/edit', method: RequestMethod.PATCH,
            })
            .apply(CheckIfLogged, VerifyToken, IsAuthor, IsAuthorized)
            .forRoutes({
                path: 'poll/:id/delete', method: RequestMethod.DELETE,
            })
            .apply(CheckIfLogged, VerifyToken)
            .exclude({
                path: 'poll/:id', method: RequestMethod.GET,
            }).forRoutes(PollController)
            .apply(CheckIfLogged, IsAuthor, HasVoted)
            .forRoutes({
                path: 'poll/:id', method: RequestMethod.GET,
            })
            .apply(CheckIfLogged, VerifyToken, HasVoted, CanVote)
            .forRoutes({
                path: 'poll/:pollId/vote/:choiceId', method: RequestMethod.POST,
            });
    }
}
