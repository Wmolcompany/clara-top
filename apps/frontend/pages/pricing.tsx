import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { Check, Zap, Crown, Gift } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface Plan {
  id: string;
  name: string;
  slug: string;
  price: number;
  billingCycle: 'monthly' | 'yearly' | 'trial';
  trialDays: number;
  features: string[];
  stripePriceId: string;
  popular?: boolean;
  savings?: string;
}

const plans: Plan[] = [
  {
    id: '1',
    name: 'Free',
    slug: 'free',
    price: 0,
    billingCycle: 'monthly',
    trialDays: 0,
    features: [
      '10 mensagens por dia',
      'Funcionalidades básicas',
      'Suporte por e-mail',
    ],
    stripePriceId: '',
  },
  {
    id: '2',
    name: 'Premium Mensal',
    slug: 'premium-monthly',
    price: 29.90,
    billingCycle: 'monthly',
    trialDays: 7,
    features: [
      'Mensagens ilimitadas',
      'Todas as funcionalidades',
      'Diário avançado',
      'Relatórios detalhados',
      'Suporte prioritário',
      'Backup automático',
    ],
    stripePriceId: 'price_premium_monthly',
    popular: true,
  },
  {
    id: '3',
    name: 'Premium Anual',
    slug: 'premium-yearly',
    price: 229.90,
    billingCycle: 'yearly',
    trialDays: 7,
    features: [
      'Mensagens ilimitadas',
      'Todas as funcionalidades',
      'Diário avançado',
      'Relatórios detalhados',
      'Suporte prioritário',
      'Backup automático',
      '2 meses grátis',
      'Desconto de afiliado',
    ],
    stripePriceId: 'price_premium_yearly',
    savings: 'Economize R$ 129,90',
  },
];

export default function Pricing() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const { ref } = router.query; // Código de afiliado

  const handleSelectPlan = async (plan: Plan) => {
    if (!user) {
      router.push(`/auth/login?redirect=/pricing${ref ? `?ref=${ref}` : ''}`);
      return;
    }

    if (plan.slug === 'free') {
      toast.success('Você já está no plano gratuito!');
      return;
    }

    setLoading(plan.slug);

    try {
      const response = await api.post('/subscriptions/checkout', {
        planSlug: plan.slug,
        affiliateCode: ref,
        successUrl: `${window.location.origin}/dashboard?success=true`,
        cancelUrl: `${window.location.origin}/pricing`,
      });

      if (response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      } else {
        toast.error('Erro ao criar sessão de pagamento');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao processar pagamento');
    } finally {
      setLoading(null);
    }
  };

  const formatPrice = (price: number, billingCycle: string) => {
    if (price === 0) return 'Grátis';
    
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);

    return billingCycle === 'yearly' ? `${formatted}/ano` : `${formatted}/mês`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">C</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">Clara Zen</span>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                >
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/auth/login')}
                  >
                    Entrar
                  </Button>
                  <Button
                    onClick={() => router.push('/auth/register')}
                  >
                    Cadastrar
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Escolha o plano ideal para você
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Comece gratuitamente e evolua conforme suas necessidades. 
            Todos os planos incluem 7 dias de teste grátis.
          </p>
          
          {ref && (
            <div className="mt-6 inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
              <Gift className="w-5 h-5 mr-2" />
              Você foi indicado por um parceiro! Ganhe desconto especial.
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${
                plan.popular 
                  ? 'border-primary-500 shadow-lg scale-105' 
                  : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <Badge 
                  className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary-500"
                >
                  Mais Popular
                </Badge>
              )}
              
              {plan.savings && (
                <Badge 
                  variant="secondary"
                  className="absolute -top-3 right-4 bg-green-100 text-green-800"
                >
                  {plan.savings}
                </Badge>
              )}

              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  {plan.slug === 'free' && <Zap className="w-8 h-8 text-gray-500" />}
                  {plan.slug.includes('premium') && <Crown className="w-8 h-8 text-primary-500" />}
                </div>
                
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    {formatPrice(plan.price, plan.billingCycle)}
                  </span>
                  {plan.billingCycle === 'yearly' && plan.price > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      R$ {(plan.price / 12).toFixed(2)}/mês
                    </p>
                  )}
                </div>

                {plan.trialDays > 0 && (
                  <CardDescription className="mt-2">
                    {plan.trialDays} dias grátis
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => handleSelectPlan(plan)}
                  loading={loading === plan.slug}
                  disabled={loading !== null}
                >
                  {plan.slug === 'free' 
                    ? 'Plano Atual' 
                    : plan.trialDays > 0 
                      ? `Começar Teste Grátis`
                      : 'Assinar Agora'
                  }
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Perguntas Frequentes
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="font-semibold text-lg mb-2">
                Posso cancelar a qualquer momento?
              </h3>
              <p className="text-gray-600">
                Sim! Você pode cancelar sua assinatura a qualquer momento. 
                Não há taxas de cancelamento.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">
                Como funciona o teste grátis?
              </h3>
              <p className="text-gray-600">
                Você tem 7 dias para testar todas as funcionalidades premium 
                sem nenhum custo. Cancele antes do fim do período se não gostar.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">
                Posso mudar de plano depois?
              </h3>
              <p className="text-gray-600">
                Claro! Você pode fazer upgrade ou downgrade do seu plano 
                a qualquer momento através do seu dashboard.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">
                Os dados ficam seguros?
              </h3>
              <p className="text-gray-600">
                Sim! Utilizamos criptografia de ponta e seguimos as melhores 
                práticas de segurança para proteger seus dados.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-primary-500 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Pronto para começar sua jornada com a Clara?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Junte-se a milhares de usuários que já transformaram suas vidas 
              com nossa assistente virtual.
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => router.push('/auth/register')}
            >
              Começar Agora - É Grátis
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}