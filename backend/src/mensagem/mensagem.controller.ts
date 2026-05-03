import { Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { MensagemService } from './mensagem.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer'

@Controller('mensagem')
export class MensagemController {
  constructor(private readonly mensagemService: MensagemService) { }

  @Get()
  findAll() {
    return this.mensagemService.findAll();
  }

  @Post('upload/audio')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
          cb(null, unique + extname(file.originalname))
        },
      }),
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      url: `${process.env.BACKEND_URL}/uploads/${file.filename}`,
    }
  }

}