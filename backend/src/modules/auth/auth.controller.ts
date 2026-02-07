import { Request, Response } from 'express';
import { AuthService } from './auth.service.js';

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    async register(req: Request, res: Response) {
        try {
            console.log(req.body);
            const { firstName, lastName, email, password } = req.body;
            const { accessToken } = await this.authService.register(firstName, lastName, password, email);

            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
            });
            res.status(201).json({ accessToken });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const { accessToken } = await this.authService.login(email, password);

            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
            });

            res.status(200).json({ accessToken });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
