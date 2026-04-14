import { useState, useRef, useEffect } from 'react';
import {  TextArea } from '@heroui/react';
import {aiChatStream} from "../../api/api.tsx";
import type {AiChatRequest} from "../../api/Response.tsx";

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
  const [conversationId, setConversationId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 初始化 conversationId
  useEffect(() => {
    const newConversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setConversationId(newConversationId);
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

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
    const currentInput = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    let aiMessageContent = '';
    const aiMessageId = (Date.now() + 1).toString();
    
    // 先创建一个空的 AI 消息
    setMessages(prev => [...prev, {
      id: aiMessageId,
      content: '',
      role: 'ai',
      timestamp: new Date()
    }]);

    try {
      const aiChatRequest: AiChatRequest = {
        msg: currentInput,
        conversationId: conversationId
      };

      abortControllerRef.current = await aiChatStream(
        aiChatRequest,
        (content) => {
          // 接收流式数据，逐步更新消息内容
          aiMessageContent += content;
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, content: aiMessageContent }
              : msg
          ));
        },
        () => {
          // 完成回调
          setIsLoading(false);
          abortControllerRef.current = null;
        },
        (error) => {
          // 错误回调
          console.error('AI聊天错误:', error);
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, content: error || '抱歉，我遇到了一些问题，请稍后再试。' }
              : msg
          ));
          setIsLoading(false);
          abortControllerRef.current = null;
        }
      );
    } catch (error) {
      console.error('获取AI回复失败:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId 
          ? { ...msg, content: '抱歉，我遇到了一些问题，请稍后再试。' }
          : msg
      ));
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100 flex flex-col relative overflow-hidden">
      {/* 背景动画圆圈 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* 头部导航栏 */}
      <header className="relative z-10 border-b border-white/30 backdrop-blur-xl bg-white/40 px-4 py-3 flex items-center justify-between sticky top-0">
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-sky-500/10 rounded-lg transition-colors duration-200">
            <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-800">新对话</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-sky-500/10 rounded-lg transition-colors duration-200" title="分享">
            <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </header>

      {/* 消息列表区域 */}
      <main className="relative z-10 flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {messages.length === 1 && messages[0].role === 'ai' ? (
            // 欢迎界面
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
              <div className="w-20 h-20 bg-sky-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-gray-800">有什么可以帮您的?</h2>
                <p className="text-gray-600">我是智慧校园AI助手,随时为您解答问题</p>
              </div>
              
              {/* 快捷提问卡片 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                {[
                  { icon: '💡', text: '帮我写一篇关于人工智能的文章' },
                  { icon: '📝', text: '如何高效学习编程?' },
                  { icon: '🎯', text: '推荐一些优质的学习资源' },
                  { icon: '❓', text: '解释一下什么是机器学习' }
                ].map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setInputValue(item.text)}
                    className="p-4 text-left backdrop-blur-xl bg-white/40 border border-white/30 rounded-xl hover:bg-white/60 hover:border-sky-500/30 transition-all duration-200 group shadow-lg"
                  >
                    <span className="text-2xl mb-2 block">{item.icon}</span>
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">{item.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // 对话消息列表
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in`}
                >
                  {/* AI头像 */}
                  {message.role === 'ai' && (
                    <div className="w-8 h-8 flex-shrink-0 bg-sky-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-sky-500/30">
                      <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* 用户头像 */}
                  {message.role === 'user' && (
                    <div className="w-8 h-8 flex-shrink-0 bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* 消息内容 */}
                  <div className={`flex-1 max-w-[85%] ${message.role === 'user' ? 'text-right' : ''}`}>
                    <div
                      className={`inline-block px-4 py-3 rounded-2xl backdrop-blur-xl shadow-lg ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-tr-sm border border-sky-400/30'
                          : 'bg-white/60 text-gray-800 border border-white/30'
                      }`}
                    >
                      <div className="text-sm leading-relaxed whitespace-pre-wrap text-left">
                        {message.content}
                      </div>
                    </div>
                    
                    {/* 消息操作按钮(AI消息) */}
                    {message.role === 'ai' && (
                      <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 hover:bg-sky-500/10 rounded transition-colors duration-200" title="复制">
                          <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button className="p-1.5 hover:bg-sky-500/10 rounded transition-colors duration-200" title="点赞">
                          <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                          </svg>
                        </button>
                        <button className="p-1.5 hover:bg-sky-500/10 rounded transition-colors duration-200" title="点踩">
                          <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                          </svg>
                        </button>
                        <button className="p-1.5 hover:bg-sky-500/10 rounded transition-colors duration-200" title="重新生成">
                          <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* 加载中指示器 */}
              {isLoading && (
                <div className="flex gap-4 animate-fade-in">
                  <div className="w-8 h-8 flex-shrink-0 bg-sky-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-sky-500/30">
                    <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1 px-4 py-3 backdrop-blur-xl bg-white/60 rounded-2xl border border-white/30 shadow-lg">
                      <div className="w-2 h-2 bg-sky-500 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-sky-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-sky-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* 底部输入区域 */}
      <footer className="relative z-10 border-t border-white/30 backdrop-blur-xl bg-white/40 px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative backdrop-blur-xl bg-white/60 border border-white/30 rounded-2xl shadow-lg focus-within:border-sky-500/50 focus-within:shadow-xl transition-all duration-200">
            <TextArea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="发送消息..."
              disabled={isLoading}
              minRows={1}
              maxRows={6}
              className="w-full bg-transparent border-0 resize-none px-4 py-3 pr-12 text-gray-800 placeholder-gray-500 focus:ring-0 focus:outline-none"
            />
            
            {/* 发送按钮 */}
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className={`absolute right-2 bottom-2 p-2 rounded-lg transition-all duration-200 ${
                inputValue.trim() && !isLoading
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  : 'bg-gray-300/50 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              )}
            </button>
          </div>
          
          {/* 底部提示文字 */}
          <p className="text-xs text-gray-600 text-center mt-3">
            AI生成内容仅供参考,请核实重要信息
          </p>
        </div>
      </footer>

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
