import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserInfoApi, getArticlePageListApi } from "../../api/api.tsx";
import type {Article, ArticlePageResponse, LoginResponse} from "../../api/Response.tsx";

export interface UserInfo {
    id: number;
    email: string;
    userName: string;
    userHeadUrl: string;
    schoolName: string;
    schoolId: string;
    createTime: string;
}

export default function UserDetail() {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [userArticles, setUserArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'articles' | 'likes'>('articles');

    useEffect(() => {
        fetchUserInfo();
    }, []);

    const fetchUserInfo = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const response:LoginResponse = await getUserInfoApi();
            
            if (response.code === 200 && response.data) {
                setUserInfo(response.data);
                // 获取用户发布的文章
                fetchUserArticles(response.data.id);
            } else {
                setError(response.message || "获取用户信息失败");
                setIsLoading(false);
            }
        } catch (err) {
            console.error("获取用户信息失败:", err);
            setError("网络请求失败，请稍后重试");
            setIsLoading(false);
        }
    };

    const fetchUserArticles = async () => {
        try {
            const response:ArticlePageResponse = await getArticlePageListApi({
                pageNum: 1,
                pageSize: 10,
                query: undefined,
                tag: undefined,
                viewRange: undefined,
                schoolId: undefined,
                schoolName: undefined
            });
            
            if (response.code === 200 && response.data?.records) {
                // 过滤出当前用户的文章
                setUserArticles(response.data.records);
            }
        } catch (err) {
            console.error("获取用户文章失败:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleArticleClick = (articleId: number) => {
        navigate('/articleDetail', { state: { id: articleId.toString() } });
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        navigate('/login');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100 flex items-center justify-center">
                <div className="flex items-center gap-2 text-gray-600">
                    <div className="w-3 h-3 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-3 h-3 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-3 h-3 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    <span className="ml-2">加载中...</span>
                </div>
            </div>
        );
    }

    if (error || !userInfo) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100 flex items-center justify-center px-4">
                <div className="backdrop-blur-xl bg-white/40 border border-white/30 rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                    <svg className="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">加载失败</h3>
                    <p className="text-gray-600 mb-6">{error || "用户信息不存在"}</p>
                    <button
                        onClick={handleBack}
                        className="px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors duration-200"
                    >
                        返回
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100">
            {/* 背景动画圆圈 */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-200/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* 主内容区域 */}
            <div className="relative z-10 flex flex-col items-center min-h-screen py-8 px-[10vw]">
                {/* 返回按钮 */}
                <div className="w-full max-w-4xl mb-6">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-gray-600 hover:text-sky-600 transition-colors duration-200 group"
                    >
                        <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>返回</span>
                    </button>
                </div>

                {/* 用户信息卡片 */}
                <div className="w-full max-w-4xl backdrop-blur-xl bg-white/60 border border-white/30 rounded-2xl shadow-lg overflow-hidden mb-6">
                    {/* 头部背景 */}
                    <div className="h-32 bg-gradient-to-r from-sky-400 to-blue-500 relative">
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoLTJ2NGgyem0tNiA2aC00djJoNHYtMnptMC02di00aC00djRoNHptLTYgNmgtNHYyaDR2LTJ6bTAtNnYtNGgtNHY0aDR6Ii8+PC9nPjwvZz48L3N2Zz4=')]"></div>
                        </div>
                    </div>

                    {/* 用户头像和信息 */}
                    <div className="px-8 pb-8">
                        <div className="relative -mt-16 mb-6">
                            <div className="inline-block">
                                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                                    {userInfo.userHeadUrl ? (
                                        <img 
                                            src={userInfo.userHeadUrl} 
                                            alt={userInfo.userName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        userInfo.userName.charAt(0).toUpperCase()
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">{userInfo.userName}</h1>
                            <p className="text-gray-600 flex items-center gap-2">
                                <svg className="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                {userInfo.email}
                            </p>
                        </div>

                        {/* 用户详细信息 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-white/50 rounded-lg p-4 border border-white/30">
                                <div className="flex items-center gap-3 mb-2">
                                    <svg className="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <span className="text-sm text-gray-500">学校</span>
                                </div>
                                <p className="text-gray-800 font-medium">{userInfo.schoolName || "未设置"}</p>
                            </div>

                            <div className="bg-white/50 rounded-lg p-4 border border-white/30">
                                <div className="flex items-center gap-3 mb-2">
                                    <svg className="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-sm text-gray-500">注册时间</span>
                                </div>
                                <p className="text-gray-800 font-medium">
                                    {new Date(userInfo.createTime).toLocaleDateString('zh-CN')}
                                </p>
                            </div>
                        </div>

                        {/* 统计数据 */}
                        <div className="flex items-center gap-8 py-4 border-t border-gray-200/50">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-800">{userArticles.length}</div>
                                <div className="text-sm text-gray-500">文章</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-800">
                                    {userArticles.reduce((sum, article) => sum + (article.likeCount || 0), 0)}
                                </div>
                                <div className="text-sm text-gray-500">获赞</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-800">
                                    {userArticles.reduce((sum, article) => sum + (Number(article.heat) || 0), 0)}
                                </div>
                                <div className="text-sm text-gray-500">浏览</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab 切换和内容 */}
                <div className="w-full max-w-4xl backdrop-blur-xl bg-white/60 border border-white/30 rounded-2xl shadow-lg overflow-hidden">
                    {/* Tab 头部 */}
                    <div className="flex border-b border-gray-200/50">
                        <button
                            onClick={() => setActiveTab('articles')}
                            className={`flex-1 py-4 px-6 text-center font-medium transition-colors duration-200 ${
                                activeTab === 'articles'
                                    ? 'text-sky-600 border-b-2 border-sky-600 bg-sky-50/50'
                                    : 'text-gray-600 hover:text-sky-600 hover:bg-sky-50/30'
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>我的文章</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('likes')}
                            className={`flex-1 py-4 px-6 text-center font-medium transition-colors duration-200 ${
                                activeTab === 'likes'
                                    ? 'text-sky-600 border-b-2 border-sky-600 bg-sky-50/50'
                                    : 'text-gray-600 hover:text-sky-600 hover:bg-sky-50/30'
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <span>我的点赞</span>
                            </div>
                        </button>
                    </div>

                    {/* Tab 内容 */}
                    <div className="p-6">
                        {activeTab === 'articles' && (
                            <div>
                                {userArticles.length === 0 ? (
                                    <div className="text-center py-12">
                                        <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="text-gray-500">还没有发布文章</p>
                                        <button
                                            onClick={() => navigate('/publish')}
                                            className="mt-4 px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors duration-200"
                                        >
                                            去发布
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {userArticles.map((article) => (
                                            <div
                                                key={article.id}
                                                onClick={() => handleArticleClick(article.id)}
                                                className="bg-white/50 rounded-lg p-4 border border-white/30 hover:bg-white/70 hover:shadow-md transition-all duration-200 cursor-pointer group"
                                            >
                                                <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-sky-600 transition-colors duration-200">
                                                    {article.title}
                                                </h3>
                                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                                    {typeof article.content === 'string' 
                                                        ? article.content.substring(0, 100) + '...'
                                                        : '点击查看文章内容'}
                                                </p>
                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <span>{new Date(article.createTime).toLocaleDateString('zh-CN')}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                        </svg>
                                                        <span>{article.likeCount || 0}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        <span>{article.heat || 0}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'likes' && (
                            <div className="text-center py-12">
                                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <p className="text-gray-500">功能开发中...</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 退出登录按钮 */}
                <div className="w-full max-w-4xl mt-6">
                    <button
                        onClick={handleLogout}
                        className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-600 font-medium rounded-lg border border-red-500/30 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        退出登录
                    </button>
                </div>
            </div>
        </div>
    );
}
