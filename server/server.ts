import "./configs/instrument.mjs"

import express, { Request, Response, NextFunction } from "express";
import cors from 'cors'
import 'dotenv/config'

import { clerkMiddleware } from '@clerk/express'
import clerkWebhooks from "./controllers/clerk.js";

import * as Sentry from "@sentry/node"
import userRouter from "./routes/userRoutes.js";
import projectRouter from "./routes/projectRoutes.js";
import paymentsWebhook from "./controllers/paymentsController.js";
 
import { rateLimiter } from "./middlewares/rateLimit.js";
 
const app = express();
const PORT = process.env.PORT || 5000;

// CORS Secure setup
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [];
const defaultOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const origins = [...new Set([...allowedOrigins, ...defaultOrigins])];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (origins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Apply global rate limiter
app.use(rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Too many requests, please try again later.'
}));

app.post('/api/clerk', express.raw({ type: 'application/json' }), clerkWebhooks)
app.post('/api/payments', express.json(), paymentsWebhook)

app.use(express.json())
app.use(clerkMiddleware())

app.get("/", (req: Request, res: Response) => {
  res.send("Server is Live!");
});

app.use('/api/user', userRouter)
app.use('/api/project', projectRouter)


// The error handler must be registered before any other error middleware and after all controllers 
Sentry.setupExpressErrorHandler(app);

// Custom error handler to return JSON format errors for Multer, CORS, etc.
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Express Error Handler:', err);
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'CORS error: Origin not allowed by security policies.' });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File is too large. Maximum size allowed is 5MB.' });
  }
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected server error occurred.'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});