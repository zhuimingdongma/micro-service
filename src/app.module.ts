import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailModule } from './module/email/email.module';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './module/redis/redis.module';

export const envFilePath =
  process.env.NODE_ENV === 'development'
    ? '.env'
    : process.env.NODE_ENV == 'test'
      ? '.env.test'
      : '.env.product';
@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.qq.com',
        port: 465,
        secure: true,
        auth: {
          user: '2953854684@qq.com',
          pass: 'jdwarnhqxgpjddjh',
        },
      },
    }),
    EmailModule,
    ConfigModule.forRoot({ envFilePath, isGlobal: true }),
    RedisModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
