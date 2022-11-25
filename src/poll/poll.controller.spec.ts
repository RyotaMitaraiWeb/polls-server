import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { ChoiceModule } from '../choice/choice.module';
import { ChoiceService } from '../choice/choice.service';
import { UserService } from '../user/user.service';
import { PollController } from './poll.controller';
import { PollService } from './poll.service';
import { TypeOrmSQLiteTestingModule } from '../test-db';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { CreatePollDto } from './dto/create-poll.dto';
import * as request from 'supertest';
import { IPollBody, IUserBody, IVoteCount } from '../interfaces';
import { UserController } from '../user/user.controller';
import { PollModule } from './poll.module';
import { UserModule } from '../user/user.module';
import { Repository } from 'typeorm';
import { PollPreviousTitle } from './entities/poll-previous-title.entity';

describe('PollController', () => {
    let controller: PollController;
    let app: INestApplication;
    let pollDto: CreatePollDto;
    let user: IUserBody;
    let token: string;
    let server: any;

    let createEndpoint = '/poll/create';

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PollController, UserController],
            providers: [PollService, UserService, JwtService, ChoiceService],
            imports: [...TypeOrmSQLiteTestingModule(), PollModule, UserModule, ChoiceModule]
        }).compile();

        controller = module.get<PollController>(PollController);
        app = module.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
        await app.init();
        pollDto = new CreatePollDto();

        server = app.getHttpServer();
        user = await request(server).post('/user/register').send({
            username: 'ryota1',
            password: '123456',
        });

        token = user.body.accessToken;
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('Creates poll successfully (with empty description)', async () => {
        const poll: IPollBody = await request(server).post(createEndpoint)
            .set('Authorization', token)
            .send({
                title: '12345',
                description: '',
                choices: ['a', 'b']
            })
            .expect(HttpStatus.CREATED);
        expect(poll.body.id).toBe(1);
    });

    it('Fails to create poll due to invalid token', async () => {
        const poll: IPollBody = await request(server).post(createEndpoint)
            .set('Authorization', 'a')
            .send({
                title: '12345',
                description: '',
                choices: ['a', 'b']
            })
            .expect(HttpStatus.UNAUTHORIZED);
    });

    it('Fails to create poll due to a title shorter than 5 characters', async () => {
        const poll: IPollBody = await request(server).post(createEndpoint)
            .set('Authorization', token)
            .send({
                title: '1',
                description: '',
                choices: ['a', 'b']
            })
            .expect(HttpStatus.BAD_REQUEST);
    });

    it('Fails to create poll due to a title over 100 characters', async () => {
        const poll: IPollBody = await request(server).post(createEndpoint)
            .set('Authorization', token)
            .send({
                title: '1'.repeat(101),
                description: '',
                choices: ['a', 'b']
            })
            .expect(HttpStatus.BAD_REQUEST);
    });

    it('Fails to create poll due to description longer than 500 characters', async () => {
        const poll: IPollBody = await request(server).post(createEndpoint)
            .set('Authorization', token)
            .send({
                title: '12345',
                description: '1'.repeat(501),
                choices: ['a', 'b']
            })
            .expect(HttpStatus.BAD_REQUEST);
    });

    it('Fails to create poll due to fewer than two choices', async () => {
        const poll: IPollBody = await request(server).post(createEndpoint)
            .set('Authorization', token)
            .send({
                title: '12345',
                description: '',
                choices: ['a']
            })
            .expect(HttpStatus.BAD_REQUEST);
    });

    it('Fails to create poll due to duplicate choices', async () => {
        const poll: IPollBody = await request(server).post(createEndpoint)
            .set('Authorization', token)
            .send({
                title: '12345',
                description: '',
                choices: ['a', 'a']
            })
            .expect(HttpStatus.BAD_REQUEST);
    });

    it('Fails to create poll due to non-string choice', async () => {
        const poll: IPollBody = await request(server).post(createEndpoint)
            .set('Authorization', token)
            .send({
                title: '12345',
                description: '',
                choices: ['a', []]
            })
            .expect(HttpStatus.BAD_REQUEST);
    });

    it('Fails to create poll due to an empty choice', async () => {
        const poll: IPollBody = await request(server).post(createEndpoint)
            .set('Authorization', token)
            .send({
                title: '12345',
                description: '',
                choices: ['a', '']
            })
            .expect(HttpStatus.BAD_REQUEST);
    });

    it('Fails to create poll due to a choice longer than 50 characters', async () => {
        const poll: IPollBody = await request(server).post(createEndpoint)
            .set('Authorization', token)
            .send({
                title: '12345',
                description: '',
                choices: ['a', 'b'.repeat(51)]
            })
            .expect(HttpStatus.BAD_REQUEST);
    });

    it('Gets a poll successfully (no token)', async () => {
        const result: IPollBody = await request(server).post(createEndpoint)
            .set('Authorization', token)
            .send({
                title: '12345',
                description: '',
                choices: ['a', 'b']
            });

        const poll: IPollBody = await request(server)
            .get('/poll/' + result.body.id)
            .expect(HttpStatus.OK);

        expect(poll.body.id).toBe(1);
        expect(poll.body.title).toBe('12345');
        expect(poll.body.description).toBe('');
        expect(poll.body.voteCount.length).toBe(2);
        expect(poll.body.author).toBe('ryota1');
        expect(poll.body.hasVoted).toBe(false);
        expect(poll.body.voteId).toBe(-1);
    });

    it('Fails to get non-existant poll', async () => {
        const poll: IPollBody = await request(server)
            .get('/poll/6')
            .expect(HttpStatus.NOT_FOUND);
    });

    it('Edits poll successfully', async () => {
        const poll: IPollBody = await request(server).post('/poll/create')
            .set('Authorization', token)
            .send({
                title: '12345',
                description: '',
                choices: ['a', 'b'],
            });

        const newPoll: IPollBody = await request(server).patch(`/poll/${poll.body.id}/edit`)
            .set('Authorization', token)
            .send({
                title: '123456'
            }).expect(HttpStatus.OK);

        const editedPoll: IPollBody = await request(server).get('/poll/' + newPoll.body.id);

        expect(editedPoll.body.title).toBe('123456');
        expect(editedPoll.body.previousTitles.length).toBe(1);
    });

    it('Does not edit poll (silent fail) if title is the same', async () => {
        const poll: IPollBody = await request(server).post('/poll/create')
            .set('Authorization', token)
            .send({
                title: '12345',
                description: '',
                choices: ['a', 'b'],
            });

        const newPoll: IPollBody = await request(server).patch(`/poll/${poll.body.id}/edit`)
            .set('Authorization', token)
            .send({
                title: '12345'
            }).expect(HttpStatus.OK);

        const editedPoll: IPollBody = await request(server).get('/poll/' + newPoll.body.id);

        expect(editedPoll.body.title).toBe('12345');
        expect(editedPoll.body.previousTitles.length).toBe(0);
    });

    it('Does not edit poll if title is invalid', async () => {
        const poll: IPollBody = await request(server).post('/poll/create')
            .set('Authorization', token)
            .send({
                title: '12345',
                description: '',
                choices: ['a', 'b'],
            });

        const newPoll: IPollBody = await request(server).patch(`/poll/${poll.body.id}/edit`)
            .set('Authorization', token)
            .send({
                title: '1'
            }).expect(HttpStatus.BAD_REQUEST);
    });

    it('Does not edit poll if user is not its author', async () => {
        const poll: IPollBody = await request(server).post('/poll/create')
            .set('Authorization', token)
            .send({
                title: '12345',
                description: '',
                choices: ['a', 'b'],
            });

        const newUser: IUserBody = await request(server).post('/user/register').send({
            username: 'ryota2',
            password: '123456',
        });

        const newPoll = await request(server).patch(`/poll/${poll.body.id}/edit`)
            .set('Authorization', newUser.body.accessToken)
            .send({
                title: 'valid title'
            }).expect(HttpStatus.FORBIDDEN);
    });

    it('Deletes poll successfully', async () => {
        const poll: IPollBody = await request(server).post('/poll/create')
            .set('Authorization', token)
            .send({
                title: '12345',
                description: '',
                choices: ['a', 'b'],
            });

        const deletedPoll = await request(server).delete(`/poll/${poll.body.id}/delete`)
            .set('Authorization', token)
            .expect(HttpStatus.OK);
    });

    it('Fails to delete poll if the user is not its author', async () => {
        const poll: IPollBody = await request(server).post('/poll/create')
            .set('Authorization', token)
            .send({
                title: '12345',
                description: '',
                choices: ['a', 'b'],
            });

        const newUser: IUserBody = await request(server).post('/user/register').send({
            username: 'ryota2',
            password: '123456',
        });

        const newPoll = await request(server).delete(`/poll/${poll.body.id}/delete`)
            .set('Authorization', newUser.body.accessToken)
            .expect(HttpStatus.FORBIDDEN);
    });

    it('Votes successfully', async () => {
        const created: any = await request(server).post('/poll/create')
            .set('Authorization', token)
            .send({
                title: '12345',
                description: '',
                choices: ['a', 'b'],
            });

        const poll: IPollBody = await request(server).get('/poll/' + created.body.id);

        expect(poll.body.hasVoted).toBe(false);
        expect(poll.body.voteId).toBe(-1);
        await request(server).post(`/poll/${poll.body.id}/vote/${poll.body.voteCount[0].id}`)
            .set('Authorization', token)
            .expect(HttpStatus.OK);

        const votedPoll = await request(server).get('/poll/' + created.body.id)
            .set('Authorization', token);
        expect(votedPoll.body.hasVoted).toBe(true);
        expect(votedPoll.body.voteId).toBe(poll.body.voteCount[0].id);
    });

    it('Does not vote if user has already voted', async () => {
        const created: any = await request(server).post('/poll/create')
            .set('Authorization', token)
            .send({
                title: '12345',
                description: '',
                choices: ['a', 'b'],
            });

        const poll: IPollBody = await request(server).get('/poll/' + created.body.id);

        await request(server).post(`/poll/${poll.body.id}/vote/${poll.body.voteCount[0].id}`)
            .set('Authorization', token)


        await request(server).post(`/poll/${poll.body.id}/vote/${poll.body.voteCount[0].id}`)
            .set('Authorization', token)
            .expect(HttpStatus.FORBIDDEN)
    });
});
