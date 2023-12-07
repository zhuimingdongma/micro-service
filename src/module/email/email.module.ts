import { Module } from '@nestjs/common';
import { EmailController } from './email.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [MailerModule, ConfigModule, RedisModule],
  controllers: [EmailController],
})
export class EmailModule {}
