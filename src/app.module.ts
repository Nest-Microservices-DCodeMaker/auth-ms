import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { envs } from './config';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forRoot(envs.DATABASE_URL)
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
