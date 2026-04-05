import {useState} from 'react';
import {Button, Input, Label, ErrorMessage} from "@heroui/react";
import { useNavigate } from 'react-router-dom';
import {getRSAKeyApi} from "../../api/auth.tsx";
import type { RSAKeyResponse} from "../../api/Response.ts";
import JSEncrypt from 'jsencrypt';

export interface RegisterProps {
  email: string;
  password: string;
  confirmPassword: string;
  userName: string;
  verificationCode?: string;
}

/**
 * 使用 RSA 公钥加密密码
 */
async function encryptPassword(password: string, publicKeyBase64: string): Promise<string> {
  const encryptor = new JSEncrypt();
  const pemPublicKey = `-----BEGIN PUBLIC KEY-----\n${publicKeyBase64}\n-----END PUBLIC KEY-----`;
  encryptor.setPublicKey(pemPublicKey);
  const encrypted = encryptor.encrypt(password);
  
  if (!encrypted) {
    throw new Error('RSA encryption failed');
  }
  
  return encrypted;
}

export function Register() {
  const navigate = useNavigate();
  const [register, setRegister] = useState<RegisterProps>({
    email: '', 
    password: '', 
    confirmPassword: '', 
    userName: ''
  });
  
  const [emailPass, setEmailPass] = useState<boolean>(true);
  const [passwordPass, setPasswordPass] = useState<boolean>(true);
  const [userNamePass, setUserNamePass] = useState<boolean>(true);
  const [confirmPass, setConfirmPass] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  function ChangePassword(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (value.length < 6 || !/[0-9]/.test(value) || !/[a-z]/.test(value) || !/[A-Z]/.test(value)) {
      setPasswordPass(false);
    } else {
      setPasswordPass(true);
    }
    
    // 检查两次密码是否一致
    if (register.confirmPassword && value !== register.confirmPassword) {
      setConfirmPass(false);
    } else {
      setConfirmPass(true);
    }
    
    setRegister({...register, password: value});
  }

  function ChangeConfirmPassword(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (register.password && value !== register.password) {
      setConfirmPass(false);
    } else {
      setConfirmPass(true);
    }
    setRegister({...register, confirmPassword: value});
  }

  function ChangeUserName(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (value.length < 2 || value.length > 30) {
      setUserNamePass(false);
    } else {
      setUserNamePass(true);
    }
    setRegister({...register, userName: value});
  }

  function ChangeEmail(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value)) {
      setEmailPass(false);
    } else {
      setEmailPass(true);
    }
    setRegister({...register, email: value});
  }

  async function submit() {
    // 验证所有字段
    if (register.email === '') {
      setEmailPass(false);
      return;
    }

    if (register.userName === '') {
      setUserNamePass(false);
      return;
    }

    if (register.password === '') {
      setPasswordPass(false);
      return;
    }

    if (register.confirmPassword === '') {
      setConfirmPass(false);
      return;
    }

    if (register.password !== register.confirmPassword) {
      setConfirmPass(false);
      setError('两次输入的密码不一致');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // 获取 RSA 公钥
      const publicKeyResponse: RSAKeyResponse = await getRSAKeyApi();
      
      // 加密密码
      const encryptedPassword = await encryptPassword(register.password, publicKeyResponse.data.publicKey);

      // TODO: 调用注册 API
      console.log('注册信息:', {
        ...register,
        password: encryptedPassword
      });

      // 模拟注册成功
      setSuccess('注册成功！即将跳转到登录页面...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      console.error('注册错误:', err);
      const errorMessage = err instanceof Error ? err.message : '注册失败，请稍后重试';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-slate-900">
      {/* 背景动画圆圈 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* 玻璃态卡片 */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="backdrop-blur-xl bg-gray-900/40 rounded-3xl shadow-2xl p-8 border border-white/10">
          {/* Logo 和标题 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-500/20 rounded-full mb-4 backdrop-blur-sm">
              <svg className="w-12 h-12 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-100 mb-2">创建账号</h1>
            <p className="text-gray-400">注册智慧校园管理系统</p>
          </div>

          <div className="flex flex-col gap-5">
            {/* 用户名输入框 */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="input-type-userName" className="text-gray-300 font-medium">用户名</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <Input 
                  id="input-type-userName" 
                  placeholder="请输入用户名（2-30 字符）" 
                  type="text"
                  className="bg-gray-800/50 border-gray-700 text-gray-100 placeholder-gray-500 pl-10 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                  value={register?.userName || ''}
                  onChange={ChangeUserName}
                />
              </div>
              {!userNamePass && <ErrorMessage className="text-red-400">用户名长度为 2-30 字符</ErrorMessage>}
            </div>

            {/* 邮箱输入框 */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="input-type-email" className="text-gray-300 font-medium">邮箱</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <Input 
                  id="input-type-email" 
                  placeholder="xxxx@qq.com" 
                  type="email"
                  className="bg-gray-800/50 border-gray-700 text-gray-100 placeholder-gray-500 pl-10 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                  value={register?.email || ''}
                  onChange={ChangeEmail}
                />
              </div>
              {!emailPass && <ErrorMessage className="text-red-400">邮箱格式有误</ErrorMessage>}
            </div>

            {/* 密码输入框 */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="input-type-password" className="text-gray-300 font-medium">密码</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <Input 
                  id="input-type-password" 
                  placeholder="••••••••（包含大小写字母和数字）" 
                  type="password"
                  className="bg-gray-800/50 border-gray-700 text-gray-100 placeholder-gray-500 pl-10 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                  value={register?.password || ''}
                  onChange={ChangePassword}
                />
              </div>
              {!passwordPass && <ErrorMessage className="text-red-400">密码必须包含大小写字母和数字，至少 6 位</ErrorMessage>}
            </div>

            {/* 确认密码输入框 */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="input-type-confirm-password" className="text-gray-300 font-medium">确认密码</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <Input 
                  id="input-type-confirm-password" 
                  placeholder="••••••••" 
                  type="password"
                  className="bg-gray-800/50 border-gray-700 text-gray-100 placeholder-gray-500 pl-10 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                  value={register?.confirmPassword || ''}
                  onChange={ChangeConfirmPassword}
                />
              </div>
              {!confirmPass && <ErrorMessage className="text-red-400">两次输入的密码不一致</ErrorMessage>}
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 backdrop-blur-sm">
                <ErrorMessage className="text-red-400 text-sm">{error}</ErrorMessage>
              </div>
            )}

            {/* 成功提示 */}
            {success && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 backdrop-blur-sm">
                <p className="text-green-400 text-sm">{success}</p>
              </div>
            )}

            {/* 注册按钮 */}
            {(passwordPass && emailPass && userNamePass && confirmPass) ? (
              <Button
                fullWidth
                variant="primary"
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 border-0"
                isLoading={isLoading}
                onClick={submit}
                startContent={isLoading ? null : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                )}
              >
                {isLoading ? '注册中...' : '注册'}
              </Button>
            ) : (
              <Button
                isDisabled
                fullWidth
                variant="primary"
                className="w-full bg-gray-700/50 text-gray-400 font-semibold py-3 px-4 rounded-lg cursor-not-allowed border-0"
              >
                注册
              </Button>
            )}
          </div>

          {/* 底部装饰 */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              已有账号？
              <a href="/login" className="text-purple-400 font-medium hover:text-purple-300 hover:underline ml-1">立即登录</a>
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
