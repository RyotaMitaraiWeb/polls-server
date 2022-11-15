import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmSQLiteTestingModule } from '../test-db';
import { CreateUserDto } from './dto/create-user.dto';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { IRequestError, IUserBody } from 'src/interfaces';

describe('UserController', () => {
    let controller: UserController;
    let user: CreateUserDto;
    let service: UserService;
    const registerEndpoint = '/user/register';
    let app: INestApplication;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [...TypeOrmSQLiteTestingModule()],
            controllers: [UserController],
            providers: [UserService],
        }).compile();

        controller = module.get<UserController>(UserController);
        service = module.get<UserService>(UserService);
        user = new CreateUserDto();
        app = module.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
        await app.init();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('Registers user successfully', async () => {
        const data: IUserBody = await request(app.getHttpServer()).post(registerEndpoint).send({
            username: 'ryota1',
            password: '123456',
        }).expect(HttpStatus.CREATED);
        expect(data.body.username).toBe('ryota1');
        expect(data.body.password.length).toBeGreaterThan(10);
        expect(data.body.id).toBe(1);
    });

    it('Fails to register when username is shorter than 5 letters', async () => {
        const data: IRequestError = await request(app.getHttpServer()).post(registerEndpoint).send({
            username: 'abcd',
            password: '123456',
        }).expect(HttpStatus.BAD_REQUEST);
    });

    it('Fails to register when username is longer than 10 letters', async () => {
        const data: IRequestError = await request(app.getHttpServer()).post(registerEndpoint).send({
            username: '1234567890a',
            password: '123456',
        }).expect(HttpStatus.BAD_REQUEST);
    });

    it('Fails to register when password is shorter than 6 letters', async () => {
        const data: IRequestError = await request(app.getHttpServer()).post(registerEndpoint).send({
            username: 'ryota1',
            password: '1',
        }).expect(HttpStatus.BAD_REQUEST);
    });

    it('Fails to register if non-strings are passed', async () => {
        const data1: IRequestError = await request(app.getHttpServer()).post(registerEndpoint).send({
            username: 1,
            password: '123456',
        }).expect(HttpStatus.BAD_REQUEST);

        const data2: IRequestError = await request(app.getHttpServer()).post(registerEndpoint).send({
            username: 'ryota1',
            password: 1,
        }).expect(HttpStatus.BAD_REQUEST);
    });

    afterEach(async () => {
        await app.close();
    });
});


