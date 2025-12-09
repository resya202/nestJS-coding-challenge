import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const ip =
      (req.headers['x-forwarded-for'] as string) ||
      req.ip ||
      req.connection.remoteAddress;

    res.on('finish', () => {
      const duration = Date.now() - start;
      const logLine = `[${new Date().toISOString()}] ${ip} ${
        req.method
      } ${req.originalUrl} ${res.statusCode} ${duration}ms\n`;

      const logPath = path.join(process.cwd(), 'requests.log');

      fs.appendFile(logPath, logLine, (err) => {
        if (err) console.error('Error writing log:', err);
      });
    });

    next();
  }
}
