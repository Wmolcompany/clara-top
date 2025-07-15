import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { StripeService } from './stripe.service';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { User } from '../users/entities/user.entity';
import { Affiliate } from '../affiliates/entities/affiliate.entity';
import { AffiliatesModule } from '../affiliates/affiliates.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Subscription,
      SubscriptionPlan,
      User,
      Affiliate,
    ]),
    AffiliatesModule,
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, StripeService],
  exports: [SubscriptionsService, StripeService],
})
export class SubscriptionsModule {}