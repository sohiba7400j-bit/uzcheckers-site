import { useState } from 'react';
import Anthropic from '@anthropic-ai/sdk';

export default function Learn() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { 
      role: 'assistant', 
      content: "Salom! Men sizning shashka bo'yicha shaxsiy AI ustozingizman. Qoidalarni o'rganamizmi, taktikalarni tahlil qilamizmi yoki savol-javob qilamizmi? Istalgan mavzuni tanlang yoki savolingizni yozing!" 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const anthropic = new Anthropic({
    apiKey: 'SHU_YERGA_CLAUDE_API_KALITINGIZNI_QOYING', // O'z API kalitingizni shu yerga yozing
    dangerouslyAllowBrowser: true,
  });

  // Tezkor o'rganish tugmalari uchun savollar
  const quickLessons = [
    "Shashka qoidalarini noldan o'rgating",
    "Eng kuchli boshlang'ich taktikalar qanday?",
    "Doshkamda qanday qilib damka qilish mumkin?",
    "Meni sinovdan o'tkazing (Viktorina)"
  ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMessage = textToSend.trim();
    setInput('');
    setLoading(true);

    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);

    try {
      // Claude uchun maxsus ko'rsatma (System prompt vazifasini bajaradi)
      const systemPrompt = "Sen professional shashka murabbiysisan. Foydalanuvchiga shashka o'yinini o'rgatasan, qoidalarni tushuntirasan, taktik maslahatlar berasan va o'yin davomida unga ustozlik qilasan. Javoblaringni o'zbek tilida, tushunarli, qiziqarli va do'stona tarzda yoz.";

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        system: systemPrompt,
        messages: newMessages.map(m => ({
          role: m.role,
          content: m.content
        })),
      });

      const textContent = response.content.find(c => c.type === 'text');
      const assistantMessage = textContent && 'text' in textContent ? textContent.text : "Javob olishda xatolik yuz berdi.";

      setMessages([...newMessages, { role: 'assistant', content: assistantMessage }]);
    } catch (error: any) {
      console.error("API xatoligi:", error);
      let errorMsg = "Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.";
      if (error?.status === 401) {
        errorMsg = "Xatolik: API kalitingiz noto'g'ri yoki yaroqsiz.";
      } else if (error?.status === 429) {
        errorMsg = "Xatolik: Balansda mablag' tugagan yoki so'rovlar soni oshib ketdi.";
      }
      setMessages([...newMessages, { role: 'assistant', content: errorMsg }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Shashka Akademiyasi - AI Ustoz bilan O'rganish</h2>
      
      {/* Tezkor dars tanlash tugmalari */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '15px' }}>
        {quickLessons.map((lesson, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(lesson)}
            style={{
              padding: '8px 12px',
              backgroundColor: '#e7f3ff',
              border: '1px solid #b6d4fe',
              borderRadius: '6px',
              color: '#084298',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500'
            }}
          >
            {lesson}
          </button>
        ))}
      </div>

      {/* Chat oynasi */}
      <div style={{ 
        border: '1px solid #ccc', 
        borderRadius: '8px', 
        height: '400px', 
        overflowY: 'auto', 
        padding: '15px', 
        marginBottom: '20px',
        backgroundColor: '#f9f9f9'
      }}>
        {messages.map((m, index) => (
          <div key={index} style={{ 
            marginBottom: '15px', 
            textAlign: m.role === 'user' ? 'right' : 'left' 
          }}>
            <div style={{ 
              display: 'inline-block', 
              padding: '12px 16px', 
              borderRadius: '12px', 
              backgroundColor: m.role === 'user' ? '#007bff' : '#e4e6eb',
              color: m.role === 'user' ? '#fff' : '#000',
              maxWidth: '80%',
              textAlign: 'left',
              wordBreak: 'break-word',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}>
              <strong>{m.role === 'user' ? 'Siz: ' : 'Claude Ustoz: '}</strong>
              <div style={{ whiteSpace: 'pre-wrap', marginTop: '5px', lineHeight: '1.4' }}>{m.content}</div>
            </div>
          </div>
        ))}
        {loading && <div style={{ color: '#666', fontStyle: 'italic' }}>Claude o'ylamoqda va javob yozmoqda...</div>}
      </div>

      {/* Xabar yozish maydoni */}
      <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }} style={{ display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Ustozdan shashka bo'yicha istalgan narsani so'rang..." 
          style={{ 
            flex: 1, 
            padding: '12px', 
            borderRadius: '8px', 
            border: '1px solid #ccc',
            fontSize: '15px'
          }}
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: '0 25px', 
            background: '#4CAF50', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '8px', 
            fontWeight: 'bold', 
            fontSize: '15px',
            cursor: 'pointer' 
          }}
        >
          Yuborish
        </button>
      </form>
    </div>
  );
}