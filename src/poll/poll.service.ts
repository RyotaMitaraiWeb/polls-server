import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChoiceService } from '../choice/choice.service';
import { UserService } from '../user/user.service';
import { Like, Repository } from 'typeorm';
import { CreatePollDto } from './dto/create-poll.dto';
import { UpdatePollDto } from './dto/update-poll.dto';
import { Poll } from './entities/poll.entity';
import { PollPreviousTitle } from './entities/poll-previous-title.entity';
import { User } from '../user/entities/user.entity';
import { Choice } from '../choice/entities/choice.entity';

@Injectable()
export class PollService {
    @InjectRepository(Poll)
    private readonly pollRepository: Repository<Poll>;

    @InjectRepository(Choice)
    private readonly choiceRepository: Repository<Choice>;

    @InjectRepository(PollPreviousTitle)
    private readonly previousTitleRepository: Repository<PollPreviousTitle>;

    constructor(
        private readonly userService: UserService,
        private readonly choiceService: ChoiceService,
    ) { };

    async create(createPollDto: CreatePollDto, choicesInput: string[], id: number) {
        const user = await this.userService.findUserById(id);
        const poll = new Poll();

        poll.title = createPollDto.title;
        poll.description = createPollDto.description;
        poll.author = user;
        this.choiceService.validateChoiceArray(choicesInput);
        const choices = await this.choiceService.createChoices(choicesInput);
        poll.choices = choices;

        return await this.pollRepository.save(poll);
    }

    async findPollById(id: number): Promise<Poll | null> {
        const poll = await this.pollRepository.findOne({
            relations: {
                author: true,
                choices: true,
                previousTitles: true,
            },
            where: {
                id
            }
        });

        if (!poll) {
            throw new HttpException('Poll not found', HttpStatus.NOT_FOUND)
        }

        return poll;
    }

    getVoteCounts(poll: Poll) {
        return poll.choices.map(choice => {
            return {
                id: choice.id,
                content: choice.content,
                count: choice.getVoteCount()
            }
        })
    }

    async update(id: number, updatePollDto: UpdatePollDto) {
        const poll = await this.findPollById(id);
        const oldTitle: string = poll.title;
        if (oldTitle !== updatePollDto.title) {
            poll.title = updatePollDto.title;

            const previousTitle = new PollPreviousTitle();
            previousTitle.title = oldTitle;
            await this.previousTitleRepository.save(previousTitle);

            poll.previousTitles.push(previousTitle);
            poll.updateDate = previousTitle.date;
            return await this.pollRepository.save(poll);
        } else {
            return null;
        }
    }

    async remove(id: number) {
        const poll = await this.findPollById(id);
        return await this.pollRepository.remove(poll);
    }

    async vote(userId: number, choiceId: number) {
        const choice = await this.choiceRepository.findOneBy({
            id: choiceId
        });
        const user: User = await this.userService.findUserById(userId);

        if (!choice) {
            throw new HttpException('Choice does not exist', HttpStatus.NOT_FOUND);
        }

        choice.usersThatVoted.push(user);
        return await this.choiceRepository.save(choice);
    }

    async search(input: string): Promise<Poll[]> {
        const polls: Poll[] = await this.pollRepository.findBy({
            title: Like(`%${input}%`)
        });

        return polls;
    }

    async findAll(): Promise<Poll[]> {
        const polls: Poll[] = await this.pollRepository.find({
            select: {
                title: true,
                description: true,
                id: true,
            },
            order: {
                title: 'ASC',
            },
        });

        return polls;
    }
}
