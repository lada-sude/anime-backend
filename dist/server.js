"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = __importDefault(require("./routes/auth"));
const search_1 = __importDefault(require("./routes/search"));
const subscription_1 = __importDefault(require("./routes/subscription"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/auth', auth_1.default);
app.use('/search', search_1.default);
app.use('/subscription', subscription_1.default);
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
// const res = await fetch('http://localhost:3000/search', {
//   method: 'POST',
//   body: formData,
//   headers: { 'Authorization': `Bearer ${userToken}` },
// });
//# sourceMappingURL=server.js.map