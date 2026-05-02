import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength, Matches } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'Miguel Aleixo',
    description: 'Nome do usuário',
  })
  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string' })
  name?: string;

  @ApiPropertyOptional({
    example: 'miguel@example.com',
    description: 'Email do usuário',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  email?: string;

  @ApiPropertyOptional({
    example: 'P@ssw0rd123',
    description: 'Senha com mínimo 8 caracteres, letras e números',
  })
  @IsOptional()
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'Senha deve conter letras e números',
  })
  password?: string;
}