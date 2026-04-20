import http from 'http';
import dotenv from 'dotenv';
import logger from './utils/logger.js';
import connectDB from './config/db.js';
import { app } from './app.js';

dotenv.config();

let server;

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();
    logger.info('✅ MongoDB connected successfully');

    // 2. Create Express + Socket.io Server
    const httpServer = await http.createServer(app);


    server = httpServer.listen(process.env.PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${process.env.PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (error) {
    logger.error('❌ Failed to start server:', {
      message: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

startServer();