import { Router } from 'express';
import { login } from '../controllers/auth.controller.js';
import {
    authenticate,
    authorizeRoles,
} from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/login', login);

// Ruta protegida para administradores
router.get('/admin', authenticate, authorizeRoles('admin'), (req, res) => {
    res.status(200).json({
        message: 'Acceso autorizado al panel de administración',
        user: req.user,
    });
});

export default router;
