import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { RabbitMQConsumer } from './index';
import { LogLevel } from '@/common/enum/index';

type LogProps = {
  message: string;
  level: LogLevel;
  trace?: string;
  ip: string;
};

@Injectable()
export class LoggerService implements OnModuleInit {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private logger: Logger) {}

  async onModuleInit() {
    const consumer = new RabbitMQConsumer('logs');
    await consumer.connect();
    consumer.startConsuming((data: string) => {
      const {
        message = '',
        level,
        trace = '',
        ip,
      } = JSON.parse(data) as LogProps;
      switch (level) {
        case LogLevel.ERROR:
          this.logger.error(message, trace);
          break;
        case LogLevel.INFO:
          this.logger.info({ message, level });
          break;
        case LogLevel.WARN:
          this.logger.warn({ message, level });
          break;
        case LogLevel.DEBUG:
          this.logger.debug({ message, level });
          break;
        default:
          this.logger.info(message);
      }
    });
  }
}
