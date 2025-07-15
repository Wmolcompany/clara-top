import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { AffiliateClick } from './affiliate-click.entity';
import { Commission } from './commission.entity';
import { Withdrawal } from './withdrawal.entity';

@Entity('affiliates')
export class Affiliate {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Affiliate, { nullable: true })
  @JoinColumn({ name: 'parent_affiliate_id' })
  parentAffiliate: Affiliate;

  @OneToMany(() => Affiliate, (affiliate) => affiliate.parentAffiliate)
  subAffiliates: Affiliate[];

  @Column({ name: 'affiliate_code', unique: true, length: 20 })
  affiliateCode: string;

  @Column({ name: 'document_type', type: 'enum', enum: ['cpf', 'cnpj'] })
  documentType: 'cpf' | 'cnpj';

  @Column({ name: 'document_number', unique: true, length: 18 })
  documentNumber: string;

  @Column({ 
    name: 'commission_type', 
    type: 'enum', 
    enum: ['cpa', 'recurring'],
    default: 'recurring'
  })
  commissionType: 'cpa' | 'recurring';

  @Column({ name: 'commission_rate', type: 'decimal', precision: 5, scale: 2, default: 50.00 })
  commissionRate: number;

  @Column({ name: 'commission_value', type: 'decimal', precision: 10, scale: 2, nullable: true })
  commissionValue: number;

  @Column({ 
    name: 'pix_key_type', 
    type: 'enum', 
    enum: ['phone', 'email', 'cpf', 'cnpj', 'random'],
    nullable: true
  })
  pixKeyType: 'phone' | 'email' | 'cpf' | 'cnpj' | 'random';

  @Column({ name: 'pix_key', nullable: true })
  pixKey: string;

  @Column({ name: 'pix_account_name', nullable: true })
  pixAccountName: string;

  @Column({ name: 'total_clicks', default: 0 })
  totalClicks: number;

  @Column({ name: 'total_conversions', default: 0 })
  totalConversions: number;

  @Column({ name: 'total_earnings', type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  totalEarnings: number;

  @Column({ name: 'available_earnings', type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  availableEarnings: number;

  @Column({ name: 'pending_earnings', type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  pendingEarnings: number;

  @Column({ 
    type: 'enum', 
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  })
  status: 'active' | 'inactive' | 'suspended';

  @OneToMany(() => AffiliateClick, (click) => click.affiliate)
  clicks: AffiliateClick[];

  @OneToMany(() => Commission, (commission) => commission.affiliate)
  commissions: Commission[];

  @OneToMany(() => Withdrawal, (withdrawal) => withdrawal.affiliate)
  withdrawals: Withdrawal[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}