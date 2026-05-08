// ============================================================================
// LOGGER UTILITY
// Structured logging for UrduMagic
// ============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  context?: Record<string, unknown>;
  error?: Error;
}

export class Logger {
  private static instance: Logger;
  private level: LogLevel = 'info';
  private logHistory: LogEntry[] = [];
  private maxHistorySize: number = 1000;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log('error', message, context, error);
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): void {
    if (this.shouldLog(level)) {
      const entry: LogEntry = {
        level,
        message,
        timestamp: Date.now(),
        context,
        error
      };

      this.logHistory.push(entry);
      if (this.logHistory.length > this.maxHistorySize) {
        this.logHistory.shift();
      }

      const formattedMessage = `[UrduMagic][${level.toUpperCase()}] ${message}`;
      
      switch (level) {
        case 'debug':
          console.debug(formattedMessage, context || '');
          break;
        case 'info':
          console.info(formattedMessage, context || '');
          break;
        case 'warn':
          console.warn(formattedMessage, context || '');
          break;
        case 'error':
          console.error(formattedMessage, error || '', context || '');
          break;
      }
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  getHistory(): LogEntry[] {
    return [...this.logHistory];
  }

  clearHistory(): void {
    this.logHistory = [];
  }
}

export const logger = Logger.getInstance();
export default logger;
