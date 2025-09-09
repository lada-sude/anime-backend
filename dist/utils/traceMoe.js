"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchTraceMoe = void 0;
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const fs_1 = __importDefault(require("fs"));
const TRACE_API_KEYS = [
    'YOUR_FREE_KEY_1',
    'YOUR_FREE_KEY_2',
    // add paid keys later
];
let keyIndex = 0;
const searchTraceMoe = async (filePath) => {
    const form = new form_data_1.default();
    form.append('image', fs_1.default.createReadStream(filePath));
    const key = TRACE_API_KEYS[keyIndex];
    keyIndex = (keyIndex + 1) % TRACE_API_KEYS.length;
    const res = await axios_1.default.post(`https://api.trace.moe/search?anilistInfo&cutBorders&key=${key}`, form, {
        headers: form.getHeaders(),
    });
    return res.data;
};
exports.searchTraceMoe = searchTraceMoe;
//# sourceMappingURL=traceMoe.js.map