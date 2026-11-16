import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'No estás autenticado',
            });
        }

        const token = authHeader.split(' ')[1];

        // Verificamos que el token sea válido
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Buscamos al usuario en MongoDB
        const user = await User.findById(decoded.id);

        // Comprobamos que exista y esté activo
        if (!user || !user.isActive) {
            return res.status(401).json({
                message: 'Usuario inexistente o desactivado',
            });
        }

        // Guardamos los datos actuales del usuario
        req.user = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        };

        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Token inválido o expirado',
        });
    }
};

export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'No tenés permisos para realizar esta acción',
            });
        }

        next();
    };
};
