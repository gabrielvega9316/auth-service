import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'usuario@example.com',
    description: 'Correo electronico del usuario',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'secret123',
    minLength: 6,
    description: 'Contrasena del usuario',
  })
  @IsString()
  @MinLength(6)
  password: string;
}
