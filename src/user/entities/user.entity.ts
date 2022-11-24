import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, OneToMany, ManyToOne } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Poll } from '../../poll/entities/poll.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public username: string;

    @Column()
    public password: string;

    @OneToMany(() => Poll, (poll) => poll.author, {
        eager: true,
    })
    polls: Poll[];

    @BeforeInsert()
    async beforeInsert() {
        const password = this.password;
        const hashedPassword = await bcrypt.hash(password, process.env.SALT || 8);
        this.password = hashedPassword;
    }
}
