import type {CommonResponse} from "./auth.tsx";

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

export interface ArticleResponse extends CommonResponse {
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
    content: string;
    viewRange: number;
    sendUserName: string;
    sendUserId: number;
    createTime: string;
    photoUrl: string[];
    likeCount: number;
    heat: number;
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


export interface ArticleResponse {
    id:string;

    title:string;

    content:number;

    viewRange:number;

    sendUserName:string;

    sendUserId:number;

    createTime:string;

    photoUrl:string[];

    likeCount:number;

    heat:string;

    tag:string[];
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