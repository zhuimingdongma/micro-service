import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @MessagePattern('test')
  test(@Payload() sum: number[], @Ctx() context: RmqContext) {
    // console.log(context.getMessage());
    // console.log(context.getChannelRef());
    console.log(context.getPattern());
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);
    return sum.reduce((prev, next) => prev + next, 0);
  }
}
