import { useState, useRef, useEffect } from 'react';
import { Button, Input, Avatar } from '@heroui/react';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'ai';
  timestamp: Date;
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '你好！我是智慧校园AI助手，有什么可以帮助你的吗？',
      role: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 模拟AI回复
  const simulateAIResponse = async (userMessage: string): Promise<string> => {
    // 这里应该调用真实的AI API
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    const responses = [
      '我理解你的问题。根据我的分析，这是一个很好的观点。',
      '感谢你的提问！让我为你详细解答...',
      '这是一个有趣的话题。从多个角度来看，我们可以这样理解...',
      '根据你的描述，我建议你可以尝试以下方法...',
      '好的，我已经理解了你的需求。让我为你提供相关信息...'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const aiResponse = await simulateAIResponse(userMessage.content);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        role: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('获取AI回复失败:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '抱歉，我遇到了一些问题，请稍后再试。',
        role: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 格式化时间
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100 flex items-center justify-center p-4">
      {/* 背景动画圆圈 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* 聊天容器 */}
      <div className="relative z-10 w-full max-w-4xl h-[80vh] flex flex-col">
        <div className="backdrop-blur-xl bg-white/40 rounded-3xl shadow-2xl border border-white/30 flex flex-col h-full overflow-hidden">
          
          {/* 头部 */}
          <div className="bg-gradient-to-r from-sky-500/80 to-blue-600/80 backdrop-blur-sm px-6 py-4 border-b border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">智慧校园AI助手</h1>
                <p className="text-xs text-white/80">在线 • 随时为您服务</p>
              </div>
            </div>
          </div>

          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div className={`flex gap-3 max-w-[75%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* 头像 */}
                  <Avatar
                    src={message.role === 'user' ? undefined : 'https://api.dicebear.com/7.x/bottts/svg?seed=ai'}
                    name={message.role === 'user' ? 'U' : 'AI'}
                    className={`w-10 h-10 flex-shrink-0 ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-br from-sky-500 to-blue-600' 
                        : 'bg-gradient-to-br from-purple-500 to-pink-600'
                    }`}
                  />
                  
                  {/* 消息气泡 */}
                  <div className="flex flex-col gap-1">
                    <div
                      className={`px-4 py-3 rounded-2xl shadow-md backdrop-blur-sm ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-tr-sm'
                          : 'bg-white/70 text-gray-800 rounded-tl-sm border border-white/30'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <span className={`text-xs text-gray-500 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {/* 加载指示器 */}
            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="flex gap-3 max-w-[75%]">
                  <Avatar
                    src="https://api.dicebear.com/7.x/bottts/svg?seed=ai"
                    name="AI"
                    className="w-10 h-10 flex-shrink-0 bg-gradient-to-br from-purple-500 to-pink-600"
                  />
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white/70 border border-white/30 shadow-md backdrop-blur-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* 输入区域 */}
          <div className="border-t border-white/20 bg-white/20 backdrop-blur-sm p-4">
            <div className="flex gap-3">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入消息... (按 Enter 发送)"
                disabled={isLoading}
                className="flex-1 bg-white/60 border-gray-300 text-gray-800 placeholder-gray-500 px-4 py-2 rounded-lg focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200"
                endContent={
                  inputValue.trim() && !isLoading ? (
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onClick={() => setInputValue('')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </Button>
                  ) : null
                }
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className={`bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 border-0 ${
                  (!inputValue.trim() || isLoading) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                startContent={
                  isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )
                }
              >
                发送
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              按 Enter 发送消息 • Shift + Enter 换行
            </p>
          </div>
        </div>
      </div>

      {/* CSS 动画 */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
