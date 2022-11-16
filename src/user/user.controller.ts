import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IRequest } from '../interfaces';
import { Response } from 'express';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post('/register')
    async create(@Res() res: Response, @Body() createUserDto: CreateUserDto) {
        const user = await this.userService.create(createUserDto);
        
        if (user === null) {
            res.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                error: 'Existing user',
                message: ['User already exists'],
            })
        } else {
            const accessToken = await this.userService.generateToken(user);
            res.status(HttpStatus.CREATED).json({
                id: user.id,
                username: user.username,
                accessToken
            });
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
            res.status(HttpStatus.UNAUTHORIZED).json({
                statusCode: HttpStatus.UNAUTHORIZED,
                message: error.message,
                error: 'Failed login',
            }).end();
        }
    }

    @Delete('/logout')
    logout(@Req() req: IRequest, @Res() res: Response) {
        res.status(HttpStatus.NO_CONTENT).json({
            statusCode: HttpStatus.NO_CONTENT
        });
    }
}
