import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import AdminStats from '../../components/admin/AdminStats';
import UserManagement from '../../components/admin/UserManagement';
import AffiliateManagement from '../../components/admin/AffiliateManagement';
import WithdrawalManagement from '../../components/admin/WithdrawalManagement';
import SystemSettings from '../../components/admin/SystemSettings';
import { useQuery } from 'react-query';
import { api } from '../../services/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Settings,
  UserCheck,
  Wallet,
  BarChart3,
  Shield
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();

  // Fetch admin stats
  const { data: stats, isLoading: statsLoading } = useQuery(
    'admin-stats',
    () => api.get('/admin/stats').then(res => res.data),
    {
      refetchInterval: 30000,
    }
  );

  // Fetch pending withdrawals
  const { data: pendingWithdrawals } = useQuery(
    'pending-withdrawals',
    () => api.get('/admin/withdrawals?status=requested').then(res => res.data),
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
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
                Painel Administrativo
              </h1>
              <p className="text-primary-100 text-lg">
                Bem-vindo, {user?.name}! Gerencie toda a plataforma Clara Zen.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                <Shield className="w-12 h-12" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.users?.active || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                +{stats?.users?.newThisMonth || 0} este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats?.revenue?.thisMonth || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.revenue?.growth > 0 ? '+' : ''}{stats?.revenue?.growth?.toFixed(1)}% vs mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Afiliados Ativos</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.affiliates?.active || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.affiliates?.totalEarnings ? formatCurrency(stats.affiliates.totalEarnings) : 'R$ 0,00'} em comissões
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saques Pendentes</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {pendingWithdrawals?.pagination?.total || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(
                  pendingWithdrawals?.withdrawals?.reduce((sum: number, w: any) => sum + w.amount, 0) || 0
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Saques Pendentes
              </CardTitle>
              <CardDescription>
                {pendingWithdrawals?.pagination?.total || 0} solicitações aguardando aprovação
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingWithdrawals?.withdrawals?.slice(0, 3).map((withdrawal: any) => (
                <div key={withdrawal.id} className="flex justify-between items-center py-2">
                  <div>
                    <p className="font-medium">{withdrawal.affiliate.user.name}</p>
                    <p className="text-sm text-gray-500">{formatCurrency(withdrawal.amount)}</p>
                  </div>
                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                    Pendente
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Top Afiliados
              </CardTitle>
              <CardDescription>
                Maiores geradores de receita
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.topAffiliates?.slice(0, 3).map((affiliate: any, index: number) => (
                <div key={affiliate.id} className="flex justify-between items-center py-2">
                  <div>
                    <p className="font-medium">#{index + 1} {affiliate.user.name}</p>
                    <p className="text-sm text-gray-500">{affiliate.totalConversions} conversões</p>
                  </div>
                  <span className="text-sm font-bold text-green-600">
                    {formatCurrency(affiliate.totalEarnings)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Métricas Rápidas
              </CardTitle>
              <CardDescription>
                Indicadores importantes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Taxa de Conversão</span>
                <span className="font-bold">{stats?.metrics?.conversionRate?.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Churn Rate</span>
                <span className="font-bold">{stats?.metrics?.churnRate?.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">LTV Médio</span>
                <span className="font-bold">{formatCurrency(stats?.metrics?.averageLTV || 0)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="affiliates">Afiliados</TabsTrigger>
            <TabsTrigger value="withdrawals">Saques</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <AdminStats stats={stats} />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="affiliates" className="space-y-6">
            <AffiliateManagement />
          </TabsContent>

          <TabsContent value="withdrawals" className="space-y-6">
            <WithdrawalManagement />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SystemSettings />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}