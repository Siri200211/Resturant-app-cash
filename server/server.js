import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import apiRoutes from './routes/api.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api', apiRoutes);

// Sample Test Endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

// Start Server
const PORT = process.env.PORT || 8070;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});