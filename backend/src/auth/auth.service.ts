// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { UserType } from '@prisma/client';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) { }

  async register(registerDto: RegisterDto) {
    const { email, password, name, userType, ...extraData } = registerDto;

    // Verificar se usuário já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 12);

    // Criar usuário
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        userType,
      },
    });

    // Criar perfil específico baseado no tipo
    if (userType === UserType.MENTOR) {
      await this.prisma.mentor.create({
        data: {
          userId: user.id,
          title: extraData.title || 'Desenvolvedor',
          yearsExperience: extraData.yearsExperience || 0,
          hourlyRate: extraData.hourlyRate || 0,
          seniority: extraData.seniority || 'JUNIOR',
        },
      });
    } else if (userType === UserType.COMPANY) {
      await this.prisma.company.create({
        data: {
          userId: user.id,
          companyName: extraData.companyName || name,
          companySize: extraData.companySize || 'STARTUP',
        },
      });
    }

    // Gerar JWT
    const payload = {
      sub: user.id,
      email: user.email,
      userType: user.userType
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Buscar usuário
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        mentor: true,
        company: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Verificar senha
    console.log('Tentando login com:', email, password);
    console.log('Hash armazenado:', user.passwordHash);

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      console.log('Senha válida?', isPasswordValid);
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Gerar JWT
    const payload = {
      sub: user.id,
      email: user.email,
      userType: user.userType
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        mentor: user.mentor,
        company: user.company,
      },
    };
  }

  async validateUser(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        mentor: true,
        company: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuário não encontrado ou inativo');
    }

    return user;
  }
}