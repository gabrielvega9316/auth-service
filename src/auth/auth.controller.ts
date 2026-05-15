import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from '../s3/s3.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly s3Service: S3Service,
  ) {}

  @ApiOperation({
    summary: 'Registrar un usuario',
    description: 'Crea un nuevo usuario y devuelve los datos basicos del perfil.',
  })
  @ApiCreatedResponse({
    description: 'Usuario registrado correctamente.',
    schema: {
      example: {
        id: 1,
        email: 'usuario@example.com',
      },
    },
  })
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto.email, registerDto.password);
  }

  @ApiOperation({
    summary: 'Iniciar sesion',
    description:
      'Valida las credenciales del usuario y devuelve un access token JWT.',
  })
  @ApiOkResponse({
    description: 'Autenticacion exitosa.',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          email: 'usuario@example.com',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciales invalidas.',
    schema: {
      example: {
        message: 'Invalid credentials',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener perfil autenticado',
    description: 'Devuelve el perfil del usuario autenticado a partir del JWT.',
  })
  @ApiOkResponse({
    description: 'Perfil obtenido correctamente.',
    schema: {
      example: {
        id: 1,
        email: 'usuario@example.com',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Token ausente, invalido o expirado.',
    schema: {
      example: {
        message: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  profile(@Request() req: { user: { sub: number } }) {
    return this.authService.getProfile(req.user.sub);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Subir avatar del usuario autenticado',
    description:
      'Recibe un archivo multipart/form-data en el campo `file` y lo sube a S3.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo de imagen del avatar',
        },
      },
      example: {
        file: '(binary)',
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Avatar subido correctamente.',
    schema: {
      example: {
        key: 'avatars/users/1/1715692800000-avatar.png',
        bucket: 'auth-service-bucket',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Token ausente, invalido o expirado.',
    schema: {
      example: {
        message: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @Request() req: { user: { sub: number } },
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = req.user.sub;

    const key = `avatars/users/${userId}/${Date.now()}-${file.originalname}`;

    return this.s3Service.uploadFile({
      key,
      body: file.buffer,
      contentType: file.mimetype,
    });
  }
}
