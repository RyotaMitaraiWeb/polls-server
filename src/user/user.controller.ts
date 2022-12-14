import { Controller, Get, Post, Body, Delete, Req, Res, HttpStatus, Param, HttpException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { IRequest } from '../interfaces';
import { Response } from 'express';
import { User } from './entities/user.entity';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get(':username')
    async findUserByUsername(@Param('username') username: string, @Res() res: Response) {
        try {
            const user: User = await this.userService.findUserByUsername(username);
            if (!user) {
                throw new HttpException('User does not exist', HttpStatus.BAD_REQUEST);
            }

            res.status(HttpStatus.OK).end();

        } catch (error) {
            res.status(error.status).json(error).end();
        }
    }

    @Post('isLogged')
    async checkIfLogged(@Req() req: IRequest, @Res() res: Response) {        
        const user = req?.user;
        const statusCode: number = req.isLogged ? HttpStatus.OK : HttpStatus.BAD_REQUEST
        res.status(statusCode).json({
            username: user?.username,
            id: user?.id,
            statusCode,
        });
    }

    @Post('register')
    async create(@Res() res: Response, @Body() createUserDto: CreateUserDto) {
        try {
            const user = await this.userService.create(createUserDto);
            const accessToken = await this.userService.generateToken(user);
            res.status(HttpStatus.CREATED).json({
                id: user.id,
                username: user.username,
                accessToken,
            }).end();
        } catch (error) {
            res.status(error.status).json(error).end();
        }
    }

    @Post('login')
    async login(@Res() res: Response, @Body() createUserDto: CreateUserDto) {
        const user = await this.userService.findUserByUsername(createUserDto.username);

        try {
            await this.userService.comparePasswords(user, createUserDto.password);
            const accessToken = await this.userService.generateToken(user);
            res.status(HttpStatus.OK).json({
                id: user.id,
                username: user.username,
                accessToken
            });
        } catch (error) {
            res.status(error.status).json(error).end();
        }
    }

    @Delete('logout')
    logout(@Req() req: IRequest, @Res() res: Response) {
        res.status(HttpStatus.NO_CONTENT).json({
            statusCode: HttpStatus.NO_CONTENT
        });
    }
}
