import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
    try {
        // Comprobar que exista el secreto JWT
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET no está configurada');

            return res.status(500).json({
                message: 'Error interno del servidor',
            });
        }

        const authHeader = req.headers.authorization;

        // Comprobar que exista el encabezado Bearer
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'No estás autenticado',
            });
        }

        // Extraer el token
        const token = authHeader.slice(7).trim();

        if (!token) {
            return res.status(401).json({
                message: 'No estás autenticado',
            });
        }

        // Verificar que el token sea válido
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Comprobar que el token contenga un ID válido
        if (!decoded.id || !mongoose.isValidObjectId(decoded.id)) {
            return res.status(401).json({
                message: 'Token inválido o expirado',
            });
        }

        // Buscar al usuario en MongoDB
        const user = await User.findById(decoded.id);

        // Comprobar que exista y esté activo
        if (!user || !user.isActive) {
            return res.status(401).json({
                message: 'Usuario inexistente o desactivado',
            });
        }

        // Guardar los datos actuales del usuario
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
