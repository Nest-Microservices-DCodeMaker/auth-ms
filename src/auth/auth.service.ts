import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RegisterUserDto } from './dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entity/user.entity';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {

    private readonly logger = new Logger('AuthService');

    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<User>
    ) { }

    async registerUser(registerUserDto: RegisterUserDto) {

        const { email, name, password } = registerUserDto;

        try {
            
            const user = await this.userModel.findOne({name});

            if ( user ) {
                throw new RpcException({
                    status: 400,
                    message: 'User already exist'
                });
            }

            const newUser = await this.userModel.create({
                name,
                email,
                password
            });

            return {
                user: newUser,
                token: 'ABC'
            }

        } catch (ex) {
            throw new RpcException({ex})
        }

    }

}