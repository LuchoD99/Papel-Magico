import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const loginUser = async (email, password) => {
    // Buscar al usuario por su email
    const user = await User.findOne({
        email: email.toLowerCase(),
    }).select('+password');

    // Comprobar que exista
    if (!user) {
        throw new Error('Credenciales incorrectas');
    }

    // Comprobar que esté activo
    if (!user.isActive) {
        throw new Error('Usuario desactivado');
    }

    // Comparar la contraseña
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
        throw new Error('Credenciales incorrectas');
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
