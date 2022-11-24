import { IsNotEmpty, IsString, Max, MaxLength, MinLength } from "class-validator";
import { Choice } from "src/choice/entities/choice.entity";
import { Column } from "typeorm";

export class CreatePollDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    @MaxLength(100)
    public title: string;

    @IsString()
    @MaxLength(500)
    public description: string;
}
