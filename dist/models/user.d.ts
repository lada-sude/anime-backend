export interface User {
    id: string;
    username: string;
    passwordHash: string;
    plan: 'free' | 'paid';
    quota: number;
}
export declare const users: User[];
//# sourceMappingURL=user.d.ts.map