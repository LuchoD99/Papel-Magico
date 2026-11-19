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

        if (
            typeof name !== 'string' ||
            !name.trim() ||
            typeof description !== 'string' ||
            !description.trim() ||
            !category
        ) {
            return res.status(400).json({
                message:
                    'Nombre, descripción y categoría son obligatorios y deben ser válidos',
            });
        }

        if (!Array.isArray(images)) {
            return res.status(400).json({
                message: 'Las imágenes deben enviarse en formato de lista',
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
            pricingType === 'quote' &&
            price !== undefined &&
            price !== null &&
            price !== ''
        ) {
            return res.status(400).json({
                message:
                    'Los productos a cotizar no deben tener un precio fijo',
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

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'El ID del producto no es válido',
            });
        }

        const { name, description, category, pricingType, price, images } =
            req.body;

        // Buscar el producto
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                message: 'Producto no encontrado',
            });
        }

        // Validar nombre
        if (name !== undefined) {
            if (typeof name !== 'string' || !name.trim()) {
                return res.status(400).json({
                    message:
                        'El nombre debe ser un texto y no puede estar vacío',
                });
            }

            product.name = name.trim();
        }

        // Validar descripción
        if (description !== undefined) {
            if (typeof description !== 'string' || !description.trim()) {
                return res.status(400).json({
                    message:
                        'La descripción debe ser un texto y no puede estar vacía',
                });
            }

            product.description = description.trim();
        }

        // Validar categoría
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

            product.category = category;
        }

        // Validar imágenes
        if (images !== undefined) {
            if (!Array.isArray(images)) {
                return res.status(400).json({
                    message: 'Las imágenes deben enviarse en formato de lista',
                });
            }

            product.images = images;
        }

        // Validar tipo de precio
        if (pricingType !== undefined) {
            if (!['fixed', 'quote'].includes(pricingType)) {
                return res.status(400).json({
                    message: 'El tipo de precio no es válido',
                });
            }

            product.pricingType = pricingType;
        }

        // Validar precio
        if (product.pricingType === 'quote') {
            if (price !== undefined && price !== null && price !== '') {
                return res.status(400).json({
                    message:
                        'Los productos a cotizar no deben tener un precio fijo',
                });
            }

            product.price = undefined;
        } else {
            if (price !== undefined) {
                if (
                    price === null ||
                    price === '' ||
                    !Number.isFinite(Number(price)) ||
                    Number(price) < 0
                ) {
                    return res.status(400).json({
                        message:
                            'El precio debe ser un número mayor o igual a cero',
                    });
                }

                product.price = Number(price);
            } else if (product.price === undefined || product.price === null) {
                return res.status(400).json({
                    message:
                        'Los productos con precio fijo deben tener un precio',
                });
            }
        }

        // Guardar cambios
        await product.save();

        return res.status(200).json({
            message: 'Producto actualizado correctamente',
            product,
        });
    } catch (error) {
        console.error('Error al actualizar producto:', error);

        return res.status(500).json({
            message: 'Error interno al actualizar el producto',
        });
    }
};

// Eliminar producto (baja lógica)
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'El ID del producto no es válido',
            });
        }

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                message: 'Producto no encontrado',
            });
        }

        if (!product.isActive) {
            return res.status(400).json({
                message: 'El producto ya está desactivado',
            });
        }

        product.isActive = false;

        await product.save();

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
        console.error('Error al desactivar producto:', error);

        return res.status(500).json({
            message: 'Error interno al desactivar el producto',
        });
    }
};

export const activateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Validar formato del ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'El ID del producto no es válido',
            });
        }

        // Buscar el producto
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                message: 'Producto no encontrado',
            });
        }

        // Comprobar si ya está activo
        if (product.isActive) {
            return res.status(400).json({
                message: 'El producto ya está activo',
            });
        }

        // Reactivar producto
        product.isActive = true;

        await product.save();

        return res.status(200).json({
            message: 'Producto reactivado correctamente',
            product,
        });
    } catch (error) {
        console.error('Error al reactivar producto:', error);

        return res.status(500).json({
            message: 'Error interno al reactivar el producto',
        });
    }
};
