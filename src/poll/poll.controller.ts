import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, HttpStatus, Query } from '@nestjs/common';
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
        } catch (error) {
            res.status(error.status).json(error).end();
        }
    }

    @Post(':pollId/vote/:choiceId')
    async vote(@Req() req: IRequest, @Res() res: Response) {

        const choiceId: number = +req.params.choiceId;
        const userId: number = req.user.id;

        await this.pollService.vote(userId, choiceId);
        res.status(HttpStatus.OK).json({
            voteId: choiceId,
        }).end();

    }

    @Get('all')
    async findAll() {
        return await this.pollService.findAll();
    }

    @Get('')
    async search(@Query('search') searchText: string) {
        return await this.pollService.search(searchText);
    }

    @Get(':id')
    async findOne(@Req() req: IRequest, @Res() res: Response, @Param('id') id: string) {
        try {
            const { title, description, author, creationDate, updateDate, previousTitles } = req.poll;
            const voteCount = this.pollService.getVoteCounts(req.poll);

            res.status(HttpStatus.OK).json({
                id: +id,
                title,
                description,
                previousTitles,
                creationDate,
                updateDate,
                author: author.username,
                isAuthor: req.isAuthor,
                voteCount,
                hasVoted: req.hasVoted,
                voteId: req.voteId,
            }).end();
        } catch (error) {
            res.status(error.status).json(error).end();
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
