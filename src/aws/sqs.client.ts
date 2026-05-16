import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SQSClient } from '@aws-sdk/client-sqs';

@Injectable()
export class SqsClientService {
  readonly client: SQSClient;

  constructor(private readonly configService: ConfigService) {
    this.client = new SQSClient({
      region: this.configService.getOrThrow<string>('AWS_REGION'),
      credentials: {
        accessKeyId:
          this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });
  }
}
