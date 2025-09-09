import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const TRACE_API_KEYS = [
  'YOUR_FREE_KEY_1',
  'YOUR_FREE_KEY_2',
  // add paid keys later
];

let keyIndex = 0;

export const searchTraceMoe = async (filePath: string) => {
  const form = new FormData();
  form.append('image', fs.createReadStream(filePath));

  const key = TRACE_API_KEYS[keyIndex];
  keyIndex = (keyIndex + 1) % TRACE_API_KEYS.length;

  const res = await axios.post(`https://api.trace.moe/search?anilistInfo&cutBorders&key=${key}`, form, {
    headers: form.getHeaders(),
  });

  return res.data;
};
