import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import { v4 as uuidv4 } from 'uuid';

import { User } from '../users/entities/user.entity';
import { EmailService } from '../email/email.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyTwoFactorDto } from './dto/verify-two-factor.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'name', 'role', 'status', 'emailVerified'],
    });

    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('Conta inativa');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException('E-mail não verificado');
    }

    // Generate 2FA code
    const twoFactorCode = this.generateTwoFactorCode();
    const twoFactorExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.userRepository.update(user.id, {
      twoFactorCode,
      twoFactorExpires,
    });

    // Send 2FA code via email
    await this.emailService.sendTwoFactorCode(user.email, user.name, twoFactorCode);

    return {
      message: 'Código de verificação enviado para seu e-mail',
      tempToken: this.jwtService.sign({ userId: user.id, type: 'temp' }, { expiresIn: '10m' }),
    };
  }

  async verifyTwoFactor(verifyDto: VerifyTwoFactorDto) {
    const decoded = this.jwtService.verify(verifyDto.tempToken);
    
    if (decoded.type !== 'temp') {
      throw new UnauthorizedException('Token inválido');
    }

    const user = await this.userRepository.findOne({
      where: { id: decoded.userId },
    });

    if (!user || !user.twoFactorCode || user.twoFactorExpires < new Date()) {
      throw new UnauthorizedException('Código expirado ou inválido');
    }

    if (user.twoFactorCode !== verifyDto.code) {
      throw new UnauthorizedException('Código incorreto');
    }

    // Clear 2FA code
    await this.userRepository.update(user.id, {
      twoFactorCode: null,
      twoFactorExpires: null,
      lastLogin: new Date(),
    });

    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role,
      plan: user.plan 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [
        { email: registerDto.email },
        { cpf: registerDto.cpf },
      ],
    });

    if (existingUser) {
      throw new BadRequestException('E-mail ou CPF já cadastrado');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    // Generate email verification token
    const emailVerificationToken = uuidv4();

    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
      emailVerificationToken,
    });

    const savedUser = await this.userRepository.save(user);

    // Send verification email
    await this.emailService.sendEmailVerification(
      savedUser.email,
      savedUser.name,
      emailVerificationToken,
    );

    return {
      message: 'Usuário criado com sucesso. Verifique seu e-mail para ativar a conta.',
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.userRepository.findOne({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      // Don't reveal if email exists
      return { message: 'Se o e-mail existir, você receberá instruções de recuperação' };
    }

    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.userRepository.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    });

    await this.emailService.sendPasswordReset(user.email, user.name, resetToken);

    return { message: 'Se o e-mail existir, você receberá instruções de recuperação' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.userRepository.findOne({
      where: {
        passwordResetToken: resetPasswordDto.token,
      },
    });

    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Token inválido ou expirado');
    }

    const hashedPassword = await bcrypt.hash(resetPasswordDto.password, 12);

    await this.userRepository.update(user.id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    return { message: 'Senha alterada com sucesso' };
  }

  async verifyEmail(token: string) {
    const user = await this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Token inválido');
    }

    await this.userRepository.update(user.id, {
      emailVerified: true,
      emailVerificationToken: null,
    });

    return { message: 'E-mail verificado com sucesso' };
  }

  private generateTwoFactorCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}