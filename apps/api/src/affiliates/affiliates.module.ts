import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AffiliatesController } from './affiliates.controller';
import { AffiliatesService } from './affiliates.service';
import { Affiliate } from './entities/affiliate.entity';
import { AffiliateClick } from './entities/affiliate-click.entity';
import { Commission } from './entities/commission.entity';
import { Withdrawal } from './entities/withdrawal.entity';
import { User } from '../users/entities/user.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Affiliate,
      AffiliateClick,
      Commission,
      Withdrawal,
      User,
      Subscription,
    ]),
  ],
  controllers: [AffiliatesController],
  providers: [AffiliatesService],
  exports: [AffiliatesService],
})
export class AffiliatesModule {}