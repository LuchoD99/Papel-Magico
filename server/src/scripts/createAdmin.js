import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';

const createAdmin = async () => {
    try {
        // Validar variables de entorno
        if (
            !process.env.ADMIN_NAME?.trim() ||
            !process.env.ADMIN_EMAIL?.trim() ||
            !process.env.ADMIN_PASSWORD
        ) {
            throw new Error(
                'Faltan variables de entorno para crear el administrador',
            );
        }

        // Normalizar datos
        const adminName = process.env.ADMIN_NAME.trim();
        const adminEmail = process.env.ADMIN_EMAIL.trim().toLowerCase();

        // Conectar con MongoDB
        await connectDB();

        // Comprobar si el administrador ya existe
        const existingUser = await User.findOne({
            email: adminEmail,
        });

        if (existingUser) {
            console.log('Este administrador ya existe.');
            return;
        }

        // Crear administrador
        const admin = await User.create({
            name: adminName,
            email: adminEmail,
            password: process.env.ADMIN_PASSWORD,
            role: 'admin',
        });

        console.log('Administrador creado correctamente:', admin.email);
    } catch (error) {
        console.error('Error al crear administrador:', error.message);
        process.exitCode = 1;
    } finally {
        // Cerrar conexión con MongoDB
        await mongoose.disconnect();
    }
};

createAdmin();
