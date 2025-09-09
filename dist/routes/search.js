"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const authMiddleware_1 = require("../utils/authMiddleware");
const traceMoe_1 = require("../utils/traceMoe");
const user_1 = require("../models/user");
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ dest: 'uploads/' });
router.post('/', authMiddleware_1.verifyToken, upload.single('image'), async (req, res) => {
    const userId = req.user.id;
    const user = user_1.users.find(u => u.id === userId);
    if (!user)
        return res.status(404).json({ error: 'User not found' });
    if (user.quota <= 0)
        return res.status(403).json({ error: 'Quota exceeded' });
    // ✅ Fix: safely handle req.file
    if (!req.file?.path) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    try {
        const result = await (0, traceMoe_1.searchTraceMoe)(req.file.path);
        user.quota -= 1;
        // delete temp file safely
        fs_1.default.unlinkSync(req.file.path);
        res.json({ results: result.result, quota: user.quota });
    }
    catch (err) {
        res.status(500).json({ error: 'Trace.moe search failed', details: err });
    }
});
exports.default = router;
//# sourceMappingURL=search.js.map