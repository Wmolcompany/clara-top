import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingUp, TrendingDown, Calendar, DollarSign, Heart, Target, AlertCircle, CheckCircle, BookOpen, BarChart3 } from 'lucide-react';

interface DiaryEntry {
  id: number;
  content: string;
  date: Date;
  mood?: string;
}

interface FinanceEntry {
  id: number;
  amount: number;
  description: string;
  date: Date;
  category?: string;
}

interface RoutineEntry {
  id: number;
  task: string;
  priority: 'alta' | 'média' | 'baixa';
  completed: boolean;
  date: Date;
}

interface ReportsProps {
  diaryEntries: DiaryEntry[];
  financeEntries: FinanceEntry[];
  routineEntries: RoutineEntry[];
  onClose: () => void;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

const EXPENSE_CATEGORIES = {
  'alimentação': ['comida', 'almoço', 'jantar', 'lanche', 'café', 'restaurante', 'mercado', 'supermercado'],
  'transporte': ['uber', 'taxi', 'ônibus', 'metro', 'gasolina', 'combustível', 'estacionamento'],
  'moradia': ['aluguel', 'condomínio', 'luz', 'água', 'internet', 'gás'],
  'saúde': ['médico', 'remédio', 'farmácia', 'consulta', 'exame'],
  'lazer': ['cinema', 'show', 'festa', 'viagem', 'entretenimento', 'diversão'],
  'educação': ['curso', 'livro', 'escola', 'faculdade', 'material'],
  'outros': []
};

export default function Reports({ diaryEntries, financeEntries, routineEntries, onClose }: ReportsProps) {
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly'>('weekly');
  const [activeSection, setActiveSection] = useState<'diary' | 'finance' | 'routine'>('diary');

  const now = new Date();
  const weekStart = startOfWeek(now, { locale: ptBR });
  const weekEnd = endOfWeek(now, { locale: ptBR });
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const categorizeExpense = (description: string): string => {
    const desc = description.toLowerCase();
    for (const [category, keywords] of Object.entries(EXPENSE_CATEGORIES)) {
      if (keywords.some(keyword => desc.includes(keyword))) {
        return category;
      }
    }
    return 'outros';
  };

  const getWeeklyDiaryAnalysis = () => {
    const weekEntries = diaryEntries.filter(entry => 
      isWithinInterval(entry.date, { start: weekStart, end: weekEnd })
    );

    const dayAnalysis = eachDayOfInterval({ start: weekStart, end: weekEnd }).map(day => {
      const dayEntries = weekEntries.filter(entry => 
        format(entry.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      );
      
      const moodScore = dayEntries.length > 0 ? Math.random() * 10 : 0; // Simulado
      
      return {
        day: format(day, 'EEE', { locale: ptBR }),
        entries: dayEntries.length,
        mood: moodScore,
        date: day
      };
    });

    const avgMood = dayAnalysis.reduce((sum, day) => sum + day.mood, 0) / 7;
    const worstDay = dayAnalysis.reduce((worst, day) => day.mood < worst.mood ? day : worst);
    const bestDay = dayAnalysis.reduce((best, day) => day.mood > best.mood ? day : best);

    return { dayAnalysis, avgMood, worstDay, bestDay, totalEntries: weekEntries.length };
  };

  const getMonthlyDiaryAnalysis = () => {
    const monthEntries = diaryEntries.filter(entry => 
      isWithinInterval(entry.date, { start: monthStart, end: monthEnd })
    );

    const weeklyData = [];
    let currentWeekStart = startOfWeek(monthStart, { locale: ptBR });
    
    while (currentWeekStart <= monthEnd) {
      const currentWeekEnd = endOfWeek(currentWeekStart, { locale: ptBR });
      const weekEntries = monthEntries.filter(entry => 
        isWithinInterval(entry.date, { start: currentWeekStart, end: currentWeekEnd })
      );
      
      weeklyData.push({
        week: `Sem ${weeklyData.length + 1}`,
        entries: weekEntries.length,
        mood: weekEntries.length > 0 ? Math.random() * 10 : 0
      });
      
      currentWeekStart = new Date(currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    return { weeklyData, totalEntries: monthEntries.length };
  };

  const getFinanceAnalysis = (period: 'weekly' | 'monthly') => {
    const start = period === 'weekly' ? weekStart : monthStart;
    const end = period === 'weekly' ? weekEnd : monthEnd;
    
    const periodEntries = financeEntries.filter(entry => 
      isWithinInterval(entry.date, { start, end })
    );

    const totalExpenses = periodEntries.reduce((sum, entry) => sum + entry.amount, 0);
    
    const categoryData = Object.keys(EXPENSE_CATEGORIES).map(category => {
      const categoryExpenses = periodEntries.filter(entry => 
        categorizeExpense(entry.description) === category
      );
      const total = categoryExpenses.reduce((sum, entry) => sum + entry.amount, 0);
      
      return {
        name: category.charAt(0).toUpperCase() + category.slice(1),
        value: total,
        count: categoryExpenses.length
      };
    }).filter(item => item.value > 0);

    const dailyExpenses = eachDayOfInterval({ start, end }).map(day => {
      const dayExpenses = periodEntries.filter(entry => 
        format(entry.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      );
      
      return {
        day: format(day, period === 'weekly' ? 'EEE' : 'dd/MM', { locale: ptBR }),
        amount: dayExpenses.reduce((sum, entry) => sum + entry.amount, 0)
      };
    });

    const avgDaily = totalExpenses / (period === 'weekly' ? 7 : new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate());
    const biggestExpense = periodEntries.reduce((max, entry) => entry.amount > max.amount ? entry : max, { amount: 0, description: '' });

    return { totalExpenses, categoryData, dailyExpenses, avgDaily, biggestExpense, totalTransactions: periodEntries.length };
  };

  const getRoutineAnalysis = (period: 'weekly' | 'monthly') => {
    const start = period === 'weekly' ? weekStart : monthStart;
    const end = period === 'weekly' ? weekEnd : monthEnd;
    
    const periodEntries = routineEntries.filter(entry => 
      isWithinInterval(entry.date, { start, end })
    );

    const completedTasks = periodEntries.filter(entry => entry.completed).length;
    const completionRate = periodEntries.length > 0 ? (completedTasks / periodEntries.length) * 100 : 0;

    const priorityData = ['alta', 'média', 'baixa'].map(priority => {
      const priorityTasks = periodEntries.filter(entry => entry.priority === priority);
      const completed = priorityTasks.filter(entry => entry.completed).length;
      
      return {
        priority: priority.charAt(0).toUpperCase() + priority.slice(1),
        total: priorityTasks.length,
        completed,
        rate: priorityTasks.length > 0 ? (completed / priorityTasks.length) * 100 : 0
      };
    });

    const dailyTasks = eachDayOfInterval({ start, end }).map(day => {
      const dayTasks = periodEntries.filter(entry => 
        format(entry.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      );
      const completed = dayTasks.filter(entry => entry.completed).length;
      
      return {
        day: format(day, period === 'weekly' ? 'EEE' : 'dd/MM', { locale: ptBR }),
        total: dayTasks.length,
        completed,
        rate: dayTasks.length > 0 ? (completed / dayTasks.length) * 100 : 0
      };
    });

    return { completedTasks, totalTasks: periodEntries.length, completionRate, priorityData, dailyTasks };
  };

  const renderDiaryReport = () => {
    const isWeekly = activeTab === 'weekly';
    const weeklyData = getWeeklyDiaryAnalysis();
    const monthlyData = getMonthlyDiaryAnalysis();
    const data = isWeekly ? weeklyData : monthlyData;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-purple-800">Registros</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {isWeekly ? weeklyData.totalEntries : monthlyData.totalEntries}
            </div>
            <div className="text-sm text-purple-600">
              {isWeekly ? 'esta semana' : 'este mês'}
            </div>
          </div>

          {isWeekly && (
            <>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">Melhor Dia</span>
                </div>
                <div className="text-lg font-bold text-green-600">
                  {weeklyData.bestDay.day}
                </div>
                <div className="text-sm text-green-600">
                  Humor: {weeklyData.bestDay.mood.toFixed(1)}/10
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <span className="font-semibold text-orange-800">Atenção</span>
                </div>
                <div className="text-lg font-bold text-orange-600">
                  {weeklyData.worstDay.day}
                </div>
                <div className="text-sm text-orange-600">
                  Humor: {weeklyData.worstDay.mood.toFixed(1)}/10
                </div>
              </div>
            </>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">
            {isWeekly ? 'Humor da Semana' : 'Evolução Mensal'}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={isWeekly ? weeklyData.dayAnalysis : monthlyData.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={isWeekly ? 'day' : 'week'} />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="mood" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Análise da Clara
          </h3>
          {isWeekly ? (
            <div className="space-y-2 text-purple-700">
              <p>• Percebi que você teve {weeklyData.totalEntries} momentos de reflexão esta semana 💚</p>
              <p>• Seu melhor dia foi {weeklyData.bestDay.day}, que bom que você se sentiu bem!</p>
              <p>• Em {weeklyData.worstDay.day} você pareceu mais reflexivo. Quer conversar sobre isso?</p>
              <p>• Sua média de humor foi {weeklyData.avgMood.toFixed(1)}/10. Continue cuidando de si!</p>
            </div>
          ) : (
            <div className="space-y-2 text-purple-700">
              <p>• Você fez {monthlyData.totalEntries} registros este mês, que dedicação! 💚</p>
              <p>• Notei uma evolução positiva ao longo das semanas</p>
              <p>• Continue registrando seus sentimentos, isso te ajuda muito!</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderFinanceReport = () => {
    const analysis = getFinanceAnalysis(activeTab);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-800">Total Gasto</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              R$ {analysis.totalExpenses.toFixed(2)}
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-800">Média Diária</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              R$ {analysis.avgDaily.toFixed(2)}
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <span className="font-semibold text-orange-800">Maior Gasto</span>
            </div>
            <div className="text-lg font-bold text-orange-600">
              R$ {analysis.biggestExpense.amount.toFixed(2)}
            </div>
            <div className="text-sm text-orange-600 truncate">
              {analysis.biggestExpense.description}
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-purple-800">Transações</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {analysis.totalTransactions}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Gastos por Categoria</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analysis.categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: R$ ${value.toFixed(0)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analysis.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Valor']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Gastos Diários</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analysis.dailyExpenses}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Gasto']} />
                <Bar dataKey="amount" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Análise Financeira da Clara
          </h3>
          <div className="space-y-2 text-blue-700">
            <p>• Você gastou R$ {analysis.totalExpenses.toFixed(2)} {activeTab === 'weekly' ? 'esta semana' : 'este mês'} 💸</p>
            <p>• Sua média diária é R$ {analysis.avgDaily.toFixed(2)}</p>
            {analysis.categoryData.length > 0 && (
              <p>• Sua maior categoria de gastos foi: {analysis.categoryData.reduce((max, cat) => cat.value > max.value ? cat : max).name}</p>
            )}
            <p>• {analysis.totalTransactions} transações registradas. Que organização! 📊</p>
            <p>• Quer definir uma meta de economia para o próximo período? Posso te ajudar! 💚</p>
          </div>
        </div>
      </div>
    );
  };

  const renderRoutineReport = () => {
    const analysis = getRoutineAnalysis(activeTab);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-800">Taxa de Conclusão</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {analysis.completionRate.toFixed(1)}%
            </div>
            <div className="text-sm text-green-600">
              {analysis.completedTasks}/{analysis.totalTasks} tarefas
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-800">Total de Tarefas</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {analysis.totalTasks}
            </div>
            <div className="text-sm text-blue-600">
              {activeTab === 'weekly' ? 'esta semana' : 'este mês'}
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-purple-800">Concluídas</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {analysis.completedTasks}
            </div>
            <div className="text-sm text-purple-600">
              tarefas finalizadas
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Desempenho por Prioridade</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analysis.priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="priority" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="#82ca9d" name="Concluídas" />
                <Bar dataKey="total" fill="#8884d8" name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Produtividade Diária</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analysis.dailyTasks}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="rate" stroke="#8884d8" name="Taxa %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-orange-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-orange-800 mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Análise de Produtividade da Clara
          </h3>
          <div className="space-y-2 text-orange-700">
            <p>• Sua taxa de conclusão foi {analysis.completionRate.toFixed(1)}% {activeTab === 'weekly' ? 'esta semana' : 'este mês'} 🎯</p>
            <p>• Você planejou {analysis.totalTasks} tarefas e concluiu {analysis.completedTasks}!</p>
            {analysis.completionRate >= 70 && <p>• Parabéns! Você está muito produtiva! Continue assim! 🌟</p>}
            {analysis.completionRate < 70 && analysis.completionRate >= 50 && <p>• Você está no caminho certo! Que tal ajustar as metas? 💚</p>}
            {analysis.completionRate < 50 && <p>• Vamos repensar suas metas juntas? Às vezes menos é mais! 💚</p>}
            <p>• Lembre-se: o importante é o progresso, não a perfeição! 🌸</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Relatórios da Clara 📊</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>
          </div>

          {/* Period Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('weekly')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'weekly'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Semanal
            </button>
            <button
              onClick={() => setActiveTab('monthly')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'monthly'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Mensal
            </button>
          </div>

          {/* Section Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveSection('diary')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                activeSection === 'diary'
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Diário
            </button>
            <button
              onClick={() => setActiveSection('finance')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                activeSection === 'finance'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              Finanças
            </button>
            <button
              onClick={() => setActiveSection('routine')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                activeSection === 'routine'
                  ? 'bg-orange-100 text-orange-700 border border-orange-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Rotina
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeSection === 'diary' && renderDiaryReport()}
          {activeSection === 'finance' && renderFinanceReport()}
          {activeSection === 'routine' && renderRoutineReport()}
        </div>
      </div>
    </div>
  );
}