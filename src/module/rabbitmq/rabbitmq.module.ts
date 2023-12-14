import { Module } from '@nestjs/common';
import { LoggerService } from './rabbitmq.service';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { LogLevel } from '@/common/enum';

const { format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const Format = printf(({ level, message, label, timestamp }) => {
  let log = `${timestamp} ${level}: ${message}`;
  switch (level) {
    case LogLevel.WARN:
      log = `\u001b[33m${timestamp}  ${level}: ${message}\u001b[0m`;
      break;
    case LogLevel.ERROR:
      log = `\u001b[31m${timestamp} ${level}: ${message}\u001b[0m`;
      break;
    case LogLevel.INFO:
      log = `\u001b[32m${timestamp} ${level}: ${message}\u001b[0m`;
      break;
    case LogLevel.DEBUG:
      log = `\u001b[36m${timestamp} ${level}: ${message}\u001b[0m`;
      break;
  }
  return log;
});

@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console(),
        new winston.transports.DailyRotateFile({
          dirname: `logs`, // 日志保存的目录
          filename: '%DATE%.log', // 日志名称，占位符 %DATE% 取值为 datePattern 值。
          datePattern: 'YYYY-MM-DD', // 日志轮换的频率，此处表示每天。
          zippedArchive: true, // 是否通过压缩的方式归档被轮换的日志文件。
          maxSize: '20m', // 设置日志文件的最大大小，m 表示 mb 。
          maxFiles: '14d', // 保留日志文件的最大天数，此处表示自动删除超过 14 天的日志文件。
          // 记录时添加时间戳信息
          format: winston.format.combine(
            winston.format.timestamp({
              format: 'YYYY-MM-DD HH:mm:ss',
            }),
            winston.format.json(),
          ),
        }),
      ],
      format: combine(timestamp(), Format),
    }),
  ],
  providers: [LoggerService],
})
export class RabbitMQModule {}
