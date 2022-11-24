import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Poll } from "./poll.entity";

@Entity()
export class PollPreviousTitle {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public title: string;

    @ManyToOne(() => Poll, {
        onDelete: 'CASCADE'
    })
    public poll: Poll;
}