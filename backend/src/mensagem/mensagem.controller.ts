import { Controller, Get } from '@nestjs/common';
import { MensagemService } from './mensagem.service';

@Controller('mensagem')
export class MensagemController {
  constructor(private readonly mensagemService: MensagemService) {}

  @Get()
  findAll() {
    return this.mensagemService.findAll();
  }
}