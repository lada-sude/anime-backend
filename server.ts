import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import searchRoutes from './routes/search';
import subscriptionRoutes from './routes/subscription';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/search', searchRoutes);
app.use('/subscription', subscriptionRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));


// const res = await fetch('http://localhost:3000/search', {
//   method: 'POST',
//   body: formData,
//   headers: { 'Authorization': `Bearer ${userToken}` },
// });
