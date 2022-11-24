import { Poll } from "../../poll/entities/poll.entity";
import { User } from "../../user/entities/user.entity";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Choice {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public content: string;

    @ManyToOne(() => Poll, (poll) => poll.choices, {
        onDelete: 'CASCADE'
    })
    poll: Poll;

    @ManyToMany(() => User)
    @JoinTable()
    usersThatVoted: User[];
}
