import { Request, Response } from 'express';
import { loginUser, registerUser } from '../services/auth.services';

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Missing fields' });
        }

        const user = await registerUser({ name, email, password });

        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

//* Login controller

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Missing fields' });
        }

        const data = await loginUser({ email, password });

        res.json(data);
    } catch (error: any) {
        res.status(401).json({ message: error.message });
    }
};
