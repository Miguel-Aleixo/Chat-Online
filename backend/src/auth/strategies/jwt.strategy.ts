import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(config: ConfigService) {
        const secret = config.get<string>('JWT_SECRET');

        if (!secret) {
            throw new Error('JWT_SECRET não definido');
        }

        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                // 1. cookie (web app)
                (req) => req?.cookies?.token,

                // 2. Authorization header (mobile / API)
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            secretOrKey: secret
        });
    }

    async validate(payload: any) {
        return { userId: payload.sub, name: payload.name, email: payload.email, role: payload.role };
    }
}