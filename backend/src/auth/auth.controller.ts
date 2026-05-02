import { Controller, Post, Body, UseGuards, Req, Get, Res } from '@nestjs/common';
import type { Response } from 'express'
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post()
  async create(@Body() dto: AuthDto, @Res() res: Response) {
    const { access_token } = await this.authService.login(dto);

    // 🔥 AQUI QUE SALVA O COOKIE
    res.cookie('token', access_token, {
      httpOnly: false, // 👈 necessário pro document.cookie
      sameSite: 'lax',
      path: '/',
    });
    
    return res.json({ access_token });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: any) {
    return req.user;
  }
}