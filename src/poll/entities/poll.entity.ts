import { Choice } from "../../choice/entities/choice.entity";
import { User } from "../../user/entities/user.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { PollPreviousTitle } from "./poll-previous-title.entity";

@Entity()
export class Poll {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public title: string;

    @Column()
    public description: string;

    @ManyToOne(() => User)
    @JoinColumn()
    public author: User;

    @OneToMany(() => Choice, (choice) => choice.poll, {
        onDelete: 'CASCADE'
    })
    public choices: Choice[];

    @OneToMany(() => PollPreviousTitle, (pollPreviousTitle) => pollPreviousTitle.poll, {
        eager: true,
        onDelete: 'CASCADE'
    })
    public previousTitles: PollPreviousTitle[];

    @CreateDateColumn()
    public creationDate: Date;

    @Column({ default: null, nullable: true, })
    public updateDate: Date;
}
