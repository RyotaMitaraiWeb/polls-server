import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IRequest } from '../interfaces';
import { Response } from 'express';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post('/register')
    async create(@Body() createUserDto: CreateUserDto) {
        const user = await this.userService.create(createUserDto);
        const accessToken = await this.userService.generateToken(user);
        return {
            username: user.username,
            id: user.id,
            accessToken,
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

    @Get()
    findAll() {
        return this.userService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.userService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.update(+id, updateUserDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.userService.remove(+id);
    }
}
