import { NestMiddleware, Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { Poll } from '../poll/entities/poll.entity';
import { DecodedToken, IRequest } from '../../src/interfaces';
import { Choice } from '../choice/entities/choice.entity';
import { User } from '../user/entities/user.entity';
import { PollService } from '../poll/poll.service';

/** This middleware attaches information about which choice the user voted for in the requested poll.
 * If the user has not voted (or is a guest), voteId will be -1 and hasVoted will be false.
 * If the poll does not exist, the request is blocked
*/
@Injectable()
export class HasVoted implements NestMiddleware {
    constructor(private readonly pollService: PollService) { }
    async use(req: IRequest, res: Response, next: NextFunction) {
        try {
            const user: DecodedToken = req.user;

            const poll: Poll = await this.pollService.findPollById(+req.params.pollId || +req.params.id);
            const choices: Choice[] = poll.choices;

            req.hasVoted = false;
            req.voteId = -1;
            if (user !== null) {
                for (const choice of choices) {
                    const usersThatVoted: User[] = choice.usersThatVoted;

                    const userVote: User | undefined = usersThatVoted.find((userVote: User) => user.id === userVote.id);
                    if (userVote) {
                        req.hasVoted = true;
                        req.voteId = choice.id;
                        break;
                    }
                }
            }

            next();
        } catch (error) {
            res.status(error.status).json(error).end();
        }
    }
}

/** This middleware blocks a user from voting on a poll on which they have already voted. */
export class CanVote implements NestMiddleware {
    use(req: IRequest, res: Response, next: NextFunction) {
        try {
            if (req.hasVoted) {
                throw new HttpException('User has already voted', HttpStatus.FORBIDDEN)
            } else {
                next();
            }
        } catch (error) {
            res.status(error.status).json(error).end();
        }
    }

}