<?php
require_once 'config/database.php';

class ClaraChat {
    private $db;
    private $user_id;

    public function __construct($user_id) {
        $this->db = getDB();
        $this->user_id = $user_id;
    }

    public function processMessage($message, $section) {
        try {
            // Salvar mensagem do usuário
            $this->saveMessage($message, 'user', $section);
            
            // Gerar resposta da Clara
            $response = $this->generateResponse($message, $section);
            
            // Salvar resposta da Clara
            $this->saveMessage($response, 'clara', $section);
            
            // Processar ações específicas da seção
            $stats = $this->processSection($message, $section);
            
            return [
                'success' => true,
                'response' => $response,
                'stats' => $stats
            ];
            
        } catch (Exception $e) {
            error_log("Chat error: " . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Erro interno do servidor'
            ];
        }
    }

    private function saveMessage($message, $sender, $section) {
        $stmt = $this->db->prepare("
            INSERT INTO chat_messages (user_id, section, message, sender) 
            VALUES (?, ?, ?, ?)
        ");
        return $stmt->execute([$this->user_id, $section, $message, $sender]);
    }

    private function generateResponse($message, $section) {
        $message_lower = strtolower($message);
        
        switch ($section) {
            case 'desabafo':
                return $this->generateDesabafoResponse($message_lower);
            case 'diario':
                return $this->generateDiarioResponse($message, $message_lower);
            case 'financas':
                return $this->generateFinancasResponse($message, $message_lower);
            case 'rotina':
                return $this->generateRotinaResponse($message, $message_lower);
            default:
                return "Estou aqui para te apoiar! 💚 Como posso te ajudar hoje?";
        }
    }

    private function generateDesabafoResponse($message_lower) {
        // Detectar palavras emocionais
        $emotional_words = [
            'triste' => "Entendo como isso pode ser difícil 💚 Seus sentimentos são válidos e você não está sozinha. Quer me contar mais sobre isso?",
            'ansioso' => "A ansiedade pode ser muito desafiadora. Respire fundo comigo... Estou aqui para te escutar. O que está te deixando ansioso?",
            'feliz' => "Que alegria saber que você está feliz! 🌟 Compartilhe comigo o que está te fazendo bem!",
            'cansado' => "Percebo que você está cansado. É importante reconhecer quando precisamos de descanso. Quer conversar sobre o que está te esgotando?",
            'preocupado' => "Entendo sua preocupação. Às vezes ajuda conversar sobre o que nos inquieta. Estou aqui para te escutar.",
            'estressado' => "O estresse pode ser muito pesado. Que tal respirarmos juntas? Conte-me o que está te sobrecarregando."
        ];

        foreach ($emotional_words as $word => $response) {
            if (strpos($message_lower, $word) !== false) {
                return $response;
            }
        }

        // Respostas gerais empáticas
        $general_responses = [
            "Estou aqui para te escutar com todo carinho 💚 Pode me contar o que está no seu coração.",
            "Seus sentimentos são importantes. Quer compartilhar comigo o que está passando?",
            "Obrigada por confiar em mim. Como você está se sentindo hoje?",
            "Estou aqui para te apoiar. Pode me contar mais sobre isso?"
        ];

        return $general_responses[array_rand($general_responses)];
    }

    private function generateDiarioResponse($message, $message_lower) {
        // Se a mensagem é longa, provavelmente é um registro
        if (strlen($message) > 20) {
            $this->saveDiaryEntry($message);
            return "Que importante você compartilhar isso comigo 💚 Salvei no seu diário. Seus sentimentos são válidos. Quer me contar mais alguma coisa?";
        }

        if (strpos($message_lower, 'registrar') !== false || strpos($message_lower, 'escrever') !== false) {
            return "Que bom que você quer registrar! 📝 Me conte o que está no seu coração hoje. Pode ser sobre seus sentimentos, algo que aconteceu ou qualquer coisa que queira guardar...";
        }

        return "Estou aqui para escutar tudo que você quiser compartilhar 📔 Pode me contar sobre seus sentimentos, seu dia, seus sonhos... O que está no seu coração?";
    }

    private function generateFinancasResponse($message, $message_lower) {
        // Detectar valores monetários
        if (preg_match('/(\d+(?:[.,]\d{2})?)/', $message, $matches)) {
            $amount = floatval(str_replace(',', '.', $matches[1]));
            
            // Extrair descrição
            $description = trim(preg_replace('/\d+(?:[.,]\d{2})?/', '', $message));
            if (empty($description)) {
                $description = "Gasto não especificado";
            }
            
            $this->saveFinanceEntry($amount, $description);
            return "Perfeito! Registrei: R$ " . number_format($amount, 2, ',', '.') . " - " . $description . " 📊 Que orgulho de você estar se organizando financeiramente! Quer registrar mais algum gasto?";
        }

        if (strpos($message_lower, 'gastei') !== false || strpos($message_lower, 'comprei') !== false) {
            return "Vi que você fez um gasto! Pode me dizer o valor e com o que foi? Ex: '25 reais com almoço' 💸";
        }

        if (strpos($message_lower, 'registrar') !== false || strpos($message_lower, 'anotar') !== false) {
            return "Vamos registrar um gasto! 💸 Me conte quanto você gastou e com o quê. Ex: '30 reais com supermercado'";
        }

        return "Estou aqui para te ajudar com suas finanças! 💰 Pode me contar sobre algum gasto que você fez. Ex: 'Gastei 30 reais com almoço' ou 'Quero registrar um gasto'";
    }

    private function generateRotinaResponse($message, $message_lower) {
        // Se parece com uma tarefa
        if (strlen($message) > 10 && !strpos($message_lower, '?')) {
            $this->saveRoutineEntry($message);
            return "Ótimo! Adicionei \"$message\" na sua lista de tarefas ✅ Quer adicionar mais alguma tarefa? Lembre-se de incluir momentos de pausa e autocuidado também! 💚";
        }

        if (strpos($message_lower, 'tarefa') !== false || strpos($message_lower, 'fazer') !== false) {
            return "Vamos organizar seu dia! ☀️ Me conte uma tarefa que você precisa fazer hoje:";
        }

        return "Vamos planejar seu dia juntas! 📅 Me conte suas prioridades, tarefas ou o que você precisa organizar. Posso te ajudar a estruturar tudo de forma equilibrada!";
    }

    private function saveDiaryEntry($content) {
        try {
            $stmt = $this->db->prepare("
                INSERT INTO diary_entries (user_id, content, date_created, time_created) 
                VALUES (?, ?, CURDATE(), CURTIME())
            ");
            return $stmt->execute([$this->user_id, $content]);
        } catch (Exception $e) {
            error_log("Diary save error: " . $e->getMessage());
            return false;
        }
    }

    private function saveFinanceEntry($amount, $description) {
        try {
            $category = $this->categorizeExpense($description);
            $stmt = $this->db->prepare("
                INSERT INTO finance_entries (user_id, amount, description, category, date_created, time_created) 
                VALUES (?, ?, ?, ?, CURDATE(), CURTIME())
            ");
            return $stmt->execute([$this->user_id, $amount, $description, $category]);
        } catch (Exception $e) {
            error_log("Finance save error: " . $e->getMessage());
            return false;
        }
    }

    private function saveRoutineEntry($task) {
        try {
            $stmt = $this->db->prepare("
                INSERT INTO routine_entries (user_id, task, date_created, time_created) 
                VALUES (?, ?, CURDATE(), CURTIME())
            ");
            return $stmt->execute([$this->user_id, $task]);
        } catch (Exception $e) {
            error_log("Routine save error: " . $e->getMessage());
            return false;
        }
    }

    private function categorizeExpense($description) {
        $description_lower = strtolower($description);
        
        $categories = [
            'alimentacao' => ['comida', 'almoço', 'jantar', 'lanche', 'café', 'restaurante', 'mercado', 'supermercado'],
            'transporte' => ['uber', 'taxi', 'ônibus', 'metro', 'gasolina', 'combustível', 'estacionamento'],
            'moradia' => ['aluguel', 'condomínio', 'luz', 'água', 'internet', 'gás'],
            'saude' => ['médico', 'remédio', 'farmácia', 'consulta', 'exame'],
            'lazer' => ['cinema', 'show', 'festa', 'viagem', 'entretenimento'],
            'educacao' => ['curso', 'livro', 'escola', 'faculdade']
        ];

        foreach ($categories as $category => $keywords) {
            foreach ($keywords as $keyword) {
                if (strpos($description_lower, $keyword) !== false) {
                    return $category;
                }
            }
        }

        return 'outros';
    }

    private function processSection($message, $section) {
        // Retornar estatísticas atualizadas
        return $this->getStats();
    }

    public function getStats() {
        try {
            $stats = [];
            
            // Estatísticas do diário
            $stmt = $this->db->prepare("
                SELECT COUNT(*) as count 
                FROM diary_entries 
                WHERE user_id = ? AND date_created = CURDATE()
            ");
            $stmt->execute([$this->user_id]);
            $stats['diary_count'] = $stmt->fetchColumn();

            // Estatísticas financeiras
            $stmt = $this->db->prepare("
                SELECT COALESCE(SUM(amount), 0) as total 
                FROM finance_entries 
                WHERE user_id = ? AND date_created = CURDATE()
            ");
            $stmt->execute([$this->user_id]);
            $stats['finance_total'] = number_format($stmt->fetchColumn(), 2, ',', '.');

            // Estatísticas de rotina
            $stmt = $this->db->prepare("
                SELECT COUNT(*) as count 
                FROM routine_entries 
                WHERE user_id = ? AND date_created = CURDATE()
            ");
            $stmt->execute([$this->user_id]);
            $stats['routine_count'] = $stmt->fetchColumn();

            return $stats;
            
        } catch (Exception $e) {
            error_log("Stats error: " . $e->getMessage());
            return [];
        }
    }

    public function getHistory() {
        try {
            $history = [];
            
            // Histórico do diário
            $stmt = $this->db->prepare("
                SELECT content, date_created as date, time_created as time 
                FROM diary_entries 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT 10
            ");
            $stmt->execute([$this->user_id]);
            $history['diary'] = $stmt->fetchAll();

            // Histórico financeiro
            $stmt = $this->db->prepare("
                SELECT amount, description, date_created as date, time_created as time 
                FROM finance_entries 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT 10
            ");
            $stmt->execute([$this->user_id]);
            $history['finance'] = $stmt->fetchAll();

            // Total financeiro
            $stmt = $this->db->prepare("
                SELECT COALESCE(SUM(amount), 0) as total 
                FROM finance_entries 
                WHERE user_id = ?
            ");
            $stmt->execute([$this->user_id]);
            $history['finance_total'] = number_format($stmt->fetchColumn(), 2, ',', '.');

            // Histórico de rotina
            $stmt = $this->db->prepare("
                SELECT task, date_created as date, time_created as time 
                FROM routine_entries 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT 10
            ");
            $stmt->execute([$this->user_id]);
            $history['routine'] = $stmt->fetchAll();

            return $history;
            
        } catch (Exception $e) {
            error_log("History error: " . $e->getMessage());
            return [];
        }
    }
}
?>