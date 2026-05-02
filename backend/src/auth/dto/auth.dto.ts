import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class AuthDto {
    @ApiProperty({ example: 'miguel@email.com' })
    @IsEmail({}, { message: 'Email inválido' })
    email!: string;

    @ApiProperty({ example: '12345678' })
    @IsNotEmpty({ message: 'Senha é obrigatória' })
    password!: string;
}
