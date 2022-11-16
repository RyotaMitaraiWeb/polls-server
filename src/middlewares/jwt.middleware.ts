import { NestMiddleware, Injectable, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import { DecodedToken, IRequest } from '../../src/interfaces';

const blacklist = new Set<string>;

@Injectable()
export class VerifyToken implements NestMiddleware {
    constructor(private readonly jwtService: JwtService) {}
    async use(req: IRequest, res: Response, next: NextFunction) {
        const token = req.headers.authorization;
        try {
            if (blacklist.has(token)) {
                throw new Error()
            }

            const user: DecodedToken = await this.jwtService.verifyAsync(token);
            req.user = user;
            next();
            
        } catch (error) {
            res.status(HttpStatus.UNAUTHORIZED).json({
                statusCode: HttpStatus.UNAUTHORIZED,
                message: ['Invalid token'],
                error: 'Invalid token'
            }).end();
        }
    }

}

@Injectable()
export class VerifyLackOfToken implements NestMiddleware {
    use(req: IRequest, res: Response, next: NextFunction) {
        const token = req.headers.authorization;
        if (token) {
            res.status(HttpStatus.FORBIDDEN).json({
                error: 'Token detected',
                statusCode: HttpStatus.FORBIDDEN,
                message: ['Token detected'],
            }).end();
        } else {
            next();
        }
    }
}

@Injectable()
export class BlacklistToken implements NestMiddleware {
    use(req: IRequest, res: Response, next: NextFunction) {
        const token = req.headers.authorization;
        if (blacklist.has(token)) {
            res.status(HttpStatus.FORBIDDEN).json({
                statusCode: HttpStatus.FORBIDDEN,
                error: 'Token already blacklisted',
                message: ['Token is already blacklisted']
            });
        } else {
            blacklist.add(token);
            next();
        }
    }

}