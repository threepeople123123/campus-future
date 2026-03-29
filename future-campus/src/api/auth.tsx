import api from '../utils/request';
import type { LoginProps } from '../pages/login/Login.tsx';
import type {LoginResponse, RSAKeyResponse} from "./Response.ts";


export interface CommonResponse {
  code: number;
  message: string;
}



/**
 * 用户登录
 */
export async function loginApi(loginData: LoginProps): Promise<LoginResponse> {
  return await api.post('/login/login', loginData);
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
