import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { StringValue } from 'ms';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { S3Module } from 'src/s3/s3.module';
import { SnsEventsPublisher } from 'src/aws/sns-events.publisher';
import { SqsClientService } from 'src/aws/sqs.client';
import { UserCreatedConsumer } from 'src/aws/user-created.consumer';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    S3Module,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') ??
          configService.get<string>('JWT_ACCESS_SECRET') ??
          'dev_jwt_secret',
        signOptions: {
          expiresIn: (
            configService.get<string>('JWT_EXPIRES_IN') ??
            configService.get<string>('JWT_ACCESS_EXPIRES_IN') ??
            '15m'
          ) as StringValue,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    SnsEventsPublisher,
    SqsClientService,
    UserCreatedConsumer,
  ],
})
export class AuthModule {}
