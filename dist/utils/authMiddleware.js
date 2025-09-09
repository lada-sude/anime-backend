"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signToken = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET = 'your-secret-key';
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token)
        return res.status(401).json({ error: 'No token' });
    try {
        const payload = jsonwebtoken_1.default.verify(token, SECRET);
        req.user = payload;
        next();
    }
    catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};
exports.verifyToken = verifyToken;
const signToken = (id, username) => {
    return jsonwebtoken_1.default.sign({ id, username }, SECRET, { expiresIn: '30d' });
};
exports.signToken = signToken;
//# sourceMappingURL=authMiddleware.js.map