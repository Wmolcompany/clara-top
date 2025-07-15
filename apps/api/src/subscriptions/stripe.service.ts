import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    
    if (secretKey) {
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2023-10-16',
      });
    } else {
      this.logger.warn('Stripe secret key not configured');
    }
  }

  async createCustomer(email: string, name: string, metadata?: any): Promise<Stripe.Customer> {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    return this.stripe.customers.create({
      email,
      name,
      metadata,
    });
  }

  async createCheckoutSession(params: {
    customerId?: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: any;
    trialPeriodDays?: number;
  }): Promise<Stripe.Checkout.Session> {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      line_items: [
        {
          price: params.priceId,
          quantity: 1,
        },
      ],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: params.metadata,
    };

    if (params.customerId) {
      sessionParams.customer = params.customerId;
    }

    if (params.trialPeriodDays) {
      sessionParams.subscription_data = {
        trial_period_days: params.trialPeriodDays,
      };
    }

    return this.stripe.checkout.sessions.create(sessionParams);
  }

  async createSubscription(params: {
    customerId: string;
    priceId: string;
    trialPeriodDays?: number;
    metadata?: any;
  }): Promise<Stripe.Subscription> {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    const subscriptionParams: Stripe.SubscriptionCreateParams = {
      customer: params.customerId,
      items: [{ price: params.priceId }],
      metadata: params.metadata,
    };

    if (params.trialPeriodDays) {
      subscriptionParams.trial_period_days = params.trialPeriodDays;
    }

    return this.stripe.subscriptions.create(subscriptionParams);
  }

  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    return this.stripe.subscriptions.cancel(subscriptionId);
  }

  async updateSubscription(
    subscriptionId: string,
    params: Stripe.SubscriptionUpdateParams,
  ): Promise<Stripe.Subscription> {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    return this.stripe.subscriptions.update(subscriptionId, params);
  }

  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    return this.stripe.subscriptions.retrieve(subscriptionId);
  }

  async constructWebhookEvent(
    payload: string | Buffer,
    signature: string,
  ): Promise<Stripe.Event> {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret not configured');
    }

    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }

  async createPrice(params: {
    productId: string;
    unitAmount: number;
    currency: string;
    recurring?: {
      interval: 'month' | 'year';
      intervalCount?: number;
    };
  }): Promise<Stripe.Price> {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    return this.stripe.prices.create({
      product: params.productId,
      unit_amount: params.unitAmount,
      currency: params.currency,
      recurring: params.recurring,
    });
  }

  async createProduct(params: {
    name: string;
    description?: string;
    metadata?: any;
  }): Promise<Stripe.Product> {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    return this.stripe.products.create({
      name: params.name,
      description: params.description,
      metadata: params.metadata,
    });
  }

  isConfigured(): boolean {
    return !!this.stripe;
  }
}