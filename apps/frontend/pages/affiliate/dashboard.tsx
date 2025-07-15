import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import AffiliateStats from '../../components/affiliate/AffiliateStats';
import CommissionHistory from '../../components/affiliate/CommissionHistory';
import WithdrawalHistory from '../../components/affiliate/WithdrawalHistory';
import WithdrawalForm from '../../components/affiliate/WithdrawalForm';
import ReferralLinks from '../../components/affiliate/ReferralLinks';
import { useQuery } from 'react-query';
import { api } from '../../services/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Eye, 
  Download,
  Link as LinkIcon,
  Wallet,
  History,
  PiggyBank
} from 'lucide-react';

export default function AffiliateDashboard() {
  const { user } = useAuth();
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);

  // Fetch affiliate stats
  const { data: stats, isLoading: statsLoading } = useQuery(
    'affiliate-stats',
    () => api.get('/affiliates/stats').then(res => res.data),
    {
      refetchInterval: 30000,
    }
  );

  // Fetch commission history
  const { data: commissions, isLoading: commissionsLoading } = useQuery(
    'affiliate-commissions',
    () => api.get('/affiliates/commissions').then(res => res.data),
  );

  // Fetch withdrawal history
  const { data: withdrawals, isLoading: withdrawalsLoading } = useQuery(
    'affiliate-withdrawals',
    () => api.get('/affiliates/withdrawals').then(res => res.data),
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  if (statsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Painel do Afiliado
              </h1>
              <p className="text-primary-100 text-lg">
                Código: <span className="font-mono font-bold">{stats?.affiliate?.affiliateCode}</span>
              </p>
              <p className="text-primary-100">
                Tipo: {stats?.affiliate?.commissionType === 'cpa' ? 'CPA (Pagamento Único)' : 'Recorrente'}
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-12 h-12" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Disponível</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats?.affiliate?.availableEarnings || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Pronto para saque
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Pendente</CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(stats?.affiliate?.pendingEarnings || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Liberação em 7 dias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cliques Este Mês</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.stats?.clicksThisMonth || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Total: {stats?.affiliate?.totalClicks || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPercentage(parseFloat(stats?.stats?.conversionRate || '0'))}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.affiliate?.totalConversions || 0} conversões
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Solicitar Saque
              </CardTitle>
              <CardDescription>
                Valor mínimo: R$ 50,00
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setShowWithdrawalForm(true)}
                disabled={!stats?.affiliate?.availableEarnings || stats.affiliate.availableEarnings < 50}
                className="w-full"
              >
                Solicitar Saque
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5" />
                Link de Afiliado
              </CardTitle>
              <CardDescription>
                Compartilhe e ganhe comissões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={`${window.location.origin}/register?ref=${stats?.affiliate?.affiliateCode}`}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/register?ref=${stats?.affiliate?.affiliateCode}`
                    );
                  }}
                >
                  Copiar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="commissions">Comissões</TabsTrigger>
            <TabsTrigger value="withdrawals">Saques</TabsTrigger>
            <TabsTrigger value="links">Links</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <AffiliateStats stats={stats} />
          </TabsContent>

          <TabsContent value="commissions" className="space-y-6">
            <CommissionHistory 
              commissions={commissions} 
              loading={commissionsLoading} 
            />
          </TabsContent>

          <TabsContent value="withdrawals" className="space-y-6">
            <WithdrawalHistory 
              withdrawals={withdrawals} 
              loading={withdrawalsLoading} 
            />
          </TabsContent>

          <TabsContent value="links" className="space-y-6">
            <ReferralLinks affiliateCode={stats?.affiliate?.affiliateCode} />
          </TabsContent>
        </Tabs>

        {/* Withdrawal Form Modal */}
        {showWithdrawalForm && (
          <WithdrawalForm
            availableAmount={stats?.affiliate?.availableEarnings || 0}
            onClose={() => setShowWithdrawalForm(false)}
            onSuccess={() => {
              setShowWithdrawalForm(false);
              // Refresh data
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}