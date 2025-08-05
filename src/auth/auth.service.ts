import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt'
import { LoginUserDto, RegisterUserDto } from './dto';
import { User } from './entity/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { envs } from 'src/config';

@Injectable()
export class AuthService {

    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<User>,
        private readonly jwtService: JwtService
    ) { }

    async signJwt( payload: JwtPayload ) {
        return this.jwtService.sign(payload);
    }

    async registerUser(registerUserDto: RegisterUserDto) {

        const { email, name, password } = registerUserDto;

        try {

            const user = await this.userModel.findOne({ name });

            if (user) {
                throw new RpcException({
                    status: 400,
                    message: 'User already exist'
                });
            }

            const newUser = await this.userModel.create({
                name,
                email,
                password: bcrypt.hashSync(password, 10)
            });

            const returnedUser = { id: newUser.id, email: newUser.email, name: newUser.name };

            return {
                user: returnedUser,
                token: await this.signJwt( returnedUser ),
            }

        } catch (ex) {
            this.handleDBException(ex);
        }

    }

    async loginUser(loginUserDto: LoginUserDto) {

        const { email, password } = loginUserDto;

        try {

            const user = await this.userModel.findOne({ email });

            if (!user) {
                throw new RpcException({
                    status: 400,
                    message: 'Invalid credentials'
                });
            }

            const isPasswordValid = bcrypt.compareSync(password, user.password);

            if (!isPasswordValid) {
                throw new RpcException({
                    status: 400,
                    message: 'User/Password not valid'
                })
            }

            const returnedUser = { id: user.id, email: user.email, name: user.name };

            return {
                user: returnedUser,
                token: await this.signJwt( returnedUser ),
            }

        } catch (ex) {
            this.handleDBException(ex);
        }

    }

    async verifyToken(token: string) {
        try {
            const { sub, iat, exp, ...user } = this.jwtService.verify(token, {
                secret:envs.JWT_TOKEN
            });

            return {
                user: user,
                token: await this.signJwt(user)
            }
            
        } catch (ex) {
            throw new RpcException({
                status: 401,
                message: 'Invalid Token'
            })
        }
    }

    private handleDBException(ex: any) {
        if (ex instanceof RpcException) throw ex;

        throw new RpcException({
            status: 500,
            message: ex?.message || 'Internal server error',
        });
    }

}