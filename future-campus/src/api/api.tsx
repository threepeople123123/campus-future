import api from '../utils/request';
import type { LoginProps } from '../pages/login/Login.tsx';
import type {
  LoginResponse,
  RSAKeyResponse,
  ArticleResponse,
  SchoolListResponse,
  ArticleRequest,
  RegisterRequest,
  ResetPasswordRequest, PopularTag, LoginRes, ArticlePublishResponse
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

