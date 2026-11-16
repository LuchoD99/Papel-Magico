import { Router } from 'express';

import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    activateCategory,
} from '../controllers/category.controller.js';

import {
    authenticate,
    authorizeRoles,
} from '../middlewares/auth.middleware.js';

const router = Router();

// Obtener categorías (público)
router.get('/', getCategories);

// Crear categoría (solo admin)
router.post('/', authenticate, authorizeRoles('admin'), createCategory);

// Editar categoría (solo admin)
router.put('/:id', authenticate, authorizeRoles('admin'), updateCategory);

// Desactivar categoría (solo admin)
router.delete('/:id', authenticate, authorizeRoles('admin'), deleteCategory);
router.patch(
    '/:id/activate',
    authenticate,
    authorizeRoles('admin'),
    activateCategory,
);
export default router;
