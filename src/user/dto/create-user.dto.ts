import { IsString, IsNotEmpty, MinLength, MaxLength } from "class-validator";

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    @MaxLength(10)
    public username: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    public password: string;
}
