import { NestMiddleware, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response, NextFunction } from 'express';
import { DecodedToken, IRequest } from '../../src/interfaces';

const blacklist = new Set<string>;

@Injectable()
export class VerifyToken implements NestMiddleware {
    async use(req: IRequest, res: Response, next: NextFunction) {
        try {
            if (req.isLogged) {
                next();
            } else {
                throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
            }
        } catch (error) {
            res.status(error.status).json(error).end();
        }
    }
}

@Injectable()
export class CheckIfLogged implements NestMiddleware {
    constructor(private readonly jwtService: JwtService) { }
    async use(req: IRequest, res: Response, next: NextFunction) {
        const token = req.headers.authorization;

        try {
            if (blacklist.has(token)) {
                throw new Error();
            }

            const user: DecodedToken = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET || 'wemgwenwewiowjhe',
            });

            req.user = user;
            req.isLogged = true;

        } catch (error) {
            req.user = null;
            req.isLogged = false;
        }

        next();
    }
}

@Injectable()
export class VerifyLackOfToken implements NestMiddleware {
    use(req: IRequest, res: Response, next: NextFunction) {
        const token = req.headers.authorization;
        try {
            if (token) {
                throw new HttpException('Token detected', HttpStatus.FORBIDDEN)
            } else {
                next();
            }
        } catch (error) {
            res.status(error.status).json(error).end();
        }
    }
}

@Injectable()
export class BlacklistToken implements NestMiddleware {
    use(req: IRequest, res: Response, next: NextFunction) {
        try {
            const token = req.headers.authorization;
        if (blacklist.has(token)) {
            throw new HttpException('Invalid token', HttpStatus.FORBIDDEN)
        } else {
            blacklist.add(token);
            next();
        }
        } catch (error) {
            res.status(error.status).json(error).end();   
        }
    }

}