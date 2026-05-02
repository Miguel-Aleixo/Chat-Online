import * as bcrypt from 'bcrypt';
import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateUserDto, role: 'USER' | 'ADMIN' = 'USER') {
    const userExists = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });

    if (userExists) {
      throw new ConflictException('Email já está em uso');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.usuario.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role,
      },
    });

    return this.removePassword(user);
  }

  async findAll() {
    const users = await this.prisma.usuario.findMany();
    return users.map(user => this.removePassword(user));
  }

  async findById(id: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    return this.removePassword(user);
  }

  async findByEmail(email: string) {
    return this.prisma.usuario.findUnique({
      where: { email },
    });
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!user) {
      throw new BadRequestException('Usuário não existe');
    }

    if (dto.email) {
      const emailExists = await this.prisma.usuario.findUnique({
        where: { email: dto.email },
      });

      if (emailExists && emailExists.id !== id) {
        throw new ConflictException('Email já está em uso');
      }
    }

    let hashedPassword: string | undefined;

    if (dto.password) {
      hashedPassword = await bcrypt.hash(dto.password, 10);
    }

    const updatedUser = await this.prisma.usuario.update({
      where: { id },
      data: {
        ...dto,
        ...(hashedPassword && { password: hashedPassword }),
      },
    });

    return this.removePassword(updatedUser);
  }

  async delete(id: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!user) {
      throw new BadRequestException('Usuário não existe');
    }

    await this.prisma.usuario.delete({
      where: { id },
    });

    return { message: 'Usuário deletado com sucesso' };
  }

  private removePassword(user: any) {
    const { password, ...safeUser } = user;
    return safeUser;
  }
}