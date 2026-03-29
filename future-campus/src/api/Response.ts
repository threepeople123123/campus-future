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
    data:{
        publicKey: string;
    }
}