import { Module } from '@nestjs/common';
import { MensagemService } from './mensagem.service';
import { MensagemGateway } from './mensagem.gateway';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MensagemController } from './mensagem.controller';

@Module({
  imports: [PrismaModule],
  controllers: [MensagemController],
  providers: [MensagemGateway, MensagemService],
})
export class MensagemModule {}
