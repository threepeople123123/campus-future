import {useEffect, useState, useRef, useCallback} from "react";
import {useNavigate} from "react-router-dom";
import {getCampusList} from "../../api/api.tsx";
import type {ArticleRequest, Article, ArticlePageResponse} from "../../api/Response.tsx";
import {Button} from "@heroui/react";


export default function CampusList() {
    const navigate = useNavigate();
    const [campusList, setCampusList] = useState<Article[]>([])
    const [pageNum, setPageNum] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const observerTarget = useRef<HTMLDivElement>(null);

    const pageSize = 10

    function viewArticle(id: number){
        navigate("/articleDetail", { state: { id: id } })
    }

    // 获取数据
    const fetchCampusList = useCallback(async (page: number, append = false) => {
        // 1. 防止重复请求
        if (isLoading) return;

        setIsLoading(true);
        try {
            const articleRequest: ArticleRequest = {
                pageNum: page,
                pageSize: pageSize
            };

            const response:ArticlePageResponse = await getCampusList(articleRequest);

            // 2. 检查业务状态码
            if (response.code === 500 || !response.data) {
                console.error('后端业务异常');
                setHasMore(false); // 既然出错了，通常停止继续加载更多以免死循环
                return;
            }

            const articleList = response.data.records || []; // 从 data.records 中提取数组
            const total = response.data.total || 0;

            // 3. 更新列表
            if (append) {
                setCampusList(prev => [...prev, ...articleList]);
            } else {
                setCampusList(articleList);
            }

            // 4. 判断是否还有更多数据
            if (articleList.length < pageSize || total <= pageNum * pageSize) {
                setHasMore(false);
            }

        } catch (error) {
            console.error('网络或系统失败:', error);
            setHasMore(false);
        } finally {
            // 5. 无论成功失败，必须释放锁
            setIsLoading(false);
        }
    }, [pageSize]); // 注意：依赖项去掉 isLoading，否则 useCallback 会因为 isLoading 变化而频繁重排

    // 初始加载和页码变化时获取数据
    useEffect(() => {
        fetchCampusList(pageNum, pageNum > 1);
    }, [pageNum, fetchCampusList]);

    // Intersection Observer 实现无限滚动
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !isLoading) {
                    setPageNum(prev => prev + 1);
                }
            },
            { threshold: 0.5 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [hasMore, isLoading]);

    return (

        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100">
            {/* 背景动画圆圈 */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-200/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            {/* 主内容区域 */}
            <div className="relative z-10 flex flex-col items-center min-h-screen py-8 px-[10vw]">
                {/* 顶部标题 */}
                <div className="w-full max-w-5xl mb-8">
                    <div className="flex items-center justify-between">
                        <div className="text-center flex-1">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">校园文章列表</h1>
                            <p className="text-gray-600">浏览最新的校园动态和文章</p>
                        </div>
                        <Button className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                        onClick={() => {navigate("/publish")}}>
                            发布文章
                        </Button>

                        <Button className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                                onClick={() => {navigate("/aiChat")}}>
                            ai助手
                        </Button>
                    </div>
                </div>

                {/* 文章卡片列表 */}
                <div className="w-full max-w-5xl space-y-4">
                    {campusList.length > 0 ? (
                        campusList.map((campus, index) => (
                            <div
                                key={campus.id}
                                className="group backdrop-blur-xl bg-white/40 border border-white/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/60 overflow-hidden"
                                style={{
                                    animation: `fade-in-up 0.5s ease-out ${index * 0.05}s both`
                                }}
                                onClick={() =>{
                                    viewArticle(campus.id)
                                }}
                            >
                                <div className="p-6">
                                    {/* 标题区域 */}
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <h3 className="text-xl font-semibold text-gray-800 group-hover:text-sky-600 transition-colors duration-200 line-clamp-2">
                                            {campus.title}
                                        </h3>
                                        <span className="flex-shrink-0 inline-flex items-center px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 text-xs font-medium">
                                            文章
                                        </span>
                                    </div>
                                    
                                    {/* 内容预览 */}
                                    {campus.content && (
                                        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                                            {typeof campus.content === 'string' ? campus.content : '点击查看详细内容'}
                                        </p>
                                    )}
                                    
                                    {/* 底部信息栏 */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            {campus.sendUserName && (
                                                <div className="flex items-center gap-1.5">
                                                    <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    <span>{campus.sendUserName}</span>
                                                </div>
                                            )}
                                            {campus.createTime && (
                                                <div className="flex items-center gap-1.5">
                                                    <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span>{new Date(campus.createTime).toLocaleDateString('zh-CN')}</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            {campus.likeCount !== undefined && (
                                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                                    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                                    </svg>
                                                    <span>{campus.likeCount}</span>
                                                </div>
                                            )}
                                            <button className="text-sky-600 hover:text-sky-700 text-sm font-medium transition-colors duration-200">
                                                查看详情 →
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        !isLoading && (
                            <div className="text-center py-16 backdrop-blur-xl bg-white/40 border border-white/30 rounded-2xl">
                                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="text-gray-500 text-lg">暂无文章数据</p>
                            </div>
                        )
                    )}
                    
                    {/* 加载更多指示器 */}
                    {isLoading && (
                        <div className="flex justify-center items-center py-8">
                            <div className="flex items-center gap-2 text-gray-600">
                                <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        </div>
                    )}
                    
                    {/* 观察目标元素 */}
                    <div ref={observerTarget} className="h-10" />
                    
                    {/* 没有更多数据提示 */}
                    {!hasMore && campusList.length > 0 && (
                        <div className="text-center py-6 text-gray-500 text-sm">
                            已经到底了 ~
                        </div>
                    )}
                </div>
            </div>

            {/* CSS 动画 */}
            <style>{`
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}