import { Router } from 'express';

import {
    getProducts,
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    activateProduct,
} from '../controllers/product.controller.js';

import {
    authenticate,
    authorizeRoles,
} from '../middlewares/auth.middleware.js';

const router = Router();

// Obtener productos (público)
router.get('/', getProducts);

// Crear productos (solo administradores)
router.post('/', authenticate, authorizeRoles('admin'), createProduct);

// Editar producto (solo administradores)
router.put('/:id', authenticate, authorizeRoles('admin'), updateProduct);

// Eliminar producto (solo administradores)
router.delete('/:id', authenticate, authorizeRoles('admin'), deleteProduct);
// Reactivar producto (solo administradores)
router.patch(
    '/:id/activate',
    authenticate,
    authorizeRoles('admin'),
    activateProduct,
);
// Obtener todos los productos (panel de administración)
router.get('/admin', authenticate, authorizeRoles('admin'), getAllProducts);
export default router;
