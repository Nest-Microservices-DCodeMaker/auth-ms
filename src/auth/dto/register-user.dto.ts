import { IsString, IsStrongPassword } from "class-validator";

export class RegisterUserDto {

    @IsString()
    name: string;

    @IsString()
    email: string;

    @IsString()
    @IsStrongPassword()
    password: string;

}