import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
} from '@aws-sdk/client-sqs';
import { SqsClientService } from './sqs.client';

@Injectable()
export class UserCreatedConsumer implements OnModuleInit {
  constructor(
    private readonly sqsClientService: SqsClientService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    this.pollMessages();
  }

  private async pollMessages() {
    while (true) {
      const response = await this.sqsClientService.client.send(
        new ReceiveMessageCommand({
          QueueUrl:
            this.configService.getOrThrow<string>('SQS_USER_CREATED_QUEUE_URL'),
          MaxNumberOfMessages: 1,
          WaitTimeSeconds: 10,
        }),
      );

      const messages = response.Messages ?? [];

      for (const message of messages) {
        console.log('Mensaje recibido desde SQS:', message.Body);

        if (message.ReceiptHandle) {
          await this.sqsClientService.client.send(
            new DeleteMessageCommand({
              QueueUrl:
                this.configService.getOrThrow<string>(
                  'SQS_USER_CREATED_QUEUE_URL',
                ),
              ReceiptHandle: message.ReceiptHandle,
            }),
          );
        }
      }
    }
  }
}
