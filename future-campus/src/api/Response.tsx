// 通用响应接口
export interface CommonResponse {
    code: number;
    message: string;
}

export interface LoginResponse extends CommonResponse {
    data : {
        userId: number;
        email: string;
        userName: string;
        userHeadUrl: string;
        schoolName: string;
        schoolId: string;
        createTime: string;
        token: string;
    }
}

export interface RSAKeyResponse extends CommonResponse {
    data:string;
}

export interface ArticlePageResponse extends CommonResponse {
    data: {
        records: Article[];
        total: number;
        size: number;
        current: number;
        pages: number;
    }
}

export interface Article {
    id: string;
    title: string;
    content: string | number;
    viewRange: number;
    sendUserName: string;
    sendUserId: number;
    createTime: string;
    photoUrl: string[];
    likeCount: number;
    heat: number | string;
    tag: string[];
}

export interface School {
    schoolId: string;
    schoolName: string;
}

export interface SchoolListResponse extends CommonResponse {
    data: School[];
}

export interface ArticleRequest {
    viewRange: number;
    tag: string[];
    query: string;
    schoolName: string;
    schoolId: string;
    pageNum: number;
    pageSize: number;
}



export interface RegisterRequest {
    email: string;
    password: string;
    confirmPassword: string;
    userName: string;
    verificationCode?: string;
}

export interface ResetPasswordRequest {
    email: string;
    password: string;
    confirmPassword: string;
    verificationCode: string;
}

export interface PopularTag extends CommonResponse {
    id:number;
    tagName:string;
    hot:number;
}

export interface LoginRes extends CommonResponse{
    data:string;
}

export interface ArticlePublishResponse extends CommonResponse{
    data:string;
}

export interface AiChatRequest{
    msg:string;
    conversationId:string;
}

export interface AiChatSSEEvent {
    type: 'message' | 'done' | 'error';
    content?: string;
    conversationId?: string;
    error?: string;
}

export interface ArticleDetailResponse extends CommonResponse {
    data: ArticleDetail;
}

export interface ArticleDetail {
    id: string;
    title: string;
    content: string;
    viewRange: number;
    sendUserName: string;
    sendUserId: number;
    createTime: string;
    updateTime?: string;
    photoUrl: string[];
    likeCount: number;
    heat: number | string;
    tag: string[];
    schoolName?: string;
    schoolId?: string;
    isLiked?: boolean;
    commentCount?: number;
}