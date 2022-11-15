import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public username: string;

    @Column()
    public password: string;

    @BeforeInsert()
    async beforeInsert() {
        const password = this.password;
        const hashedPassword = await bcrypt.hash(password, process.env.SALT || 8);
        this.password = hashedPassword;
    }
}
