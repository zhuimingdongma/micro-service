import { MailerService } from '@nestjs-modules/mailer';
import { Controller } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { MailProperty } from 'src/common/global';
import Utils from 'src/common/tools';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';

@Controller('/email')
export class EmailController {
  private tools = new Utils();
  constructor(
    private emailService: MailerService,
    private RedisService: RedisService,
  ) {}

  @MessagePattern('email')
  async send(
    @Payload() mailProperty: MailProperty,
    @Ctx() context: RmqContext,
  ) {
    try {
      const { template, text, to, subject } = mailProperty || {};
      const channel = context.getChannelRef();
      const originalMessage = context.getMessage();
      channel.ack(originalMessage);

      const hbs = require('nodemailer-express-handlebars');
      const path = require('path');

      const nodemailer = require('nodemailer');

      const code = await this.tools.generateCode(to, 6);
      
      await this.RedisService.set(`${to}_captcha`, code, 600);
      await this.RedisService.expire(`${to}_captcha`, 600);
      console.log('code: ', code);
      const transport = nodemailer.createTransport({
        host: 'smtp.qq.com',
        port: 465,
        secure: true,
        auth: {
          user: '2953854684@qq.com',
          pass: 'jdwarnhqxgpjddjh',
        },
      });
      transport.use(
        'compile',
        hbs({
          viewEngine: {
            partialsDir: path.join(process.cwd(), 'src/common/template'),
            defaultLayout: false,
          },
          viewPath: path.join(process.cwd(), 'src/common/template'),
        }),
      );

      await transport.sendMail({
        from: '2953854684@qq.com',
        text,
        to,
        subject,
        template: 'register',
        context: {
          name: `${to}`,
          transaction: '冬马和纱',
          code: `${code}`,
        },
      });

      // const email = await this.emailService.sendMail({
      //   from: '2953854684@qq.com',
      //   text,
      //   to,
      //   subject,
      //   template,
      // });
      return '发送成功';
    } catch (err) {
      throw new Error(err);
    }
  }
}
