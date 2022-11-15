import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user/entities/user.entity";

export const TypeOrmSQLiteTestingModule = () => [
    TypeOrmModule.forRoot({
        type: 'better-sqlite3',
        database: ':memory:',
        dropSchema: true,
        entities: [User],
        synchronize: true,
    }),
    TypeOrmModule.forFeature([User])];