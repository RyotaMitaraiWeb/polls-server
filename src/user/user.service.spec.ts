import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmSQLiteTestingModule } from '../test-db';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';

describe('UserService', () => {
    let service: UserService;
    let user: CreateUserDto;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [UserService, JwtService],
            imports: [...TypeOrmSQLiteTestingModule()]
        }).compile();

        service = module.get<UserService>(UserService);
        user = new CreateUserDto();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('Creates user DTO successfully', () => {
        user.username = 'ryota1';
        user.password = '123456';
        expect(user.username).toBe('ryota1');
        expect(user.password).toBe('123456')
    });

    it('Hashes password before insert', async () => {
        user.username = 'ryota1';
        user.password = '123456'
        const registeredUser = await service.create(user);
        expect(registeredUser.password.length).toBeGreaterThan(10); // simply make sure it's hashed, no need to look for specific hash
    });

    it('Generates token successfully', async () => {
        user.username = 'ryota1';
        user.password = '123456';
        const registeredUser = await service.create(user);
        const token = await service.generateToken(registeredUser);
        expect(token.length).toBeGreaterThan(10);
    });

    it('findUserByUsername works', async () => {
        user.username = 'ryota1';
        user.password = '123456';

        const registeredUser = await service.create(user);
        const found = await service.findUserByUsername('ryota1');
        expect(found.username).toBe('ryota1');
        expect(found.id).toBe(1);
    });

    it('findUserById works', async () => {
        user.username = 'ryota1';
        user.password = '123456';

        const registeredUser = await service.create(user);
        const found = await service.findUserById(1);
        expect(found.username).toBe('ryota1');
        expect(found.id).toBe(1);
    })
});