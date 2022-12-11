import { NestMiddleware, Injectable, HttpStatus, Req, Res, Next, HttpException } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { PollService } from '../poll/poll.service';
import { DecodedToken, IRequest } from '../../src/interfaces';

/** This middleware attaches the requested poll and whether the user requesting it is its author
 * to the request object.
 * If the poll or choice does not exist, the request is blocked. If the user is not logged in, 
 * the middleware assumes that they are not the author.
 */
@Injectable()
export class IsAuthor implements NestMiddleware {
    constructor(private readonly pollService: PollService) { }
    async use(@Req() req: IRequest, @Res() res: Response, @Next() next: NextFunction) {
        try {
            const user: DecodedToken = req.user;
            const userId: number = user?.id;
            const pollId: number = Number(req.params.id);
            const poll = await this.pollService.findPollById(pollId);

            req.isAuthor = poll?.author?.id === userId;
            req.poll = poll;
            next();
        } catch (error) {
            res.status(error.status).json(error).end();
        }
    }
}

/** This middleware blocks requests from any user that is not the author of the requested poll.
 * This requires information from the IsAuthor middleware
*/
@Injectable()
export class IsAuthorized implements NestMiddleware {
    constructor(private readonly pollService: PollService) { }
    async use(@Req() req: IRequest, @Res() res: Response, @Next() next: NextFunction) {
        try {
            if (req.isAuthor) {
                next();
            } else {
                throw new HttpException('User is not the author of the entry', HttpStatus.FORBIDDEN);
            }
        } catch (error) {
            res.status(error.status).json(error).end();
        }
    }
}