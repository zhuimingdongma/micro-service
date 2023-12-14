import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

export class RabbitMQConsumer {
  private channel: amqp.Channel;
  private configService: ConfigService = new ConfigService();

  constructor(private readonly queueName: string) {}

  async connect() {
    const connection = await amqp.connect(this.configService.get('RABBITMQ_HOST')); // Replace with your RabbitMQ connection URL
    this.channel = await connection.createChannel('logs');
    await this.channel.assertQueue(this.queueName, { durable: true });
  }

  async startConsuming(callback: (message: string) => void) {
    await this.channel.consume(this.queueName, (msg) => {
      if (msg !== null) {
        const message = msg.content.toString();
        callback(message);
        this.channel.ack(msg);
      }
    });
  }
}
