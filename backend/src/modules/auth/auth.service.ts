import { AuthRepository } from './auth.repository.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ENV_VARS } from '../../utils/environment.js';

export class AuthService {
    private authRepository: AuthRepository;

    constructor() {
        this.authRepository = new AuthRepository();
    }

    private generateAccessToken(payload: { _id: string }) {
        return jwt.sign(payload, ENV_VARS.JWT_ACCESS_TOKEN_SECRET, {
            expiresIn: '30d',
        });
    }

    async register(firstName: string, lastName: string, password: string, email: string) {
        const hashedPassword = await bcrypt.hash(password, 10);

        const insertedUser = await this.authRepository.createUser({ firstName, lastName, password: hashedPassword, email });

        const token = this.generateAccessToken({ _id: insertedUser.insertedId.toString() });

        const user = {
            id: insertedUser.insertedId.toString(),
            email,
            firstName,
            lastName,
        };

        return { token, user };
    }

    async login(email: string, password: string) {
        const user = await this.authRepository.findUserByEmail(email);

        if (!user) {
            throw new Error('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        const token = this.generateAccessToken({ _id: user._id.toString() });

        return {
            token,
            user: {
                id: user._id.toString(),
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
        };
    }
}
