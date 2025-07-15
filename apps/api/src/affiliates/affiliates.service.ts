import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Affiliate } from './entities/affiliate.entity';
import { AffiliateClick } from './entities/affiliate-click.entity';
import { Commission } from './entities/commission.entity';
import { Withdrawal } from './entities/withdrawal.entity';
import { User } from '../users/entities/user.entity';
import { CreateAffiliateDto } from './dto/create-affiliate.dto';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { TrackClickDto } from './dto/track-click.dto';

@Injectable()
export class AffiliatesService {
  constructor(
    @InjectRepository(Affiliate)
    private affiliateRepository: Repository<Affiliate>,
    @InjectRepository(AffiliateClick)
    private clickRepository: Repository<AffiliateClick>,
    @InjectRepository(Commission)
    private commissionRepository: Repository<Commission>,
    @InjectRepository(Withdrawal)
    private withdrawalRepository: Repository<Withdrawal>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async createAffiliate(userId: number, createAffiliateDto: CreateAffiliateDto): Promise<Affiliate> {
    // Verificar se usuário já é afiliado
    const existingAffiliate = await this.affiliateRepository.findOne({
      where: { user: { id: userId } },
    });

    if (existingAffiliate) {
      throw new BadRequestException('Usuário já é afiliado');
    }

    // Verificar se documento já existe
    const existingDocument = await this.affiliateRepository.findOne({
      where: { documentNumber: createAffiliateDto.documentNumber },
    });

    if (existingDocument) {
      throw new BadRequestException('Documento já cadastrado');
    }

    // Gerar código único
    const affiliateCode = await this.generateUniqueCode();

    // Buscar afiliado pai se fornecido
    let parentAffiliate = null;
    if (createAffiliateDto.parentAffiliateCode) {
      parentAffiliate = await this.affiliateRepository.findOne({
        where: { affiliateCode: createAffiliateDto.parentAffiliateCode },
      });

      if (!parentAffiliate) {
        throw new BadRequestException('Código de afiliado pai inválido');
      }
    }

    const affiliate = this.affiliateRepository.create({
      user: { id: userId },
      parentAffiliate,
      affiliateCode,
      documentType: createAffiliateDto.documentType,
      documentNumber: createAffiliateDto.documentNumber,
      commissionType: createAffiliateDto.commissionType,
      commissionRate: createAffiliateDto.commissionRate || 50.00,
      commissionValue: createAffiliateDto.commissionValue,
    });

    const savedAffiliate = await this.affiliateRepository.save(affiliate);

    // Atualizar tipo do usuário
    await this.userRepository.update(userId, { role: 'affiliate' });

    return savedAffiliate;
  }

  async trackClick(trackClickDto: TrackClickDto): Promise<AffiliateClick> {
    const affiliate = await this.affiliateRepository.findOne({
      where: { affiliateCode: trackClickDto.affiliateCode },
    });

    if (!affiliate) {
      throw new NotFoundException('Código de afiliado não encontrado');
    }

    // Verificar se já existe clique recente do mesmo IP
    const recentClick = await this.clickRepository.findOne({
      where: {
        affiliate: { id: affiliate.id },
        ipAddress: trackClickDto.ipAddress,
      },
      order: { createdAt: 'DESC' },
    });

    // Se clique foi há menos de 1 hora, não contar novamente
    if (recentClick && 
        new Date().getTime() - recentClick.createdAt.getTime() < 3600000) {
      return recentClick;
    }

    const click = this.clickRepository.create({
      affiliate,
      ipAddress: trackClickDto.ipAddress,
      userAgent: trackClickDto.userAgent,
      referrer: trackClickDto.referrer,
      utmSource: trackClickDto.utmSource,
      utmMedium: trackClickDto.utmMedium,
      utmCampaign: trackClickDto.utmCampaign,
    });

    const savedClick = await this.clickRepository.save(click);

    // Atualizar contador de cliques
    await this.affiliateRepository.increment(
      { id: affiliate.id },
      'totalClicks',
      1,
    );

    return savedClick;
  }

  async processConversion(userId: number, subscriptionId: number, amount: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['referredBy'],
    });

    if (!user?.referredBy) {
      return; // Sem afiliado, não gerar comissão
    }

    const affiliate = await this.affiliateRepository.findOne({
      where: { user: { id: user.referredBy.id } },
      relations: ['parentAffiliate'],
    });

    if (!affiliate) {
      return;
    }

    await this.dataSource.transaction(async (manager) => {
      // Marcar clique como convertido
      await manager.update(AffiliateClick, 
        { 
          affiliate: { id: affiliate.id },
          converted: false,
        },
        { 
          converted: true,
          convertedUser: { id: userId },
        }
      );

      // Atualizar contador de conversões
      await manager.increment(Affiliate, { id: affiliate.id }, 'totalConversions', 1);

      // Calcular comissão do afiliado principal
      const commissionAmount = affiliate.commissionType === 'cpa' 
        ? affiliate.commissionValue || (amount * 0.5)
        : (amount * affiliate.commissionRate) / 100;

      const availableAt = new Date();
      availableAt.setDate(availableAt.getDate() + 7); // 7 dias de retenção

      // Criar comissão do afiliado principal
      const commission = manager.create(Commission, {
        affiliate,
        subscription: { id: subscriptionId },
        user: { id: userId },
        type: affiliate.commissionType,
        level: 1,
        amount: commissionAmount,
        rate: affiliate.commissionRate,
        status: 'pending',
        availableAt,
      });

      await manager.save(commission);

      // Se há sub-afiliado (nível 2)
      if (affiliate.parentAffiliate) {
        const subCommissionRate = 10.00; // 10% para sub-afiliado
        const subCommissionAmount = (amount * subCommissionRate) / 100;

        const subCommission = manager.create(Commission, {
          affiliate: affiliate.parentAffiliate,
          parentAffiliate: affiliate,
          subscription: { id: subscriptionId },
          user: { id: userId },
          type: 'sub_affiliate',
          level: 2,
          amount: subCommissionAmount,
          rate: subCommissionRate,
          status: 'pending',
          availableAt,
        });

        await manager.save(subCommission);
      }
    });
  }

  async requestWithdrawal(affiliateId: number, createWithdrawalDto: CreateWithdrawalDto): Promise<Withdrawal> {
    const affiliate = await this.affiliateRepository.findOne({
      where: { id: affiliateId },
    });

    if (!affiliate) {
      throw new NotFoundException('Afiliado não encontrado');
    }

    if (createWithdrawalDto.amount > affiliate.availableEarnings) {
      throw new BadRequestException('Saldo insuficiente');
    }

    if (createWithdrawalDto.amount < 50) {
      throw new BadRequestException('Valor mínimo para saque é R$ 50,00');
    }

    const withdrawal = this.withdrawalRepository.create({
      affiliate,
      amount: createWithdrawalDto.amount,
      pixKeyType: createWithdrawalDto.pixKeyType,
      pixKey: createWithdrawalDto.pixKey,
      pixAccountName: createWithdrawalDto.pixAccountName,
    });

    const savedWithdrawal = await this.withdrawalRepository.save(withdrawal);

    // Reduzir saldo disponível
    await this.affiliateRepository.decrement(
      { id: affiliateId },
      'availableEarnings',
      createWithdrawalDto.amount,
    );

    return savedWithdrawal;
  }

  async getAffiliateStats(userId: number) {
    const affiliate = await this.affiliateRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!affiliate) {
      throw new NotFoundException('Afiliado não encontrado');
    }

    // Estatísticas do mês atual
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [clicksThisMonth, conversionsThisMonth, pendingCommissions, availableCommissions] = await Promise.all([
      this.clickRepository.count({
        where: {
          affiliate: { id: affiliate.id },
          createdAt: { $gte: startOfMonth } as any,
        },
      }),
      this.clickRepository.count({
        where: {
          affiliate: { id: affiliate.id },
          converted: true,
          createdAt: { $gte: startOfMonth } as any,
        },
      }),
      this.commissionRepository.sum('amount', {
        affiliate: { id: affiliate.id },
        status: 'pending',
      }),
      this.commissionRepository.sum('amount', {
        affiliate: { id: affiliate.id },
        status: 'available',
      }),
    ]);

    return {
      affiliate,
      stats: {
        clicksThisMonth,
        conversionsThisMonth,
        pendingCommissions: pendingCommissions || 0,
        availableCommissions: availableCommissions || 0,
        conversionRate: affiliate.totalClicks > 0 
          ? (affiliate.totalConversions / affiliate.totalClicks * 100).toFixed(2)
          : '0.00',
      },
    };
  }

  async getCommissionHistory(affiliateId: number, page = 1, limit = 20) {
    const [commissions, total] = await this.commissionRepository.findAndCount({
      where: { affiliate: { id: affiliateId } },
      relations: ['subscription', 'user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      commissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getWithdrawalHistory(affiliateId: number, page = 1, limit = 20) {
    const [withdrawals, total] = await this.withdrawalRepository.findAndCount({
      where: { affiliate: { id: affiliateId } },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      withdrawals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  private async generateUniqueCode(): Promise<string> {
    let code: string;
    let exists: boolean;

    do {
      code = Math.random().toString(36).substring(2, 10).toUpperCase();
      const existing = await this.affiliateRepository.findOne({
        where: { affiliateCode: code },
      });
      exists = !!existing;
    } while (exists);

    return code;
  }

  // Métodos para admin
  async getAllAffiliates(page = 1, limit = 20) {
    const [affiliates, total] = await this.affiliateRepository.findAndCount({
      relations: ['user', 'parentAffiliate'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      affiliates,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async approveWithdrawal(withdrawalId: number, adminId: number): Promise<Withdrawal> {
    const withdrawal = await this.withdrawalRepository.findOne({
      where: { id: withdrawalId },
      relations: ['affiliate'],
    });

    if (!withdrawal) {
      throw new NotFoundException('Saque não encontrado');
    }

    if (withdrawal.status !== 'requested') {
      throw new BadRequestException('Saque não pode ser aprovado');
    }

    withdrawal.status = 'approved';
    withdrawal.processedBy = { id: adminId } as any;
    withdrawal.processedAt = new Date();

    return this.withdrawalRepository.save(withdrawal);
  }

  async rejectWithdrawal(withdrawalId: number, adminId: number, notes: string): Promise<Withdrawal> {
    const withdrawal = await this.withdrawalRepository.findOne({
      where: { id: withdrawalId },
      relations: ['affiliate'],
    });

    if (!withdrawal) {
      throw new NotFoundException('Saque não encontrado');
    }

    if (withdrawal.status !== 'requested') {
      throw new BadRequestException('Saque não pode ser rejeitado');
    }

    await this.dataSource.transaction(async (manager) => {
      // Devolver saldo para o afiliado
      await manager.increment(
        Affiliate,
        { id: withdrawal.affiliate.id },
        'availableEarnings',
        withdrawal.amount,
      );

      // Atualizar status do saque
      withdrawal.status = 'rejected';
      withdrawal.processedBy = { id: adminId } as any;
      withdrawal.processedAt = new Date();
      withdrawal.adminNotes = notes;

      await manager.save(withdrawal);
    });

    return withdrawal;
  }

  async releaseCommissions(): Promise<number> {
    const now = new Date();
    
    const result = await this.commissionRepository.update(
      {
        status: 'pending',
        availableAt: { $lte: now } as any,
      },
      {
        status: 'available',
      },
    );

    return result.affected || 0;
  }
}