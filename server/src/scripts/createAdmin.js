import 'dotenv/config';
import connectDB from '../config/db.js';
import User from '../models/User.js';

const createAdmin = async () => {
    try {
        await connectDB();

        const existingUser = await User.findOne({
            email: process.env.ADMIN_EMAIL,
        });

        if (existingUser) {
            console.log('Este administrador ya existe.');
            return;
        }

        const admin = await User.create({
            name: process.env.ADMIN_NAME,
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
            role: 'admin',
        });

        console.log('Administrador creado correctamente:', admin.email);
    } catch (error) {
        console.error('Error al crear administrador:', error.message);
        process.exitCode = 1;
    } finally {
        const mongoose = await import('mongoose');
        await mongoose.default.disconnect();
    }
};

createAdmin();
