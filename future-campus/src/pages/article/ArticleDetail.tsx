import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getArticleDetailApi } from "../../api/api.tsx";
import type { ArticleDetail } from "../../api/Response.tsx";

export default function ArticleDetail() {
    const location = useLocation();
    const navigate = useNavigate();
    const [article, setArticle] = useState<ArticleDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 从路由状态中获取文章ID
    const articleId = location.state?.id;

    useEffect(() => {
        if (!articleId) {
            setError("文章ID不存在");
            setIsLoading(false);
            return;
        }

        fetchArticleDetail(articleId);
    }, [articleId]);

    const fetchArticleDetail = async (id: string) => {
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await getArticleDetailApi(id);
            
            if (response.code === 500 || !response.data) {
                setError(response.message || "获取文章详情失败");
                return;
            }
            
            setArticle(response.data);
        } catch (err) {
            console.error("获取文章详情失败:", err);
            setError("网络请求失败，请稍后重试");
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleLike = () => {
        // TODO: 实现点赞功能
        console.log("点赞文章:", article?.id);
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

    if (error || !article) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100 flex items-center justify-center px-4">
                <div className="backdrop-blur-xl bg-white/40 border border-white/30 rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                    <svg className="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">加载失败</h3>
                    <p className="text-gray-600 mb-6">{error || "文章不存在"}</p>
                    <button
                        onClick={handleBack}
                        className="px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors duration-200"
                    >
                        返回列表
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
                        <span>返回文章列表</span>
                    </button>
                </div>

                {/* 文章卡片 */}
                <div className="w-full max-w-4xl backdrop-blur-xl bg-white/60 border border-white/30 rounded-2xl shadow-lg overflow-hidden">
                    {/* 文章头部 */}
                    <div className="p-8 border-b border-gray-200/50">
                        <h1 className="text-3xl font-bold text-gray-800 mb-4 leading-tight">
                            {article.title}
                        </h1>
                        
                        {/* 作者信息和元数据 */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            {article.sendUserName && (
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                                        {article.sendUserName.charAt(0).toUpperCase()}
                                    </div>
                                    <span>{article.sendUserName}</span>
                                </div>
                            )}
                            
                            {article.createTime && (
                                <div className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>{new Date(article.createTime).toLocaleString('zh-CN')}</span>
                                </div>
                            )}
                            
                            {article.schoolName && (
                                <div className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <span>{article.schoolName}</span>
                                </div>
                            )}
                        </div>

                        {/* 标签 */}
                        {article.tag && article.tag.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                                {article.tag.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 text-xs font-medium"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 文章图片 */}
                    {article.photoUrl && article.photoUrl.length > 0 && (
                        <div className="p-8 pt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {article.photoUrl.map((url, index) => (
                                    <img
                                        key={index}
                                        src={url}
                                        alt={`文章图片 ${index + 1}`}
                                        className="w-full h-64 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 文章内容 */}
                    <div className="p-8 pt-0">
                        <div className="prose prose-sky max-w-none">
                            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                                {article.content}
                            </div>
                        </div>
                    </div>

                    {/* 底部操作栏 */}
                    <div className="p-6 border-t border-gray-200/50 bg-white/30">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                {/* 点赞 */}
                                <button
                                    onClick={handleLike}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                                        article.isLiked
                                            ? 'bg-red-50 text-red-600'
                                            : 'hover:bg-red-50 text-gray-600 hover:text-red-600'
                                    }`}
                                >
                                    <svg 
                                        className={`w-5 h-5 ${article.isLiked ? 'fill-current' : ''}`} 
                                        fill={article.isLiked ? "currentColor" : "none"} 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    <span className="font-medium">{article.likeCount || 0}</span>
                                </button>

                                {/* 浏览量 */}
                                <div className="flex items-center gap-2 text-gray-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    <span>{article.heat || 0}</span>
                                </div>

                                {/* 评论数 */}
                                {article.commentCount !== undefined && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        <span>{article.commentCount}</span>
                                    </div>
                                )}
                            </div>

                            {/* 分享按钮 */}
                            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-sky-50 hover:text-sky-600 rounded-lg transition-all duration-200">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                                <span>分享</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
