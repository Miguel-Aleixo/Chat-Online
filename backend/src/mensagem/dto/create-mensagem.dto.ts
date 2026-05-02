import { IsString, IsNotEmpty } from 'class-validator'

export class CreateMensagemDto {
  @IsString()
  @IsNotEmpty()
  text!: string
}