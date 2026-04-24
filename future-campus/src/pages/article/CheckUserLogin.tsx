import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import { getUserInfoApi } from "../../api/api.tsx";
import type { LoginResponse } from "../../api/Response.tsx";

export default function CheckUserLogin() {
    const [isLogin, setIsLogin] = useState(false);
    const [userInfo, setUserInfo] = useState<{
        userName: string;
        userHeadUrl: string;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        checkLoginStatus();
    }, []);

    const checkLoginStatus = async () => {
        // 从 localStorage 和 cookie 中检查 token
        const localToken = localStorage.getItem("token");
        const cookieToken = document.cookie.split(';').find(c => c.trim().startsWith('token='));
        const token = localToken || (cookieToken ? cookieToken.split('=')[1] : null);

        if (!token) {
            setIsLogin(false);
            setIsLoading(false);
            return;
        }

        // 有 token，获取用户信息
        try {
            const response: LoginResponse = await getUserInfoApi();
            if (response.code === 200 && response.data) {
                setIsLogin(true);
                setUserInfo({
                    userName: response.data.userName,
                    userHeadUrl: response.data.userHeadUrl
                });
            } else {
                setIsLogin(false);
            }
        } catch (error) {
            console.error('获取用户信息失败:', error);
            setIsLogin(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoginClick = () => {
        navigate("/login");
    };

    const handleUserDetailClick = () => {
        navigate("/userDetail");
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center w-8 h-8">
                <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <>
            {!isLogin ? (
                // 未登录状态：显示登录/注册按钮
                <button
                    onClick={handleLoginClick}
                    className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>登录/注册</span>
                </button>
            ) : (
                // 已登录状态：显示用户信息
                <button
                    onClick={handleUserDetailClick}
                    className="flex items-center gap-3 px-3 py-2 bg-white/60 hover:bg-white/80 backdrop-blur-sm rounded-lg border border-white/30 shadow-md hover:shadow-lg transition-all duration-200 group"
                >
                    {/* 用户头像 */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white font-semibold overflow-hidden">
                        {userInfo?.userHeadUrl ? (
                            <img 
                                src={userInfo.userHeadUrl} 
                                alt={userInfo.userName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            userInfo?.userName?.charAt(0).toUpperCase() || 'U'
                        )}
                    </div>
                    
                    {/* 用户名 */}
                    <span className="text-gray-700 font-medium max-w-[100px] truncate group-hover:text-sky-600 transition-colors duration-200">
                        {userInfo?.userName || '用户'}
                    </span>
                    
                    {/* 下拉箭头图标 */}
                    <svg className="w-4 h-4 text-gray-500 group-hover:text-sky-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            )}
        </>
    );
}