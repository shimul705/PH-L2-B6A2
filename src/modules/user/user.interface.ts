export interface IUserResponse {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: 'admin' | 'customer';
}

export interface IUpdateUserRequest {
    name?: string;
    email?: string;
    phone?: string;
    role?: 'admin' | 'customer';
}