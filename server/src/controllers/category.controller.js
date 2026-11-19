import Category from '../models/Category.js';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
// Obtener categorías
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true }).sort({
            name: 1,
        });

        return res.status(200).json({
            categories,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error al obtener las categorías',
        });
    }
};

// Crear categoría
export const createCategory = async (req, res) => {
    try {
        const { name, description, image } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: 'El nombre de la categoría es obligatorio',
            });
        }

        const category = await Category.create({
            name,
            description,
            image,
        });

        return res.status(201).json({
            message: 'Categoría creada correctamente',
            category,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: 'Ya existe una categoría con ese nombre',
            });
        }

        return res.status(500).json({
            message: 'Error al crear la categoría',
        });
    }
};

// Editar una categoría

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, image } = req.body;

        // Validar formato del ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'El ID de la categoría no es válido',
            });
        }

        // Comprobar que se envíe algún campo
        if (
            name === undefined &&
            description === undefined &&
            image === undefined
        ) {
            return res.status(400).json({
                message: 'Debés enviar al menos un campo para actualizar',
            });
        }

        // Validar nombre
        if (name !== undefined) {
            if (typeof name !== 'string' || !name.trim()) {
                return res.status(400).json({
                    message: 'El nombre no puede estar vacío',
                });
            }
        }

        // Validar descripción
        if (description !== undefined && typeof description !== 'string') {
            return res.status(400).json({
                message: 'La descripción debe ser un texto',
            });
        }

        // Validar imagen
        if (image !== undefined && typeof image !== 'string') {
            return res.status(400).json({
                message: 'La imagen debe ser un texto',
            });
        }

        // Buscar la categoría
        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                message: 'Categoría no encontrada',
            });
        }

        // Actualizar campos enviados
        if (name !== undefined) {
            category.name = name.trim();
        }

        if (description !== undefined) {
            category.description = description.trim();
        }

        if (image !== undefined) {
            category.image = image.trim();
        }

        await category.save();

        return res.status(200).json({
            message: 'Categoría actualizada correctamente',
            category,
        });
    } catch (error) {
        console.error('Error al actualizar categoría:', error);

        if (error.code === 11000) {
            return res.status(409).json({
                message: 'Ya existe una categoría con ese nombre',
            });
        }

        return res.status(500).json({
            message: 'Error interno al actualizar la categoría',
        });
    }
};

// Desactivar una categoría

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Validar formato del ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'El ID de la categoría no es válido',
            });
        }

        // Buscar la categoría
        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                message: 'Categoría no encontrada',
            });
        }

        // Comprobar si ya está desactivada
        if (!category.isActive) {
            return res.status(400).json({
                message: 'La categoría ya está desactivada',
            });
        }

        // Comprobar si tiene productos activos
        const activeProducts = await Product.exists({
            category: id,
            isActive: true,
        });

        if (activeProducts) {
            return res.status(400).json({
                message:
                    'No se puede desactivar la categoría porque tiene productos activos asociados',
            });
        }

        // Desactivar categoría
        category.isActive = false;

        await category.save();

        return res.status(200).json({
            message: 'Categoría desactivada correctamente',
            category,
        });
    } catch (error) {
        console.error('Error al desactivar categoría:', error);

        return res.status(500).json({
            message: 'Error interno al desactivar la categoría',
        });
    }
};

export const activateCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Validar formato del ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'El ID de la categoría no es válido',
            });
        }

        // Buscar la categoría
        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                message: 'Categoría no encontrada',
            });
        }

        // Comprobar si ya está activa
        if (category.isActive) {
            return res.status(400).json({
                message: 'La categoría ya está activa',
            });
        }

        // Reactivar categoría
        category.isActive = true;

        await category.save();

        return res.status(200).json({
            message: 'Categoría reactivada correctamente',
            category,
        });
    } catch (error) {
        console.error('Error al reactivar categoría:', error);

        return res.status(500).json({
            message: 'Error interno al reactivar la categoría',
        });
    }
};
