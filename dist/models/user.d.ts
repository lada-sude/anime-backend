export type User = {
    id: string;
    username: string;
    password: string;
    plan: "free" | "premium";
    quota: number;
    lastReset: string;
};
export declare let users: User[];
export declare function saveUsers(): void;
export declare function createUser(username: string, password: string): User;
export declare function resetDailyQuota(): void;
//# sourceMappingURL=user.d.ts.map