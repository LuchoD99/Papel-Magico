import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const loginUser = async (email, password) => {
    // Buscar al usuario por su email
    const user = await User.findOne({
        email: email.toLowerCase(),
    }).select('+password');

    // Comprobar que exista
    if (!user) {
        const error = new Error('Credenciales incorrectas');
        error.statusCode = 401;
        throw error;
    }

    // Comprobar que esté activo
    if (!user.isActive) {
        const error = new Error('Usuario desactivado');
        error.statusCode = 403;
        throw error;
    }

    // Comparar la contraseña
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
        const error = new Error('Credenciales incorrectas');
        error.statusCode = 401;
        throw error;
    }

    // Generar el token JWT
    const token = jwt.sign(
        {
            id: user._id,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '1h',
        },
    );

    // Devolver el token y los datos públicos
    return {
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    };
};
