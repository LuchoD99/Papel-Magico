import { loginUser } from '../services/auth.service.js';

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== 'string' ||
            typeof password !== 'string' ||
            !email.trim() ||
            !password.trim()
        ) {
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
        console.error('Error en el inicio de sesión:', error);

        return res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : 'Error interno del servidor',
        });
    }
};
