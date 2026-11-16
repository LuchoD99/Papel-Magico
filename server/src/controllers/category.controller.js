import Category from '../models/Category.js';

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

        const category = await Category.findByIdAndUpdate(
            id,
            {
                name,
                description,
                image,
            },
            {
                returnDocument: 'after',
                runValidators: true,
            },
        );

        if (!category) {
            return res.status(404).json({
                message: 'Categoría no encontrada',
            });
        }

        return res.status(200).json({
            message: 'Categoría actualizada correctamente',
            category,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: 'Ya existe una categoría con ese nombre',
            });
        }

        return res.status(500).json({
            message: 'Error al actualizar la categoría',
        });
    }
};

// Desactivar una categoría
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findByIdAndUpdate(
            id,
            { isActive: false },
            { returnDocument: 'after' },
        );

        if (!category) {
            return res.status(404).json({
                message: 'Categoría no encontrada',
            });
        }

        return res.status(200).json({
            message: 'Categoría desactivada correctamente',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error al desactivar la categoría',
        });
    }
};

export const activateCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findByIdAndUpdate(
            id,
            { isActive: true },
            { returnDocument: 'after' },
        );

        if (!category) {
            return res.status(404).json({
                message: 'Categoría no encontrada',
            });
        }

        return res.status(200).json({
            message: 'Categoría reactivada correctamente',
            category,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error al reactivar la categoría',
        });
    }
};
