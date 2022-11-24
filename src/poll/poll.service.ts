import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChoiceService } from '../choice/choice.service';
import { UserService } from '../user/user.service';
import { Repository } from 'typeorm';
import { CreatePollDto } from './dto/create-poll.dto';
import { UpdatePollDto } from './dto/update-poll.dto';
import { Poll } from './entities/poll.entity';
import { PollPreviousTitle } from './entities/poll-previous-title.entity';

@Injectable()
export class PollService {
    @InjectRepository(Poll)
    private readonly pollRepository: Repository<Poll>;
    
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

    findAll() {
        return `This action returns all poll`;
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

        if (poll === null) {
            throw new Error('Poll not found');
        }

        return poll;
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
            return await this.pollRepository.save(poll);
        } else {
            return null;
        }
    }

    async remove(id: number) {
        const poll = await this.findPollById(id);
        return await this.pollRepository.remove(poll);
    }
}
