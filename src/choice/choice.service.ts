import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Choice } from './entities/choice.entity';

@Injectable()
export class ChoiceService {
    @InjectRepository(Choice)
    private readonly choiceRepository: Repository<Choice>;

    async create(content: string): Promise<Choice> {
        this.validateChoice(content);

        const choice = new Choice();
        choice.content = content;
        choice.usersThatVoted = [];
        return await this.choiceRepository.save(choice);
    }

    async createChoices(input: string[]): Promise<Choice[]> {
        input.sort((a, b) => a.localeCompare(b));
        const choices: Choice[] = await Promise.all(
            input.map(async choice => await this.create(choice))
        );
        return choices;
    }

    validateChoice(content: string): void {
        if (typeof content !== 'string') {
            throw new HttpException('Choice must be a string', HttpStatus.BAD_REQUEST);
        } else if (content.length < 1) {
            throw new HttpException('Choice is empty', HttpStatus.BAD_REQUEST);
        } else if (content.length > 50) {
            throw new HttpException(`Choice ${content} is over 50 characters`, HttpStatus.BAD_REQUEST);
        }
    }

    hasDuplicates(choices: string[]): boolean {
        const unique = new Set<string>(choices);
        return unique.size !== choices.length;
    }

    hasLessThanTwoChoices(choices: string[]): boolean {
        return choices.length < 2;
    }

    validateChoiceArray(choices: string[]): void {
        if (this.hasDuplicates(choices)) {
            throw new HttpException('Submission has duplicate choices', HttpStatus.BAD_REQUEST);
        } else if (this.hasLessThanTwoChoices(choices)) {
            throw new HttpException('Submission must have at least two choices', HttpStatus.BAD_REQUEST);
        } else {
            choices.forEach(this.validateChoice);
        }
    }
}
