import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateMensagemDto } from './dto/create-mensagem.dto'
import { UpdateMensagemDto } from './dto/update-mensagem.dto'

@Injectable()
export class MensagemService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateMensagemDto, userId: number) {
    return this.prisma.mensagem.create({
      data: {
        text: dto.text,
        userId,
      },
      include: {
        usuario: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          }
        }
      }
    })
  }

  async findAll() {
    return this.prisma.mensagem.findMany({
      include: {
        usuario: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          }
        }
      },
      orderBy: {
        createdAt: 'asc',
      },
    })
  }

  async findOne(id: number) {
    return this.prisma.mensagem.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          }
        }
      }
    })
  }

  async markAsRead(id: number) {
    return this.prisma.mensagem.update({
      where: { id },
      data: {
        readAt: new Date(),
      },
      include: {
        usuario: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          }
        }
      }
    })
  }

  async remove(id: number) {
    return this.prisma.mensagem.delete({
      where: { id },
    })
  }
}