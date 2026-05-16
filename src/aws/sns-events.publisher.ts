import { Injectable } from '@nestjs/common';
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';

@Injectable()
export class SnsEventsPublisher {
  private readonly snsClient = new SNSClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  async publishUserCreated(payload: {
    userId: number;
    email: string;
  }): Promise<void> {
    await this.snsClient.send(
      new PublishCommand({
        TopicArn: process.env.SNS_USER_EVENTS_TOPIC_ARN,
        Message: JSON.stringify({
          event: 'user.created',
          data: payload,
        }),
      }),
    );
  }
}