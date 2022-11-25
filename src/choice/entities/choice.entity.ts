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

    @ManyToMany(() => User, {
        eager: true,
    })
    @JoinTable()
    usersThatVoted: User[];

    getVoteCount() {
        return this.usersThatVoted.length;
    }
}
