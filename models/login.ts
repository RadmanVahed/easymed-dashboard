export interface LoginDto {
    username:string,
    password:string
}

export interface LoginRes {
    success:boolean,
    message:string,
    token?: string;
}