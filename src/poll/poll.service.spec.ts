import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmSQLiteTestingModule } from '../test-db';
import { ChoiceService } from '../choice/choice.service';
import { UserService } from '../user/user.service';
import { PollService } from './poll.service';

describe('PollService', () => {
    let service: PollService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PollService, UserService, ChoiceService, JwtService],
            imports: [...TypeOrmSQLiteTestingModule()]
        }).compile();

        service = module.get<PollService>(PollService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
