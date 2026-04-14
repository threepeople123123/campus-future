import api from '../utils/request';
import type { LoginProps } from '../pages/login/Login.tsx';
import type {
  LoginResponse,
  RSAKeyResponse,
  ArticleResponse,
  SchoolListResponse,
  ArticleRequest,
  RegisterRequest,
  ResetPasswordRequest, PopularTag, LoginRes, ArticlePublishResponse, CommonResponse, AiChatRequest
} from "./Response.tsx";
import type {PublishProps} from "../pages/publish/Publish.tsx";


export interface CommonResponse {
  code: number;
  message: string;
}



/**
 * 用户登录
 */
export async function loginApi(loginData: LoginProps): Promise<LoginRes> {
  return await api.post('/login/login', loginData);
}

/**
 * 用户登录
 */
export async function registerApi(registerRequest: RegisterRequest): Promise<LoginResponse> {
  return await api.post('/login/register', registerRequest);
}


export async function resetPasswordApi(resetPasswordRequest:ResetPasswordRequest): Promise<CommonResponse> {
  return await api.post('/login/resetPassword',resetPasswordRequest);
}

/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  return await api.get('/user/info');
}

/**
 * 登出
 */
export async function logoutApi() {
  return await api.post('/logout');
}

export async function getRSAKeyApi():Promise<RSAKeyResponse> {
  return await api.get('/rsa/publicKey');
}

/**
 * 获取文章列表
 */
export async function getArticlePageListApi(requestData: ArticleRequest):Promise<ArticleResponse> {
  return await api.post('/article/pageList', requestData);
}

/**
 * 获取学校列表
 */
export async function getSchoolListApi():Promise<SchoolListResponse> {
  return await api.get('/school/list');
}

export async function refreshToken(){
  return await api.post('/logout');
}

export async function publish(){
  return await api.post('/logout');
}

export async function getCampusList(articleRequest:ArticleRequest):Promise<ArticleResponse[]>{
  return await api.post('/article/pageList',articleRequest);
}

export async function sendEmailCode(email:string):Promise<CommonResponse>{
  return await api.get('/login/sendCode', { params: { email } });
}

export async function getPopularTag():Promise<PopularTag[]>{
  return await api.get('/tag/getPopularTag');
}

export async function publishArticle(publishProps :PublishProps):Promise<ArticlePublishResponse>{
  return await api.post('/article/publishArticle',publishProps);
}

export async function ObjectUpload(formData:FormData):Promise<CommonResponse>{
  return await api.put('/object/upload',formData);
}

/**
 * AI聊天 - SSE流式响应 (POST方式)
 */
export async function aiChatStream(
  request: AiChatRequest,
  onMessage: (content: string) => void,
  onDone: () => void,
  onError: (error: string) => void
): Promise<AbortController> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  const url = `${baseUrl}/ai/chat`;
  
  const abortController = new AbortController();
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: abortController.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    if (!reader) {
      throw new Error('无法读取响应流');
    }

    // 异步读取流数据
    (async () => {
      try {
        let buffer = '';
        
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            onDone();
            break;
          }
          
          // 解码数据块
          buffer += decoder.decode(value, { stream: true });
          
          // 按行处理 SSE 格式数据
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // 保留最后一个不完整的行
          
          for (const line of lines) {
            const trimmedLine = line.trim();
            
            // 跳过空行和注释
            if (!trimmedLine || trimmedLine.startsWith(':')) {
              continue;
            }
            
            // 处理 data: 开头的行
            if (trimmedLine.startsWith('data:')) {
              const data = trimmedLine.substring(5).trim();
              
              // 检查是否是结束标记
              if (data === '[DONE]') {
                onDone();
                return;
              }
              
              try {
                const jsonData = JSON.parse(data);
                
                if (jsonData.type === 'error') {
                  onError(jsonData.error || '未知错误');
                  return;
                }
                
                // 直接返回 content 字段或整个数据
                const content = jsonData.content || jsonData.message || data;
                onMessage(content);
              } catch (e) {
                // 如果不是 JSON，直接作为文本内容
                onMessage(data);
              }
            }
          }
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          console.log('请求被中止');
        } else {
          console.error('读取流数据失败:', error);
          onError('读取数据失败');
        }
      }
    })();
    
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.log('请求被中止');
    } else {
      console.error('SSE连接错误:', error);
      onError('连接失败，请重试');
    }
  }
  
  return abortController;
}

