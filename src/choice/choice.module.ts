import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChoiceService } from './choice.service';
import { Choice } from './entities/choice.entity';

@Module({
    providers: [ChoiceService, Repository<Choice>],
    imports: [TypeOrmModule.forFeature([Choice])]
})
export class ChoiceModule { }
