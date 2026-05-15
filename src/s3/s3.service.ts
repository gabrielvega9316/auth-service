import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
} from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private s3Client: S3Client;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('S3_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('S3_ACCESS_KEY_ID')!,
        secretAccessKey: this.configService.get<string>('S3_SECRET_ACCESS_KEY')!,
      },
    });
  }

  async testConnection() {
    const command = new ListObjectsV2Command({
        Bucket: this.configService.get<string>('S3_BUCKET_NAME'),
    });

    const response = await this.s3Client.send(command);

    console.log('S3 CONNECTED SUCCESSFULLY');
    console.log(response);

    return response;
 }

    async uploadFile(params: {
        key: string;
        body: Buffer;
        contentType: string;
        }) {
        const command = new PutObjectCommand({
            Bucket: this.configService.get<string>('S3_BUCKET_NAME'),
            Key: params.key,
            Body: params.body,
            ContentType: params.contentType,
        });

        await this.s3Client.send(command);

        return {
            key: params.key,
            bucket: this.configService.get<string>('S3_BUCKET_NAME'),
        };
    }

}