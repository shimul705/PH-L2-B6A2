export interface IUser {
    id?: number;
    name: string;
    email: string;
    password?: string;
    phone: string;
    role: 'admin' | 'customer';
}

export interface ISignupRequest {
    name: string;
    email: string;
    password: string;
    phone: string;
    role?: 'admin' | 'customer';
}

export interface ISigninRequest {
    email: string;
    password: string;
}

export interface IAuthResponse {
    token: string;
    user: IUser;
}