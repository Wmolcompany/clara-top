import React, { useState, useEffect } from 'react';
import { Heart, BookOpen, DollarSign, Calendar, MessageCircle, Send, Sparkles, Menu, RotateCcw, History, Plus, Home, BarChart3 } from 'lucide-react';
import Reports from './components/Reports';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'clara';
  timestamp: Date;
}

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
}

interface RoutineEntry {
  id: number;
  task: string;
  priority: 'alta' | 'média' | 'baixa';
  completed: boolean;
  date: Date;
}

function App() {
  // Mensagens separadas por função
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Oi! Estou aqui para te escutar 💚 Pode me contar o que está no seu coração hoje?",
      sender: 'clara',
      timestamp: new Date()
    }
  ]);
  
  const [diaryMessages, setDiaryMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Que bom que você quer registrar seus sentimentos! 📔 Como você está se sentindo hoje? Pode me contar sobre seu dia...",
      sender: 'clara',
      timestamp: new Date()
    }
  ]);
  
  const [financeMessages, setFinanceMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Vamos cuidar das suas finanças juntas! 💸 Me conte sobre algum gasto que você fez ou quer registrar.",
      sender: 'clara',
      timestamp: new Date()
    }
  ]);
  
  const [routineMessages, setRoutineMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Vamos organizar seu dia! ☀️ Quais são suas prioridades hoje? Me conte suas tarefas e vamos planejar juntas.",
      sender: 'clara',
      timestamp: new Date()
    }
  ]);
  
  const [inputText, setInputText] = useState('');
  const [activeMode, setActiveMode] = useState<'home' | 'chat' | 'diary' | 'finance' | 'routine'>('home');
  const [showHistory, setShowHistory] = useState(false);
  
  // Variáveis simuladas para registros
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [financeEntries, setFinanceEntries] = useState<FinanceEntry[]>([]);
  const [routineEntries, setRoutineEntries] = useState<RoutineEntry[]>([]);
  
  // Estado para relatórios
  const [showReports, setShowReports] = useState(false);
  
  // Estados para fluxos específicos
  const [waitingForDiaryContent, setWaitingForDiaryContent] = useState(false);
  const [waitingForExpenseAmount, setWaitingForExpenseAmount] = useState(false);
  const [waitingForExpenseDescription, setWaitingForExpenseDescription] = useState(false);
  const [pendingExpenseAmount, setPendingExpenseAmount] = useState<number | null>(null);
  const [waitingForRoutineTask, setWaitingForRoutineTask] = useState(false);

  const modes = [
    { 
      id: 'chat', 
      name: 'Desabafo', 
      icon: MessageCircle, 
      color: 'bg-green-100 text-green-700',
      description: 'Conversas e apoio emocional'
    },
    { 
      id: 'diary', 
      name: 'Diário', 
      icon: BookOpen, 
      color: 'bg-purple-100 text-purple-700',
      description: 'Registre seus sentimentos'
    },
    { 
      id: 'finance', 
      name: 'Finanças', 
      icon: DollarSign, 
      color: 'bg-blue-100 text-blue-700',
      description: 'Controle seus gastos'
    },
    { 
      id: 'routine', 
      name: 'Rotina', 
      icon: Calendar, 
      color: 'bg-orange-100 text-orange-700',
      description: 'Planeje seu dia'
    }
  ];

  const getCurrentMessages = () => {
    switch (activeMode) {
      case 'chat': return chatMessages;
      case 'diary': return diaryMessages;
      case 'finance': return financeMessages;
      case 'routine': return routineMessages;
      default: return [];
    }
  };

  const setCurrentMessages = (messages: Message[]) => {
    switch (activeMode) {
      case 'chat': setChatMessages(messages); break;
      case 'diary': setDiaryMessages(messages); break;
      case 'finance': setFinanceMessages(messages); break;
      case 'routine': setRoutineMessages(messages); break;
    }
  };

  const addClaraMessage = (text: string) => {
    const claraMessage: Message = {
      id: Date.now(),
      text,
      sender: 'clara',
      timestamp: new Date()
    };
    const currentMessages = getCurrentMessages();
    setCurrentMessages([...currentMessages, claraMessage]);
  };

  const resetDay = () => {
    setDiaryEntries([]);
    setFinanceEntries([]);
    setRoutineEntries([]);
    
    // Reset all chats
    setChatMessages([{
      id: 1,
      text: "Novo dia, novas possibilidades! 🌞 Estou aqui para te acompanhar. Como você está se sentindo hoje?",
      sender: 'clara',
      timestamp: new Date()
    }]);
    
    setDiaryMessages([{
      id: 1,
      text: "Que bom começar um novo dia! 📔 Como você está se sentindo hoje? Pode me contar sobre seus planos...",
      sender: 'clara',
      timestamp: new Date()
    }]);
    
    setFinanceMessages([{
      id: 1,
      text: "Novo dia para cuidar das finanças! 💸 Vamos começar organizados. Algum gasto para registrar?",
      sender: 'clara',
      timestamp: new Date()
    }]);
    
    setRoutineMessages([{
      id: 1,
      text: "Vamos planejar este novo dia! ☀️ Quais são suas prioridades hoje?",
      sender: 'clara',
      timestamp: new Date()
    }]);
    
    setActiveMode('home');
    
    // Reset flow states
    setWaitingForDiaryContent(false);
    setWaitingForExpenseAmount(false);
    setWaitingForExpenseDescription(false);
    setPendingExpenseAmount(null);
    setWaitingForRoutineTask(false);
  };

  const getClaraResponse = (text: string, mode: string): string => {
    const lowerText = text.toLowerCase();
    
    // Fluxo do Diário
    if (mode === 'diary') {
      if (waitingForDiaryContent) {
        const newEntry: DiaryEntry = {
          id: Date.now(),
          content: text,
          date: new Date()
        };
        setDiaryEntries(prev => [...prev, newEntry]);
        setWaitingForDiaryContent(false);
        return "Prontinho! Seu registro foi salvo com carinho 💚 É tão importante cuidar dos seus sentimentos assim. Obrigada por compartilhar comigo! Quer registrar mais alguma coisa?";
      }
      
      if (lowerText.includes('registrar') || lowerText.includes('escrever') || lowerText.includes('anotar')) {
        setWaitingForDiaryContent(true);
        return "Que bom que você quer registrar! 📝 Me conte o que está no seu coração hoje. Pode ser sobre seus sentimentos, algo que aconteceu ou qualquer coisa que queira guardar...";
      }
      
      // Auto-registrar se for um desabafo direto
      if (text.length > 20) {
        const newEntry: DiaryEntry = {
          id: Date.now(),
          content: text,
          date: new Date()
        };
        setDiaryEntries(prev => [...prev, newEntry]);
        return "Que importante você compartilhar isso comigo 💚 Salvei no seu diário. Seus sentimentos são válidos e você não está sozinha. Quer me contar mais alguma coisa?";
      }
      
      return "Estou aqui para escutar tudo que você quiser compartilhar 📔 Pode me contar sobre seus sentimentos, seu dia, seus sonhos... O que está no seu coração?";
    }

    // Fluxo de Finanças
    if (mode === 'finance') {
      if (waitingForExpenseAmount) {
        const amount = parseFloat(text.replace(/[^\d,.-]/g, '').replace(',', '.'));
        if (isNaN(amount)) {
          return "Ops! Não consegui entender o valor. Pode me dizer quanto você gastou? (Ex: 25.50 ou 25,50)";
        }
        setPendingExpenseAmount(amount);
        setWaitingForExpenseAmount(false);
        setWaitingForExpenseDescription(true);
        return `Entendi! R$ ${amount.toFixed(2)}. Agora me conta: com o que você gastou esse dinheiro? 🧾`;
      }

      if (waitingForExpenseDescription && pendingExpenseAmount !== null) {
        const newExpense: FinanceEntry = {
          id: Date.now(),
          amount: pendingExpenseAmount,
          description: text,
          date: new Date()
        };
        setFinanceEntries(prev => [...prev, newExpense]);
        setWaitingForExpenseDescription(false);
        setPendingExpenseAmount(null);
        return `Perfeito! Registrei: R$ ${pendingExpenseAmount.toFixed(2)} - ${text} 📊 Que orgulho de você estar se organizando financeiramente! Quer registrar mais algum gasto?`;
      }
      
      if (lowerText.includes('gastei') || lowerText.includes('comprei') || lowerText.includes('paguei')) {
        const amount = parseFloat(text.replace(/[^\d,.-]/g, '').replace(',', '.'));
        if (!isNaN(amount)) {
          setWaitingForExpenseDescription(true);
          setPendingExpenseAmount(amount);
          return `Vi que você gastou R$ ${amount.toFixed(2)}! Com o que foi esse gasto? 💸`;
        }
      }
      
      if (lowerText.includes('registrar') || lowerText.includes('anotar') || lowerText.includes('gasto')) {
        setWaitingForExpenseAmount(true);
        return "Vamos registrar um gasto! 💸 Quanto você gastou? (Digite apenas o valor em reais)";
      }
      
      return "Estou aqui para te ajudar com suas finanças! 💰 Pode me contar sobre algum gasto que você fez ou quer registrar. Ex: 'Gastei 30 reais com almoço' ou 'Quero registrar um gasto'";
    }

    // Fluxo de Rotina
    if (mode === 'routine') {
      if (waitingForRoutineTask) {
        const newTask: RoutineEntry = {
          id: Date.now(),
          task: text,
          priority: 'média',
          completed: false,
          date: new Date()
        };
        setRoutineEntries(prev => [...prev, newTask]);
        setWaitingForRoutineTask(false);
        return `Ótimo! Adicionei "${text}" na sua lista de tarefas ✅ Quer adicionar mais alguma tarefa? Lembre-se de incluir momentos de pausa e autocuidado também! 💚`;
      }
      
      if (lowerText.includes('tarefa') || lowerText.includes('fazer') || lowerText.includes('planejar')) {
        setWaitingForRoutineTask(true);
        return "Vamos organizar seu dia! ☀️ Me conte uma tarefa que você precisa fazer hoje:";
      }
      
      return "Vamos planejar seu dia juntas! 📅 Me conte suas prioridades, tarefas ou o que você precisa organizar. Posso te ajudar a estruturar tudo de forma equilibrada!";
    }

    // Fluxo de Chat/Desabafo
    if (mode === 'chat') {
      if (lowerText.includes('triste') || lowerText.includes('ansioso') || lowerText.includes('desmotivado') || lowerText.includes('cansado')) {
        return "Entendo como isso pode ser difícil 💚 Seus sentimentos são válidos e você não está sozinha. Quer me contar mais sobre isso? Estou aqui para te escutar.";
      }
      
      if (lowerText.includes('obrigad') || lowerText.includes('valeu')) {
        return "Fico feliz em poder te ajudar! Estou sempre aqui para você 🌸 Pode contar comigo sempre que precisar.";
      }
      
      if (lowerText.includes('oi') || lowerText.includes('olá') || lowerText.includes('boa')) {
        return "Oi, querida! Como você está se sentindo hoje? 💚 Pode me contar o que está passando pelo seu coração.";
      }
      
      return "Estou aqui para te escutar com todo carinho 💚 Pode me contar o que está sentindo, o que aconteceu no seu dia ou qualquer coisa que esteja no seu coração. Você não está sozinha.";
    }

    return "Estou aqui para te apoiar! 💚";
  };

  const sendMessage = () => {
    if (!inputText.trim() || activeMode === 'home') return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    const claraResponse: Message = {
      id: Date.now() + 1,
      text: getClaraResponse(inputText, activeMode),
      sender: 'clara',
      timestamp: new Date()
    };

    const currentMessages = getCurrentMessages();
    setCurrentMessages([...currentMessages, userMessage, claraResponse]);
    setInputText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getTotalExpenses = () => {
    return financeEntries.reduce((total, entry) => total + entry.amount, 0);
  };

  const getCompletedTasks = () => {
    return routineEntries.filter(entry => entry.completed).length;
  };

  const renderHome = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Bem-vinda de volta! 💚</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Escolha uma das opções abaixo para começarmos nossa conversa. Estou aqui para te apoiar em tudo que precisar.
        </p>
      </div>

      {/* Function Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modes.map((mode) => {
          const Icon = mode.icon;
          return (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id as any)}
              className="p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-pink-100 hover:border-pink-200 hover:shadow-lg transition-all duration-200 text-left group"
            >
              <div className={`w-12 h-12 ${mode.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{mode.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{mode.description}</p>
              <div className="text-xs text-gray-500">
                {mode.id === 'diary' && `${diaryEntries.length} registros salvos`}
                {mode.id === 'finance' && `R$ ${getTotalExpenses().toFixed(2)} em gastos`}
                {mode.id === 'routine' && `${routineEntries.length} tarefas planejadas`}
                {mode.id === 'chat' && 'Sempre disponível para você'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-pink-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-pink-400" />
          Resumo do Dia
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-purple-600">{diaryEntries.length}</div>
            <div className="text-sm text-gray-600">Registros</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">R$ {getTotalExpenses().toFixed(0)}</div>
            <div className="text-sm text-gray-600">Gastos</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">{routineEntries.length}</div>
            <div className="text-sm text-gray-600">Tarefas</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderChat = () => {
    const currentMessages = getCurrentMessages();
    const currentMode = modes.find(m => m.id === activeMode);
    
    return (
      <div className="space-y-4">
        {/* Chat Header */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-pink-100 p-4">
          <div className="flex items-center gap-3">
            {currentMode && (
              <>
                <div className={`w-10 h-10 ${currentMode.color} rounded-lg flex items-center justify-center`}>
                  <currentMode.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{currentMode.name}</h3>
                  <p className="text-sm text-gray-600">{currentMode.description}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-pink-100 shadow-lg overflow-hidden">
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {currentMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-pink-400 to-pink-500 text-white'
                      : 'bg-gradient-to-r from-green-100 to-green-200 text-gray-800'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <p className={`text-xs mt-2 ${
                    message.sender === 'user' ? 'text-pink-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="border-t border-pink-100 p-4">
            <div className="flex gap-3">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Converse comigo sobre ${currentMode?.name.toLowerCase()}...`}
                className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all duration-200"
                rows={2}
              />
              <button
                onClick={sendMessage}
                disabled={!inputText.trim()}
                className="px-6 py-3 bg-gradient-to-r from-pink-400 to-green-400 text-white rounded-xl hover:from-pink-500 hover:to-green-500 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Enviar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveMode('home')}
              className="w-12 h-12 bg-gradient-to-br from-pink-400 to-green-400 rounded-full flex items-center justify-center hover:scale-105 transition-transform"
            >
              {activeMode === 'home' ? <Heart className="w-6 h-6 text-white" /> : <Home className="w-6 h-6 text-white" />}
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Clara</h1>
              <p className="text-sm text-gray-600">
                {activeMode === 'home' ? 'Sua amiga virtual acolhedora' : 
                 modes.find(m => m.id === activeMode)?.name || 'Conversando com você'}
              </p>
            </div>
            <div className="ml-auto flex gap-2">
              <button
                onClick={() => setShowHistory(true)}
                className="p-2 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
                title="Ver histórico"
              >
                <History className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowReports(true)}
                className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                title="Relatórios"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
              <button
                onClick={resetDay}
                className="p-2 rounded-lg bg-orange-100 text-orange-600 hover:bg-orange-200 transition-colors"
                title="Novo dia"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
            <Sparkles className="w-6 h-6 text-pink-400" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Navigation Tabs */}
        {activeMode !== 'home' && (
          <div className="flex gap-2 mb-6 overflow-x-auto">
            <button
              onClick={() => setActiveMode('home')}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors whitespace-nowrap flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Início
            </button>
            {modes.map((mode) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  onClick={() => setActiveMode(mode.id as any)}
                  className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
                    activeMode === mode.id
                      ? `${mode.color} border-current`
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {mode.name}
                </button>
              );
            })}
          </div>
        )}

        {/* History Modal */}
        {showHistory && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">Seu Histórico 📚</h2>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                {/* Diário */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-purple-700 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Diário ({diaryEntries.length} registros)
                  </h3>
                  {diaryEntries.length === 0 ? (
                    <p className="text-gray-500 italic">Nenhum registro ainda</p>
                  ) : (
                    <div className="space-y-2">
                      {diaryEntries.slice(-3).map(entry => (
                        <div key={entry.id} className="bg-purple-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-700">{entry.content}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {entry.date.toLocaleDateString()} às {entry.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Finanças */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-blue-700 mb-3 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Finanças (Total: R$ {getTotalExpenses().toFixed(2)})
                  </h3>
                  {financeEntries.length === 0 ? (
                    <p className="text-gray-500 italic">Nenhum gasto registrado</p>
                  ) : (
                    <div className="space-y-2">
                      {financeEntries.slice(-5).map(entry => (
                        <div key={entry.id} className="bg-blue-50 p-3 rounded-lg flex justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-700">{entry.description}</p>
                            <p className="text-xs text-gray-500">
                              {entry.date.toLocaleDateString()} às {entry.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <p className="text-sm font-bold text-blue-700">R$ {entry.amount.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Rotina */}
                <div>
                  <h3 className="text-lg font-semibold text-orange-700 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Rotina ({routineEntries.length} tarefas)
                  </h3>
                  {routineEntries.length === 0 ? (
                    <p className="text-gray-500 italic">Nenhuma tarefa planejada</p>
                  ) : (
                    <div className="space-y-2">
                      {routineEntries.slice(-5).map(entry => (
                        <div key={entry.id} className="bg-orange-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-700">{entry.task}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {entry.date.toLocaleDateString()} às {entry.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reports Modal */}
        {showReports && (
          <Reports
            diaryEntries={diaryEntries}
            financeEntries={financeEntries}
            routineEntries={routineEntries}
            onClose={() => setShowReports(false)}
          />
        )}

        {/* Main Content */}
        {activeMode === 'home' ? renderHome() : renderChat()}
      </div>
    </div>
  );
}

export default App;