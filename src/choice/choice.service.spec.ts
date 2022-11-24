import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmSQLiteTestingModule } from '../test-db';
import { ChoiceService } from './choice.service';

describe('ChoiceService', () => {
    let service: ChoiceService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ChoiceService],
            imports: [...TypeOrmSQLiteTestingModule()]
        }).compile();

        service = module.get<ChoiceService>(ChoiceService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('validateChoice validates a valid choice', () => {
        expect(() => service.validateChoice('a')).not.toThrowError();
    });

    it('validateChoice throws an error for an empty choice', () => {
        expect(() => service.validateChoice('')).toThrowError();
    });

    it('validateChoice throws an error for a choice longer than 50 characters', () => {
        expect(() => service.validateChoice('a'.repeat(51))).toThrowError();
    });
    
    it('hasDuplicates returns true for an array of choices with duplicates', () => {
        expect(service.hasDuplicates(['a', 'b'])).toBe(false);
    });

    it('hasDuplicates returns false for an array of choices with duplicates', () => {
        expect(service.hasDuplicates(['a', 'a'])).toBe(true);
    });

    it('hasLessThanTwoChoices returns false for a valid array of choices', () => {
        expect(service.hasLessThanTwoChoices(['a', 'b'])).toBe(false);
    });

    it('hasLessThanTwoChoices returns true for an invalid array of choices', () => {
        expect(service.hasLessThanTwoChoices(['a'])).toBe(true);
        expect(service.hasLessThanTwoChoices([])).toBe(true);
    });
});
