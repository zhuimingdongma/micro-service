import { MailerService } from '@nestjs-modules/mailer';
import { Controller, HttpException, HttpStatus } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
  RpcException,
} from '@nestjs/microservices';
import {
  CheckProperty,
  MailProperty,
  RegisterProperty,
} from 'src/common/types/global';
import Utils from 'src/common/tools';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import { EmailTemplateEnum } from 'src/common/enum';

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
      console.log('mailProperty: ', mailProperty);
      const { template, text, to, subject } = mailProperty || {};
      const channel = context.getChannelRef();
      const originalMessage = context.getMessage();
      channel.ack(originalMessage);

      const hbs = require('nodemailer-express-handlebars');
      const path = require('path');

      const nodemailer = require('nodemailer');

      const renderTemplate =
        template === 'retrieve'
          ? 'retrieve'
          : template === 'register'
            ? 'register'
            : 'reset';
      const code = await this.tools.generateCode(to, 6, renderTemplate);

      await this.RedisService.set(`${to}_${renderTemplate}_captcha`, code, 600);
      await this.RedisService.expire(`${to}_${renderTemplate}_captcha`, 600);
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
        template: renderTemplate,
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
      throw new RpcException(err);
    }
  }

  @MessagePattern('check')
  async check(@Payload() data: CheckProperty, @Ctx() context: RmqContext) {
    try {
      // throw new RpcException('测试日志');
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);

      const { to, captcha, template } = data || {};
      const decryptCode = this.tools.decrypt(captcha);
      const originalCode = await this.RedisService.get(
        `${to}_${template}_code`,
        600,
      );
      const encryptCaptcha = await this.RedisService.get(
        `${to}_${template}_captcha`,
        600,
      );

      const ttl = await this.RedisService.TTL(`${to}_${template}_captcha`);

      if (captcha === encryptCaptcha && decryptCode === originalCode) {
        await this.RedisService.set(
          `${to}_${template}_check`,
          JSON.stringify(true),
        );
        await this.RedisService.expire(`${to}_${template}_check`, ttl);
        return true;
      } else {
        await this.RedisService.set(
          `${to}_${template}_check`,
          JSON.stringify(false),
        );
        await this.RedisService.expire(`${to}_${template}_check`, ttl);
      }
      return false;
    } catch (err) {
      throw new RpcException(err);
    }
  }

  @MessagePattern('register')
  async register(@Payload() data: RegisterProperty, @Ctx() ctx: RmqContext) {
    try {
      const channel = ctx.getChannelRef();
      const originalMsg = ctx.getMessage();
      channel.ack(originalMsg);

      const { to, password, template } = data;
      const check = await this.RedisService.get(`${to}_${template}_check`);
      if (new Utils().isNull(check))
        throw new RpcException('验证码不正确或已过期');
      return true;
    } catch (err) {
      throw new RpcException(err);
    }
  }

}
