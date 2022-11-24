import { TypeOrmModule } from "@nestjs/typeorm";
import { Choice } from "./choice/entities/choice.entity";
import { PollPreviousTitle } from "./poll/entities/poll-previous-title.entity";
import { Poll } from "./poll/entities/poll.entity";
import { User } from "./user/entities/user.entity";

export const TypeOrmSQLiteTestingModule = () => [
    TypeOrmModule.forRoot({
        type: 'better-sqlite3',
        database: ':memory:',
        dropSchema: true,
        entities: [User, Poll, Choice, PollPreviousTitle],
        synchronize: true,
    }),
    TypeOrmModule.forFeature([User, Poll, Choice, PollPreviousTitle])];