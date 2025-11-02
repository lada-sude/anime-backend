import mongoose, { Document } from "mongoose";
export interface IUser extends Document {
    id: string;
    username: string;
    password: string;
    plan: "free" | "premium";
    quota: number;
    lastReset: string;
    premiumExpires?: string;
    comparePassword(password: string): Promise<boolean>;
}
export declare const UserModel: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export declare function resetDailyQuota(): Promise<void>;
//# sourceMappingURL=user.d.ts.map