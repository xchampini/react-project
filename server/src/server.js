import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import riotRoutes from './routes/riot.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api', riotRoutes);

app.get('/health', (request, response) => {
    response.json({status: 'ok'})
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});