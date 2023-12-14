import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailModule } from './module/email/email.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from './module/redis/redis.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { RabbitMQModule } from './module/rabbitmq/rabbitmq.module';

export const envFilePath =
  process.env.NODE_ENV === 'development'
    ? '.env'
    : process.env.NODE_ENV == 'test'
      ? '.env.test'
      : '.env.product';
@Module({
  imports: [
    RabbitMQModule,
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
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'mysql',
          host: configService.get('DATABASE_HOST'),
          port: configService.get('DATABASE_PORT'),
          username: configService.get('DATABASE_USER'),
          password: configService.get('DATABASE_PSD'),
          database: configService.get('DATABASE'),
          entities: [join(__dirname, 'module', '**', '*.entity{.ts,.js}')],
          synchronize: true,
        };
      },
    }),
    EmailModule,
    ConfigModule.forRoot({ envFilePath, isGlobal: true }),
    RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
