import {useState} from 'react';
import {Button, Input, Label, ErrorMessage} from "@heroui/react";
import { useNavigate } from 'react-router-dom';
import {getRSAKeyApi, loginApi} from "../../api/auth.tsx";
import type {LoginResponse, RSAKeyResponse} from "../../api/Response.ts";
import JSEncrypt from 'jsencrypt';
import Cookies from 'js-cookie';


export interface LoginProps {
  email:string
  password:string
  userName:string
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



export default function Login (){
  
  // 判断 cookie 中是否有 token
  const token = Cookies.get('token');
  if (token) {
    // 如果有 token，跳转到 dashboard 页面
    navigate("/campusList")
    return null;
  }

  const navigate = useNavigate();
  const [login, setLogin] = useState<LoginProps>({email:'', password:'', userName:''});
  const [emailPass,setEmailPass] = useState<boolean>(true);
  const [passwordPass,setPasswordPass] = useState<boolean>(true);
  const [userNamePass,setUserNamePass] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  function ChangePassword(e){
    //判断密码是否过于弱，并且包含数字字母和大小写字母
    if(e.target.value.length < 6 || !/[0-9]/.test(e.target.value) || !/[a-z]/.test(e.target.value) || !/[A-Z]/.test(e.target.value)){
      setPasswordPass(false)
    }else{
      setPasswordPass(true)
    }
    setLogin({...login, password:e.target.value})
  }

  function ChangeUserName(e){
    //判断密码是否过于弱，并且包含数字字母和大小写字母
    if(e.target.value.length < 0 || e.target.value.length > 30){
      setUserNamePass(false)
    }else{
      setUserNamePass(true)
    }
    setLogin({...login, userName:e.target.value})
  }

  function ChangeEmail(e){
    // 判断邮箱格式是否正确
    if(!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(e.target.value)){
      setEmailPass(false)
    }else{
      setEmailPass(true)
    }

    setLogin({...login, email:e.target.value})
  }

  async function submit(){

    if (login.email === '') {
      setEmailPass(false)
      return;
    }

    if (login.userName === '' ) {
      setUserNamePass(false)
      return;
    }

    if (login.password === '' ) {
      setPasswordPass(false)
      return;
    }

    // 发起登录请求
    setIsLoading(true);
    setError('');
    
    try {
      // 调用接口获取 RSA 公钥
      const publicKeyResponse:RSAKeyResponse= await getRSAKeyApi();
      console.log(publicKeyResponse.data);

      // 使用公钥加密密码
      const encryptedPassword = await encryptPassword(login.password, publicKeyResponse.data);
      console.log(encryptedPassword)

      // 发送登录请求到后端 API（使用加密后的密码）
      const loginResponse: LoginResponse = await loginApi({
        ...login,
        password: encryptedPassword
      });

      console.log('登录成功:', loginResponse);

      // 存储 token（如果后端返回了 token）
      if (loginResponse.code === 200) {
        // 设置 Cookie，7 天后过期
        Cookies.set('token', loginResponse.data.token, { 
          expires: 7, // 7 天
          path: '/', // 全局可用
          secure: window.location.protocol === 'https:', // HTTPS 时启用
          sameSite: 'strict' // 防止 CSRF
        });
        console.log('Token 已保存到 Cookie，7 天后过期');
      }else
      {
        setError(loginResponse.message)
        return;
      }
      // 跳转到仪表盘页面
      navigate('/campusList');
      
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
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="flex w-80 flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Label htmlFor="input-type-email" >邮箱</Label>
          <Input id="input-type-email" placeholder="xxxx@qq.com" type="email"
          value={login?.email || ''}
          onChange={(e) =>{
            ChangeEmail(e)
          }}
          />
          {  !emailPass && <ErrorMessage> 邮箱格式有误 </ErrorMessage>}
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="input-type-userName">用户名</Label>
          <Input id="input-type-userName" min={0} placeholder="请输入用户名" type="string"
                 value={login?.userName || ''}
                 onChange={
                   (e) =>{
                     ChangeUserName(e)
                   }}
          />
          {  !userNamePass && <ErrorMessage> 用户名不能为空，并且不能大于 30 字符 </ErrorMessage>}
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="input-type-password">密码</Label>
          <Input id="input-type-password" placeholder="••••••••" type="password"
                 value={login?.password || ''}
                 onChange={
                   (e) =>{
                     ChangePassword(e)
                   }}
          />
          { !passwordPass && <ErrorMessage>密码必须包含大小写字母和数字</ErrorMessage>}
        </div>
                
        {error && <ErrorMessage>{error}</ErrorMessage>}
                
        {(passwordPass && emailPass && userNamePass) && 
          <Button 
            fullWidth 
            variant="primary" 
            className="w-[400px] space-y-3"  
            isLoading={isLoading}
            onClick={submit}
          >
            {isLoading ? '登录中...' : '登录'}
          </Button>
        }
        {!(passwordPass && emailPass && userNamePass) && 
          <Button 
            isDisabled 
            fullWidth 
            variant="primary" 
            className="w-[400px] space-y-3"
          >
            登录
          </Button>
        }
      </div>
      </div>
  );
};
