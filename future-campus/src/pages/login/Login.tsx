import {useState} from 'react';
import {Button, Input, Label, ErrorMessage} from "@heroui/react";
import { useNavigate } from 'react-router-dom';
import {getRSAKeyApi, loginApi} from "../../api/api.tsx";
import type {LoginRes, RSAKeyResponse} from "../../api/Response.tsx";
import JSEncrypt from 'jsencrypt';


export interface LoginProps {
  email:string
  password:string
}

/**
 * 使用 RSA 公钥加密密码（使用 JSEncrypt 匹配 Java 的 RSA/ECB/PKCS1Padding）
 * @param password - 要加密的密码
 * @param publicKeyBase64 - Base64 格式的公钥
 * @returns 加密后的 Base64 字符串
 */
async function encryptPassword(password: string, publicKeyBase64: string): Promise<string> {
  // 创建 JSEncrypt 实例
  const encryptor = new JSEncrypt();
  
  // 设置公钥（需要添加 PEM 头尾）
  const pemPublicKey = `-----BEGIN PUBLIC KEY-----\n${publicKeyBase64}\n-----END PUBLIC KEY-----`;
  encryptor.setPublicKey(pemPublicKey);
  
  // 加密密码
  const encrypted = encryptor.encrypt(password);
  
  if (!encrypted) {
    throw new Error('RSA encryption failed');
  }
  
  return encrypted;
}



export function Login() {

  const navigate = useNavigate();
  const [login, setLogin] = useState<LoginProps>({email: '', password: ''});
  const [emailPass, setEmailPass] = useState<boolean>(true);
  const [passwordPass, setPasswordPass] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  function ChangePassword(e) {
    //判断密码是否过于弱，并且包含数字字母和大小写字母
    if (e.target.value.length < 6 || !/[0-9]/.test(e.target.value) || !/[a-z]/.test(e.target.value) || !/[A-Z]/.test(e.target.value)) {
      setPasswordPass(false)
    } else {
      setPasswordPass(true)
    }
    setLogin({...login, password: e.target.value})
  }


  function ChangeEmail(e) {
    // 判断邮箱格式是否正确
    if (!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(e.target.value)) {
      setEmailPass(false)
    } else {
      setEmailPass(true)
    }

    setLogin({...login, email: e.target.value})
  }

  async function submit() {

    if (login.email === '') {
      setEmailPass(false)
      return;
    }



    if (login.password === '') {
      setPasswordPass(false)
      return;
    }

    // 发起登录请求
    setIsLoading(true);
    setError('');

    try {
      // 调用接口获取 RSA 公钥
      const publicKeyResponse: RSAKeyResponse = await getRSAKeyApi();

      // 使用公钥加密密码
      const encryptedPassword = await encryptPassword(login.password, publicKeyResponse.data);
      console.log(encryptedPassword)

      // 发送登录请求到后端 API（使用加密后的密码）
      const loginResponse:LoginRes = await loginApi({
        ...login,
        password: encryptedPassword
      });

      console.log('登录成功:', loginResponse);

      // 存储 token（如果后端返回了 token）
      if (loginResponse.code === 200) {
        localStorage.setItem('token', loginResponse.data);
        // 往cookie中塞入值
        document.cookie = `token=${loginResponse.data}; path=/;`;
        // 跳转到仪表盘页面
        navigate('/campusList');
      } else {
        setError(loginResponse.message)
        return;
      }

    } catch (err) {
      console.error('登录错误:', err);
      const errorMessage = err instanceof Error ? err.message : '登录失败，请稍后重试';
      console.log(err)
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100">
        {/* 背景动画圆圈 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-200/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        {/* 玻璃态卡片 */}
        <div className="relative z-10 w-full max-w-md mx-4">
          <div className="backdrop-blur-xl bg-white/40 rounded-3xl shadow-2xl p-8 border border-white/30">
            {/* Logo 和标题 */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-sky-500/20 rounded-full mb-4 backdrop-blur-sm">
                <svg className="w-12 h-12 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">欢迎回来</h1>
              <p className="text-gray-600">登录到智慧校园管理系统</p>
            </div>
  
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="input-type-email" className="text-gray-700 font-medium">邮箱</Label>
                <Input 
                  id="input-type-email" 
                  placeholder="xxxx@qq.com" 
                  type="email"
                  className="bg-white/60 border-gray-300 text-gray-800 placeholder-gray-500 px-4 py-3 rounded-lg focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200"
                  value={login?.email || ''}
                  onChange={(e) => {
                    ChangeEmail(e)
                  }}
                />
                {!emailPass && <ErrorMessage className="text-red-500">邮箱格式有误</ErrorMessage>}
              </div>
              
              <div className="flex flex-col gap-2">
                <Label htmlFor="input-type-password" className="text-gray-700 font-medium">密码</Label>
                <div className="relative">
                  <Input 
                    id="input-type-password" 
                    placeholder="••••••••" 
                    type={showPassword ? "text" : "password"}
                    className="bg-white/60 border-gray-300 text-gray-800 placeholder-gray-500 px-4 py-3 pr-12 rounded-lg focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200"
                    value={login?.password || ''}
                    onChange={
                      (e) => {
                        ChangePassword(e)
                      }
                    }
                  />
                  {/* 小眼睛按钮 */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200/50 rounded transition-colors duration-200"
                    aria-label={showPassword ? "隐藏密码" : "显示密码"}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {!passwordPass && <ErrorMessage className="text-red-500">密码必须包含大小写字母和数字</ErrorMessage>}
              </div>
  
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 backdrop-blur-sm">
                  <ErrorMessage className="text-red-600 text-sm">{error}</ErrorMessage>
                </div>
              )}
  
              {(passwordPass && emailPass) ? (
                <Button
                  fullWidth
                  variant="primary"
                  className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 border-0"
                  isLoading={isLoading}
                  onClick={submit}
                  startContent={isLoading ? null : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  )}
                >
                  {isLoading ? '登录中...' : '登录'}
                </Button>
              ) : (
                <Button
                  isDisabled
                  fullWidth
                  variant="primary"
                  className="w-full bg-gray-300/50 text-gray-500 font-semibold py-3 px-4 rounded-lg cursor-not-allowed border-0"
                >
                  登录
                </Button>
              )}
            </div>
  
            {/* 底部装饰 */}
            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm mb-2">
                还没有账号？
                <a href="/register" className="text-sky-600 font-medium hover:text-sky-700 hover:underline ml-1">立即注册</a>
              </p>
              <p className="text-gray-600 text-sm">
                <a href="/forgot-password" className="text-sky-600 font-medium hover:text-sky-700 hover:underline">忘记密码？</a>
              </p>
            </div>
          </div>
          
          {/* 版权信息 */}
          <p className="text-center text-gray-500 text-xs mt-6">
            © 2025 智慧校园管理系统。All rights reserved.
          </p>
        </div>
      </div>
  );
}
