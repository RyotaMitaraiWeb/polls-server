import { Controller, Get, Post, Body, Delete, Req, Res, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { IRequest } from '../interfaces';
import { Response } from 'express';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post('/isLogged')
    async checkIfLogged(@Req() req: IRequest, @Res() res: Response) {
        const user = req?.user;
        res.status(HttpStatus.OK).json({
            username: user?.username,
            id: user?.id,
            statusCode: HttpStatus.OK,
            loggedIn: req.isLogged,
        })
    }

    @Post('/register')
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

    @Post('/login')
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

    @Delete('/logout')
    logout(@Req() req: IRequest, @Res() res: Response) {
        res.status(HttpStatus.NO_CONTENT).json({
            statusCode: HttpStatus.NO_CONTENT
        });
    }
}
