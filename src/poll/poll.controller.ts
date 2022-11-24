import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { PollService } from './poll.service';
import { CreatePollDto } from './dto/create-poll.dto';
import { UpdatePollDto } from './dto/update-poll.dto';
import { IRequest } from '../interfaces';

@Controller('poll')
export class PollController {
    constructor(
        private readonly pollService: PollService) { }

    @Post('/create')
    async create(@Req() req: IRequest, @Res() res: Response, @Body() createPollDto: CreatePollDto) {
        try {
            const id = req.user.id;

            const poll = await this.pollService.create(createPollDto, req.body.choices, id);
            res.status(HttpStatus.CREATED).json({
                id: poll.id,
                statusCode: HttpStatus.CREATED,
            }).end();
        } catch (err) {
            res.status(HttpStatus.BAD_REQUEST).json({
                error: 'Invalid poll',
                message: [err.message],
                statusCode: HttpStatus.BAD_REQUEST
            }).end();
        }
    }

    @Get()
    findAll() {
        return this.pollService.findAll();
    }

    @Get(':id')
    async findOne(@Req() req: IRequest, @Res() res: Response, @Param('id') id: string) {
        try {
            const { title, description, author, choices, previousTitles } = req.poll;            
            
            res.status(HttpStatus.OK).json({
                id: +id,
                title,
                description,
                choices,
                previousTitles,
                author: author.username,
                isAuthor: req.isAuthor,
            }).end();
        } catch (err) {
            res.status(HttpStatus.NOT_FOUND).json({
                error: 'Poll does not exist',
                message: [err.message],
                statusCode: HttpStatus.NOT_FOUND,
            }).end();
        }
    }

    @Patch(':id/edit')
    async update(@Param('id') id: string, @Body() updatePollDto: UpdatePollDto) {
        const poll = await this.pollService.update(+id, updatePollDto);
        return {
            statusCode: HttpStatus.OK,
            id: +id,
        }
    }

    @Delete(':id/delete')
    async remove(@Param('id') id: string) {
        await this.pollService.remove(+id);
        return {};
    }
}
