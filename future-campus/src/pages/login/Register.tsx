import {useState} from 'react';
import {Button, Input, Label, ErrorMessage} from "@heroui/react";
import { useNavigate } from 'react-router-dom';
import {getRSAKeyApi, registerApi, sendEmailCode} from "../../api/api.tsx";
import type {LoginResponse, RSAKeyResponse,RegisterRequest} from "../../api/Response.tsx";
import JSEncrypt from 'jsencrypt';




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
  const [register, setRegister] = useState<RegisterRequest>({
    email: '', 
    password: '', 
    confirmPassword: '', 
    userName: '',
    code:''
  });
  
  const [emailPass, setEmailPass] = useState<boolean>(true);
  const [passwordPass, setPasswordPass] = useState<boolean>(true);
  const [userNamePass, setUserNamePass] = useState<boolean>(true);
  const [confirmPass, setConfirmPass] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [sliderVerified, setSliderVerified] = useState<boolean>(false);
  const [sliderPosition, setSliderPosition] = useState<number>(0);
  const [isSendingCode, setIsSendingCode] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [verificationCodePass, setVerificationCodePass] = useState<boolean>(true);

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
    // 邮箱改变时重置滑块验证状态
    setSliderVerified(false);
    setSliderPosition(0);
    setRegister({...register, email: value});
  }

  // 处理滑块拖动
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setSliderPosition(value);
    
    // 当滑块滑到底部（>= 95%）时触发验证
    if (value >= 95 && !sliderVerified) {
      setSliderVerified(true);
      sendVerificationCode();
    }
  };

  // 发送验证码
  async function sendVerificationCode() {
    if (!emailPass || !register.email) {
      setError('请先输入正确的邮箱地址');
      setSuccess(''); // 清除成功消息
      setSliderVerified(false);
      setSliderPosition(0);
      return;
    }

    setIsSendingCode(true);
    setError(''); // 清除错误消息
    setSuccess(''); // 清除成功消息

    try {
      // 调用发送验证码接口
      const  response = await sendEmailCode(register.email)
      if (response.code === 200){
        // 发送成功
        setSuccess(response.message);
      }else{
        setError(response.message);
      }

    } catch (err) {
      console.error('发送验证码失败:', err);
      setError("发送失败");
      setSuccess(''); // 清除成功消息
      setSliderVerified(false);
      setSliderPosition(0);
    } finally {
      setIsSendingCode(false);
    }
  }

  function ChangeVerificationCode(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    // 验证码通常为6位数字
    if (value.length === 6 && /^\d{6}$/.test(value)) {
      setVerificationCodePass(true);
    } else {
      setVerificationCodePass(false);
    }
    setRegister({...register, verificationCode: value});
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

    if (!register.verificationCode || register.verificationCode === '') {
      setVerificationCodePass(false);
      setError('请输入验证码');
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
      const encryptedPassword = await encryptPassword(register.password, publicKeyResponse.data);

      const encryptedConfirmPassword = await encryptPassword(register.confirmPassword, publicKeyResponse.data);

      //  调用注册 API
      const registerResponse:LoginResponse = await registerApi({...register
        , password: encryptedPassword
        , confirmPassword:encryptedConfirmPassword})

      if (registerResponse.code === 200) {
        // 模拟注册成功
        setSuccess('注册成功！即将跳转到登录页面...');
        navigate('/login');
      }else {

        setError(registerResponse.message);
      }
      
      setTimeout(() => {

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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">创建账号</h1>
            <p className="text-gray-600">注册智慧校园管理系统</p>
          </div>

          <div className="flex flex-col gap-5">
            {/* 用户名输入框 */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="input-type-userName" className="text-gray-700 font-medium">用户名</Label>
              <Input 
                id="input-type-userName" 
                placeholder="请输入用户名（2-30 字符）" 
                type="text"
                className="bg-white/60 border-gray-300 text-gray-800 placeholder-gray-500 px-4 py-3 rounded-lg focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200"
                value={register?.userName || ''}
                onChange={ChangeUserName}
              />
              {!userNamePass && <ErrorMessage className="text-red-500">用户名长度为 2-30 字符</ErrorMessage>}
            </div>

            {/* 邮箱输入框 */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="input-type-email" className="text-gray-700 font-medium">邮箱</Label>
              <Input 
                id="input-type-email" 
                placeholder="xxxx@qq.com" 
                type="email"
                className="bg-white/60 border-gray-300 text-gray-800 placeholder-gray-500 px-4 py-3 rounded-lg focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200"
                value={register?.email || ''}
                onChange={ChangeEmail}
              />
              {!emailPass && <ErrorMessage className="text-red-500">邮箱格式有误</ErrorMessage>}
            </div>

            {/* 滑动验证码 */}
            <div className="flex flex-col gap-2">
              <Label className="text-gray-700 font-medium">滑动验证</Label>
              <div className="relative bg-gray-200/60 rounded-lg h-12 overflow-hidden border border-gray-300">
                {/* 进度条背景 */}
                <div 
                  className={`absolute left-0 top-0 h-full transition-all duration-100 ${
                    sliderVerified ? 'bg-green-500/30' : 'bg-sky-500/30'
                  }`}
                  style={{ width: `${sliderPosition}%` }}
                ></div>
                
                {/* 提示文字 */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className={`text-sm font-medium transition-colors duration-200 ${
                    sliderVerified ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {sliderVerified ? '✓ 验证成功' : isSendingCode ? '发送中...' : '→ 滑动发送验证码'}
                  </span>
                </div>
                
                {/* 滑块输入 */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPosition}
                  onChange={handleSliderChange}
                  disabled={sliderVerified || isSendingCode}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                
                {/* 滑块按钮 */}
                <div 
                  className={`absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg shadow-md transition-all duration-100 flex items-center justify-center ${
                    sliderVerified 
                      ? 'bg-green-500 left-[calc(100%-2.5rem)]' 
                      : 'bg-white border-2 border-sky-500'
                  }`}
                  style={{ 
                    left: sliderVerified ? undefined : `calc(${sliderPosition}% - 2.5rem)`,
                    minWidth: '2.5rem'
                  }}
                >
                  {sliderVerified ? (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              </div>
              {!sliderVerified && <ErrorMessage className="text-orange-500 text-xs">请滑动到右侧发送验证码</ErrorMessage>}
            </div>

            {/* 验证码输入框 */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="input-type-verification-code" className="text-gray-700 font-medium">验证码</Label>
              <Input 
                id="input-type-verification-code" 
                placeholder="请输入6位验证码" 
                type="text"
                maxLength={6}
                className="bg-white/60 border-gray-300 text-gray-800 placeholder-gray-500 px-4 py-3 rounded-lg focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200"
                value={register?.verificationCode || ''}
                onChange={ChangeVerificationCode}
              />
              {!verificationCodePass && <ErrorMessage className="text-red-500">请输入6位数字验证码</ErrorMessage>}
            </div>

            {/* 密码输入框 */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="input-type-password" className="text-gray-700 font-medium">密码</Label>
              <div className="relative">
                <Input 
                  id="input-type-password" 
                  placeholder="••••••••（包含大小写字母和数字）" 
                  type={showPassword ? "text" : "password"}
                  className="bg-white/60 border-gray-300 text-gray-800 placeholder-gray-500 px-4 py-3 pr-12 rounded-lg focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200"
                  value={register?.password || ''}
                  onChange={ChangePassword}
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
              {!passwordPass && <ErrorMessage className="text-red-500">密码必须包含大小写字母和数字，至少 6 位</ErrorMessage>}
            </div>

            {/* 确认密码输入框 */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="input-type-confirm-password" className="text-gray-700 font-medium">确认密码</Label>
              <div className="relative">
                <Input 
                  id="input-type-confirm-password" 
                  placeholder="••••••••" 
                  type={showConfirmPassword ? "text" : "password"}
                  className="bg-white/60 border-gray-300 text-gray-800 placeholder-gray-500 px-4 py-3 pr-12 rounded-lg focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200"
                  value={register?.confirmPassword || ''}
                  onChange={ChangeConfirmPassword}
                />
                {/* 小眼睛按钮 */}
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200/50 rounded transition-colors duration-200"
                  aria-label={showConfirmPassword ? "隐藏密码" : "显示密码"}
                >
                  {showConfirmPassword ? (
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
              {!confirmPass && <ErrorMessage className="text-red-500">两次输入的密码不一致</ErrorMessage>}
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 backdrop-blur-sm">
                <ErrorMessage className="text-red-600 text-sm">{error}</ErrorMessage>
              </div>
            )}

            {/* 成功提示 */}
            {success && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 backdrop-blur-sm">
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            )}

            {/* 注册按钮 */}
            {(passwordPass && emailPass && userNamePass && confirmPass && sliderVerified && verificationCodePass) ? (
              <Button
                fullWidth
                variant="primary"
                className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 border-0"
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
                className="w-full bg-gray-300/50 text-gray-500 font-semibold py-3 px-4 rounded-lg cursor-not-allowed border-0"
              >
                注册
              </Button>
            )}
          </div>

          {/* 底部装饰 */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              已有账号？
              <a href="/login" className="text-sky-600 font-medium hover:text-sky-700 hover:underline ml-1">立即登录</a>
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
