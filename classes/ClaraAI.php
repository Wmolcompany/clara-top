<?php
require_once 'config/database.php';

class ClaraAI {
    private $db;
    private $user_id;
    private $api_key;

    public function __construct($user_id) {
        $this->db = getDB();
        $this->user_id = $user_id;
        $this->api_key = getConfig('openai_api_key');
    }

    public function processMessage($message, $context = 'chat') {
        try {
            // Salvar mensagem do usuário
            $this->saveMessage($message, 'user', $context);
            
            // Gerar resposta da Clara
            $response = $this->generateResponse($message, $context);
            
            // Salvar resposta da Clara
            $this->saveMessage($response, 'clara', $context);
            
            return [
                'success' => true,
                'response' => $response
            ];
            
        } catch (Exception $e) {
            error_log("Clara AI error: " . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Erro interno do servidor'
            ];
        }
    }

    private function generateResponse($message, $context) {
        // Se não tiver API key, usar respostas pré-definidas
        if (empty($this->api_key)) {
            return $this->getDefaultResponse($message, $context);
        }

        try {
            // Preparar contexto para a IA
            $systemPrompt = $this->getSystemPrompt($context);
            $conversationHistory = $this->getRecentMessages($context, 10);
            
            // Preparar mensagens para a API
            $messages = [
                ['role' => 'system', 'content' => $systemPrompt]
            ];
            
            // Adicionar histórico recente
            foreach ($conversationHistory as $msg) {
                $role = $msg['sender'] === 'user' ? 'user' : 'assistant';
                $messages[] = ['role' => $role, 'content' => $msg['pergunta']];
            }
            
            // Adicionar mensagem atual
            $messages[] = ['role' => 'user', 'content' => $message];
            
            // Chamar API OpenAI
            $response = $this->callOpenAI($messages);
            
            if ($response) {
                return $response;
            }
            
        } catch (Exception $e) {
            error_log("OpenAI API error: " . $e->getMessage());
        }
        
        // Fallback para resposta padrão
        return $this->getDefaultResponse($message, $context);
    }

    private function callOpenAI($messages) {
        $data = [
            'model' => 'gpt-3.5-turbo',
            'messages' => $messages,
            'max_tokens' => 500,
            'temperature' => 0.7
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://api.openai.com/v1/chat/completions');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $this->api_key
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 200) {
            $result = json_decode($response, true);
            if (isset($result['choices'][0]['message']['content'])) {
                // Salvar tokens usados
                $tokensUsed = $result['usage']['total_tokens'] ?? 0;
                $this->saveTokenUsage($tokensUsed);
                
                return $result['choices'][0]['message']['content'];
            }
        }

        return null;
    }

    private function getSystemPrompt($context) {
        $basePrompt = getConfig('clara_texto_inicial', 'Olá! Sou a Clara, sua assistente virtual.');
        
        $contextPrompts = [
            'chat' => "Você é Clara, uma assistente virtual empática e acolhedora. Responda de forma carinhosa e compreensiva, como uma amiga próxima. Use emojis moderadamente e mantenha um tom caloroso.",
            
            'diario' => "Você é Clara, especialista em bem-estar emocional. Ajude o usuário a refletir sobre seus sentimentos e experiências. Faça perguntas que incentivem a auto-reflexão e ofereça apoio emocional.",
            
            'financas' => "Você é Clara, consultora financeira amigável. Ajude o usuário a organizar suas finanças pessoais, dar dicas de economia e planejamento financeiro. Seja prática mas encorajadora.",
            
            'rotina' => "Você é Clara, especialista em produtividade e bem-estar. Ajude o usuário a organizar sua rotina diária, estabelecer hábitos saudáveis e encontrar equilíbrio entre trabalho e vida pessoal."
        ];

        return $contextPrompts[$context] ?? $contextPrompts['chat'];
    }

    private function getDefaultResponse($message, $context) {
        $message_lower = strtolower($message);
        
        // Respostas baseadas em palavras-chave
        $keywords = [
            'oi' => 'Olá! Como você está hoje? 😊',
            'olá' => 'Oi! É um prazer conversar com você! 💚',
            'bom dia' => 'Bom dia! Espero que seu dia seja maravilhoso! ☀️',
            'boa tarde' => 'Boa tarde! Como está sendo seu dia? 🌤️',
            'boa noite' => 'Boa noite! Como foi seu dia hoje? 🌙',
            'obrigad' => 'De nada! Estou sempre aqui para ajudar você! 💚',
            'tchau' => 'Até logo! Foi ótimo conversar com você! 👋',
            'triste' => 'Entendo que você está se sentindo triste. Quer conversar sobre isso? Estou aqui para te escutar. 💙',
            'feliz' => 'Que alegria saber que você está feliz! Compartilhe comigo o que está te deixando assim! 😄',
            'ansioso' => 'A ansiedade pode ser desafiadora. Vamos respirar juntos? Conte-me o que está te deixando ansioso. 🌸',
            'cansado' => 'Percebo que você está cansado. É importante descansar. Quer conversar sobre o que está te esgotando? 😴'
        ];

        foreach ($keywords as $keyword => $response) {
            if (strpos($message_lower, $keyword) !== false) {
                return $response;
            }
        }

        // Respostas específicas por contexto
        switch ($context) {
            case 'diario':
                return 'Que bom que você quer registrar seus sentimentos! Como você está se sentindo hoje? Pode me contar sobre seu dia. 📔';
                
            case 'financas':
                return 'Vamos cuidar das suas finanças juntos! Me conte sobre seus gastos ou objetivos financeiros. 💰';
                
            case 'rotina':
                return 'Vamos organizar sua rotina! Quais são suas prioridades hoje? Posso te ajudar a planejar seu dia. 📅';
                
            default:
                return 'Estou aqui para te ajudar! Pode me contar o que está pensando ou sentindo. 💚';
        }
    }

    private function saveMessage($message, $sender, $context) {
        try {
            $stmt = $this->db->prepare("
                INSERT INTO interacoes (user_id, pergunta, resposta, created_at) 
                VALUES (?, ?, ?, NOW())
            ");
            
            if ($sender === 'user') {
                return $stmt->execute([$this->user_id, $message, '']);
            } else {
                // Atualizar a última interação com a resposta
                $stmt = $this->db->prepare("
                    UPDATE interacoes 
                    SET resposta = ? 
                    WHERE user_id = ? AND resposta = '' 
                    ORDER BY created_at DESC 
                    LIMIT 1
                ");
                return $stmt->execute([$message, $this->user_id]);
            }
        } catch (Exception $e) {
            error_log("Save message error: " . $e->getMessage());
            return false;
        }
    }

    private function getRecentMessages($context, $limit = 10) {
        try {
            $stmt = $this->db->prepare("
                SELECT pergunta, resposta, 'user' as sender
                FROM interacoes 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT ?
            ");
            $stmt->execute([$this->user_id, $limit]);
            return array_reverse($stmt->fetchAll());
        } catch (Exception $e) {
            error_log("Get recent messages error: " . $e->getMessage());
            return [];
        }
    }

    private function saveTokenUsage($tokens) {
        try {
            $stmt = $this->db->prepare("
                UPDATE interacoes 
                SET tokens_usados = ? 
                WHERE user_id = ? AND tokens_usados = 0 
                ORDER BY created_at DESC 
                LIMIT 1
            ");
            $stmt->execute([$tokens, $this->user_id]);
        } catch (Exception $e) {
            error_log("Save token usage error: " . $e->getMessage());
        }
    }

    public function getUsageStats($period = 'month') {
        try {
            $dateCondition = '';
            switch ($period) {
                case 'today':
                    $dateCondition = 'DATE(created_at) = CURDATE()';
                    break;
                case 'week':
                    $dateCondition = 'created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
                    break;
                case 'month':
                default:
                    $dateCondition = 'created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
                    break;
            }

            $stmt = $this->db->prepare("
                SELECT 
                    COUNT(*) as total_interactions,
                    SUM(tokens_usados) as total_tokens,
                    AVG(tokens_usados) as avg_tokens_per_interaction
                FROM interacoes 
                WHERE user_id = ? AND $dateCondition
            ");
            $stmt->execute([$this->user_id]);
            
            return $stmt->fetch();
        } catch (Exception $e) {
            error_log("Get usage stats error: " . $e->getMessage());
            return [
                'total_interactions' => 0,
                'total_tokens' => 0,
                'avg_tokens_per_interaction' => 0
            ];
        }
    }
}
?>