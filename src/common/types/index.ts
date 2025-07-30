import { Request } from "express";
export type AuthCookie = {
    accessToken: string;
};

export interface AuthRequest extends Request {
    auth: {
        id?: string;
        sub: string;
        role: string;
        tenant: string;
    };
}
