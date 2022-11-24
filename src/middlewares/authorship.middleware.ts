import { NestMiddleware, Injectable, HttpStatus, Req, Res, Next } from '@nestjs/common';
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
            
            req.isAuthor = poll.author.id === userId;
            req.poll = poll;
            next();
        } catch (err) {
            res.status(HttpStatus.NOT_FOUND).json({
                error: 'Poll does not exist',
                message: [err.message],
                statusCode: HttpStatus.NOT_FOUND,
            }).end();
        }
    }
}

@Injectable()
export class IsAuthorized implements NestMiddleware {
    constructor(private readonly pollService: PollService) { }
    async use(@Req() req: IRequest, @Res() res: Response, @Next() next: NextFunction) {
        if (req.isAuthor) {
            next();
        } else {
            res.status(HttpStatus.FORBIDDEN).json({
                error: 'Not author',
                message: ['You are not the author of the entry'],
                statusCode: HttpStatus.FORBIDDEN,
            }).end();
        }
    }
}