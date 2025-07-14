import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransporter({
      host: this.configService.get('EMAIL_HOST'),
      port: this.configService.get('EMAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASS'),
      },
    });
  }

  async sendTwoFactorCode(email: string, name: string, code: string) {
    const template = this.getTemplate('two-factor');
    const html = template({
      name,
      code,
      appName: 'Clara Zen',
    });

    await this.sendEmail({
      to: email,
      subject: 'Código de Verificação - Clara Zen',
      html,
    });
  }

  async sendEmailVerification(email: string, name: string, token: string) {
    const verificationUrl = `${this.configService.get('FRONTEND_URL')}/auth/verify-email?token=${token}`;
    const template = this.getTemplate('email-verification');
    const html = template({
      name,
      verificationUrl,
      appName: 'Clara Zen',
    });

    await this.sendEmail({
      to: email,
      subject: 'Verificação de E-mail - Clara Zen',
      html,
    });
  }

  async sendPasswordReset(email: string, name: string, token: string) {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/auth/reset-password?token=${token}`;
    const template = this.getTemplate('password-reset');
    const html = template({
      name,
      resetUrl,
      appName: 'Clara Zen',
    });

    await this.sendEmail({
      to: email,
      subject: 'Recuperação de Senha - Clara Zen',
      html,
    });
  }

  private async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
  }) {
    try {
      await this.transporter.sendMail({
        from: `"Clara Zen" <${this.configService.get('EMAIL_USER')}>`,
        ...options,
      });
      this.logger.log(`Email sent to ${options.to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      throw error;
    }
  }

  private getTemplate(templateName: string) {
    const templatePath = join(__dirname, '..', '..', 'templates', `${templateName}.hbs`);
    const templateSource = readFileSync(templatePath, 'utf8');
    return handlebars.compile(templateSource);
  }
}