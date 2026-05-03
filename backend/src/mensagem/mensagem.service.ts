import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateMensagemDto } from './dto/create-mensagem.dto'

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

  async update(id: number, text: string, userId: number) {
    const msg = await this.prisma.mensagem.findUnique({
      where: { id: Number(id) },
    })

    if (!msg) {
      throw new Error('Mensagem não existe')
    }

    if (msg.userId !== userId) {
      throw new Error('Sem permissão para editar essa mensagem')
    }

    return this.prisma.mensagem.update({
      where: { id: Number(id) },
      data: { text, isEdited: true },
      include: {
        usuario: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    })
  }

  async remove(id: number) {
    return this.prisma.mensagem.delete({
      where: { id },
    })
  }
}