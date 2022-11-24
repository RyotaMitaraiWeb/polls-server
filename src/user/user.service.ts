import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    @InjectRepository(User)
    private readonly userRepository: Repository<User>;
    constructor(private readonly jwtService: JwtService) { }

    public async create(createUserDto: CreateUserDto): Promise<User | null> {
        const existingUser = await this.findUserByUsername(createUserDto.username);
        if (existingUser) {
            return null;
        } else {
            const user = new User();
            user.username = createUserDto.username;
            user.password = createUserDto.password;
            user.polls = [];
            return await this.userRepository.save(user);
        }
    }

    async findUserByUsername(username: string): Promise<User | null> {
        const user: User | null = await this.userRepository.findOne({
            where: {
                username
            }
        });

        return user;
    }

    async comparePasswords(user: User | null, password: string): Promise<void> {
        if (user === null) {
            throw new Error('Wrong username or password');
        } else {
            const comparison = await bcrypt.compare(password, user.password);
            if (!comparison) {
                throw new Error('Wrong username or password')
            }
        }
    }

    async findUserById(id: number): Promise<User | null> {
        const user = await this.userRepository.findOne({
            where: {
                id
            }
        });

        return user;
    }

    async generateToken(user: User) {
        const token = await this.jwtService.signAsync({
            username: user.username,
            id: user.id,
        }, {
            expiresIn: '60 Days',
            secret: process.env.JWT_SECRET || 'wemgwenwewiowjhe',
        });

        return token;
    }
}