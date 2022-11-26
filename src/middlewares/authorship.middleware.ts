import { NestMiddleware, Injectable, HttpStatus, Req, Res, Next, HttpException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response, NextFunction } from 'express';
import { PollService } from '../poll/poll.service';
import { DecodedToken, IRequest } from '../../src/interfaces';

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