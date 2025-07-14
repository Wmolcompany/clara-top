import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/layouts/DashboardLayout';
import ChatInterface from '../components/chat/ChatInterface';
import StatsCards from '../components/dashboard/StatsCards';
import RecentActivity from '../components/dashboard/RecentActivity';
import QuickActions from '../components/dashboard/QuickActions';
import { useQuery } from 'react-query';
import { api } from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  // Fetch user stats
  const { data: stats, isLoading: statsLoading } = useQuery(
    'user-stats',
    () => api.get('/stats/user').then(res => res.data),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  // Fetch recent activity
  const { data: activity, isLoading: activityLoading } = useQuery(
    'recent-activity',
    () => api.get('/activity/recent').then(res => res.data),
    {
      refetchInterval: 60000, // Refresh every minute
    }
  );

  if (selectedChat) {
    return (
      <DashboardLayout>
        <ChatInterface
          chatType={selectedChat}
          onBack={() => setSelectedChat(null)}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Olá, {user?.name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-primary-100 text-lg">
                Como posso te ajudar hoje? Estou aqui para apoiar você em tudo que precisar.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-4xl">💚</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards stats={stats} loading={statsLoading} />

        {/* Quick Actions */}
        <QuickActions onSelectChat={setSelectedChat} />

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RecentActivity activity={activity} loading={activityLoading} />
          
          {/* Quick Chat Preview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Chat Rápido com Clara
            </h3>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    C
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 text-sm">
                      Oi! Como você está se sentindo hoje? Pode me contar o que está passando pelo seu coração? 💚
                    </p>
                    <span className="text-xs text-gray-500 mt-1 block">
                      Agora mesmo
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedChat('desabafo')}
                className="w-full bg-primary-50 hover:bg-primary-100 text-primary-700 py-3 px-4 rounded-lg transition-colors text-sm font-medium"
              >
                Começar conversa
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}