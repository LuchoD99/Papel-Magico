import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

// Obtener productos activos
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true })
            .populate('category', 'name')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            products,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error al obtener los productos',
        });
    }
};

// Obtener todos los productos (panel de administración)

export const getAllProducts = async (req, res) => {
    try {
        const { search, category, status, page = 1, limit = 10 } = req.query;

        const filter = {};

        // Buscar por nombre
        if (search) {
            filter.name = {
                $regex: search,
                $options: 'i',
            };
        }

        // Filtrar por categoría
        if (category) {
            if (!mongoose.Types.ObjectId.isValid(category)) {
                return res.status(400).json({
                    message: 'El ID de la categoría no es válido',
                });
            }

            filter.category = category;
        }

        // Filtrar por estado
        if (status !== undefined) {
            if (!['active', 'inactive'].includes(status)) {
                return res.status(400).json({
                    message: 'El estado debe ser active o inactive',
                });
            }

            filter.isActive = status === 'active';
        }

        // Calcular paginación
        const pageNumber = Math.max(parseInt(page, 10) || 1, 1);

        const limitNumber = Math.min(
            Math.max(parseInt(limit, 10) || 10, 1),
            50,
        );

        const skip = (pageNumber - 1) * limitNumber;

        // Obtener productos

        const products = await Product.find(filter)
            .populate('category', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNumber);

        const totalProducts = await Product.countDocuments(filter);

        return res.status(200).json({
            products,
            pagination: {
                currentPage: pageNumber,
                totalPages: Math.ceil(totalProducts / limitNumber),
                totalProducts,
                limit: limitNumber,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error al obtener todos los productos',
        });
    }
};

// Crear producto
export const createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            category,
            pricingType = 'quote',
            price,
            images = [],
        } = req.body;

        if (!name?.trim() || !description?.trim() || !category) {
            return res.status(400).json({
                message: 'Nombre, descripción y categoría son obligatorios',
            });
        }

        if (!mongoose.Types.ObjectId.isValid(category)) {
            return res.status(400).json({
                message: 'El ID de la categoría no es válido',
            });
        }

        if (!['fixed', 'quote'].includes(pricingType)) {
            return res.status(400).json({
                message: 'El tipo de precio no es válido',
            });
        }

        if (
            pricingType === 'fixed' &&
            (price === undefined ||
                price === null ||
                price === '' ||
                !Number.isFinite(Number(price)) ||
                Number(price) < 0)
        ) {
            return res.status(400).json({
                message: 'El precio debe ser un número mayor o igual a cero',
            });
        }

        const existingCategory = await Category.findOne({
            _id: category,
            isActive: true,
        });

        if (!existingCategory) {
            return res.status(400).json({
                message: 'La categoría no existe o está desactivada',
            });
        }

        const product = await Product.create({
            name,
            description,
            category,
            pricingType,
            ...(pricingType === 'fixed' ? { price: Number(price) } : {}),
            images,
        });

        return res.status(201).json({
            message: 'Producto creado correctamente',
            product,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error al crear el producto',
        });
    }
};

// Editar producto
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const { name, description, category, pricingType, price, images } =
            req.body;

        if (category !== undefined) {
            if (!mongoose.Types.ObjectId.isValid(category)) {
                return res.status(400).json({
                    message: 'El ID de la categoría no es válido',
                });
            }

            const existingCategory = await Category.findOne({
                _id: category,
                isActive: true,
            });

            if (!existingCategory) {
                return res.status(400).json({
                    message: 'La categoría no existe o está desactivada',
                });
            }
        }

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                message: 'Producto no encontrado',
            });
        }

        if (name !== undefined) product.name = name;
        if (description !== undefined) product.description = description;
        if (category !== undefined) product.category = category;
        if (pricingType !== undefined) product.pricingType = pricingType;
        if (images !== undefined) product.images = images;

        if (product.pricingType === 'quote') {
            product.price = undefined;
        } else if (price !== undefined) {
            product.price = price;
        }

        await product.save();

        return res.status(200).json({
            message: 'Producto actualizado correctamente',
            product,
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Error al actualizar el producto',
            error: error.message,
        });
    }
};

// Eliminar producto (baja lógica)
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByIdAndUpdate(
            id,
            { isActive: false },
            { returnDocument: 'after' },
        );

        if (!product) {
            return res.status(404).json({
                message: 'Producto no encontrado',
            });
        }

        return res.status(200).json({
            message: 'Producto desactivado correctamente',
            product,
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Error al desactivar el producto',
        });
    }
};

export const activateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByIdAndUpdate(
            id,
            { isActive: true },
            { returnDocument: 'after' },
        );

        if (!product) {
            return res.status(404).json({
                message: 'Producto no encontrado',
            });
        }

        return res.status(200).json({
            message: 'Producto reactivado correctamente',
            product,
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Error al reactivar el producto',
        });
    }
};
