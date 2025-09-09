import { Request, Response, NextFunction } from 'express';
export declare const verifyToken: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const signToken: (id: string, username: string) => string;
//# sourceMappingURL=authMiddleware.d.ts.map