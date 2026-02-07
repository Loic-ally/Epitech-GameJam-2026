import { AuthRepository } from './auth.repository.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ENV_VARS } from '../../utils/environment.js';

export class AuthService {
    private authRepository: AuthRepository;

    constructor() {
        this.authRepository = new AuthRepository();
    }

    private generateAccessToken(payload: { _id: string }) {
        return jwt.sign(payload, ENV_VARS.JWT_ACCESS_TOKEN_SECRET, {
            expiresIn: '1h',
        });
    }

    async register(firstName: string, lastName: string, password: string, email: string) {
        const hashedPassword = await bcrypt.hash(password, 10);

        const insertedUser = await this.authRepository.createUser({ firstName, lastName, password: hashedPassword, email });

        const accessToken = this.generateAccessToken({ _id: insertedUser.insertedId.toString() });

        return { accessToken };
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

        const accessToken = this.generateAccessToken({ _id: user._id.toString() });

        return { accessToken };
    }
}
