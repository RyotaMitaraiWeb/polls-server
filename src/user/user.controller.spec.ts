import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmSQLiteTestingModule } from '../test-db';
import { CreateUserDto } from './dto/create-user.dto';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { IRequestError, IUserBody } from '../interfaces';
import { JwtService } from '@nestjs/jwt';
import { UserModule } from './user.module';

describe('UserController', () => {
    let controller: UserController;
    let user: CreateUserDto;
    let service: UserService;
    const registerEndpoint = '/user/register';
    const loginEndpoint = '/user/login';
    const logoutEndpoint = '/user/logout';
    const isLoggedInEndpoint = '/user/isLogged';
    let app: INestApplication;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [...TypeOrmSQLiteTestingModule(), UserModule],
            controllers: [UserController],
            providers: [UserService, JwtService],
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
        expect(data.body.id).toBe(1);
        expect(data.body.accessToken.length).toBeGreaterThan(10);
    });

    it('Fails to register if username already exists', async () => {
        const data: IUserBody = await request(app.getHttpServer()).post(registerEndpoint).send({
            username: 'ryota1',
            password: '123456',
        });

        const data1: IUserBody = await request(app.getHttpServer()).post(registerEndpoint).send({
            username: 'ryota1',
            password: '123456',
        }).expect(HttpStatus.BAD_REQUEST);
        
    });

    it('Fails to register when username is shorter than 5 letters', async () => {
        const data: IRequestError = await request(app.getHttpServer()).post(registerEndpoint)
        .send({
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

    it('Fails to register if a token is detected', async () => {
        const data: IRequestError = await request(app.getHttpServer()).post(registerEndpoint).send({
            username: 'ryota1',
            password: '123456',
        })
        .set('Authorization', 'a')
        .expect(HttpStatus.FORBIDDEN);
    });

    it('Successful login', async () => {
        const data: IUserBody = await request(app.getHttpServer()).post(registerEndpoint).send({
            username: 'ryota1',
            password: '123456',
        });

        const login: IUserBody = await request(app.getHttpServer()).post(loginEndpoint).send({
            username: 'ryota1',
            password: '123456',
        }).expect(HttpStatus.OK);

        expect(login.body.id).toBe(1);
        expect(login.body.username).toBe('ryota1');
        expect(login.body.accessToken).toBeTruthy();
    });

    it('Failed login due to non-existant username', async () => {
        const login: IUserBody = await request(app.getHttpServer()).post(loginEndpoint).send({
            username: 'ryota1',
            password: '123456',
        }).expect(HttpStatus.UNAUTHORIZED);
    });

    it('Failed login due to wrong password', async () => {
        const data: IUserBody = await request(app.getHttpServer()).post(registerEndpoint).send({
            username: 'ryota1',
            password: '123456',
        });

        const login: IUserBody = await request(app.getHttpServer()).post(loginEndpoint).send({
            username: 'ryota1',
            password: '1234567',
        }).expect(HttpStatus.UNAUTHORIZED);
    });

    it('Failed login due to a presence of a token', async () => {
        const login: IUserBody = await request(app.getHttpServer()).post(loginEndpoint).send({
            username: 'ryota1',
            password: '123456',
        })
        .set('Authorization', 'a')
        .expect(HttpStatus.FORBIDDEN);
    });

    it('Logs out successfully', async () => {
        const register: IUserBody = await request(app.getHttpServer()).post(registerEndpoint).send({
            username: 'ryota1',
            password: '123456',
        });

        const token = register.body.accessToken;
        const logout = await request(app.getHttpServer()).delete(logoutEndpoint)
        .set('Authorization', token)
        .expect(HttpStatus.NO_CONTENT);
    });

    it('Failed logout due to no token', async () => {
        const logout = await request(app.getHttpServer()).delete(logoutEndpoint)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('Blacklisted token stops request', async () => {
        const register: IUserBody = await request(app.getHttpServer()).post(registerEndpoint).send({
            username: 'ryota1',
            password: '123456',
        });

        const token = register.body.accessToken;
        const logout = await request(app.getHttpServer()).delete(logoutEndpoint)
        .set('Authorization', token)

        const failedLogout = await request(app.getHttpServer()).delete(logoutEndpoint)
        .set('Authorization', token)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('Successfully checks that the user is logged in', async () => {
        const register: IUserBody = await request(app.getHttpServer()).post(registerEndpoint).send({
            username: 'ryota55', // needs to be different from "ryota1" due to blacklist keeping track of JWT tokens during tests
            password: '123456',
        });

        const token = register.body.accessToken;        
        const status = await request(app.getHttpServer()).post(isLoggedInEndpoint)
        .set('Authorization', token)
        .expect(HttpStatus.OK);
    });

    it('Successfully checks that the user is NOT logged in', async () => {
        const status = await request(app.getHttpServer()).post(isLoggedInEndpoint)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    afterEach(async () => {
        await app.close();
    });
});


