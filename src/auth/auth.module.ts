import { Module } from '@nestjs/common';
import { NatsModule } from 'src/transports/nats.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entity/user.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { envs } from 'src/config';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    NatsModule,
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema
      }
    ]),
    JwtModule.register({
      global: true,
      secret: envs.JWT_TOKEN,
      signOptions: { expiresIn: '1h' }
    })
  ]
})
export class AuthModule {}
