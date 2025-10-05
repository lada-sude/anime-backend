"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const authMiddleware_1 = require("../utils/authMiddleware");
const user_1 = require("../models/user");
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ dest: 'uploads/' });
router.post('/', authMiddleware_1.verifyToken, upload.single('image'), async (req, res) => {
    const userId = req.user.id;
    const user = user_1.users.find(u => u.id === userId);
    if (!user)
        return res.status(404).json({ error: 'User not found' });
    // ✅ Reset quota daily (safe TypeScript version)
    const today = new Date().toISOString().split("T")[0];
    if (user.lastReset === undefined || user.lastReset.split("T")[0] !== today) {
        user.quota = 5; // reset to 5 per day
        user.lastReset = today; // 👈 force type to string
    }
    // ✅ Check quota before allowing search
    if (user.quota <= 0) {
        return res.status(403).json({ error: 'quota_exceeded', message: 'You have used all your free searches for today.' });
    }
    if (!req.file?.path) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    try {
        // prepare file upload
        const form = new form_data_1.default();
        form.append('image', fs_1.default.createReadStream(req.file.path));
        // ✅ Free public endpoint (no API key needed)
        const response = await axios_1.default.post('https://api.trace.moe/search?anilistInfo&cutBorders', form, { headers: form.getHeaders() });
        // reduce quota
        user.quota -= 1;
        // delete temp file safely
        fs_1.default.unlinkSync(req.file.path);
        res.json({
            results: response.data.result,
            quota: user.quota,
            resetDate: user.lastReset
        });
    }
    catch (err) {
        console.error('Trace.moe error:', err.response?.data || err.message);
        res.status(500).json({
            error: 'Trace.moe search failed',
            details: err.response?.data || err.message,
        });
    }
});
exports.default = router;
//# sourceMappingURL=search.js.map