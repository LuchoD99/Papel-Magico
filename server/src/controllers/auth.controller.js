import { loginUser } from '../services/auth.service.js';

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'El email y la contraseña son obligatorios',
            });
        }

        const result = await loginUser(email, password);

        return res.status(200).json({
            message: 'Inicio de sesión exitoso',
            ...result,
        });
    } catch (error) {
        return res.status(401).json({
            message: error.message,
        });
    }
};
