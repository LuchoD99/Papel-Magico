import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI no está definida en el archivo .env');
        }
        await mongoose.connect(process.env.MONGODB_URI);

        console.log('MongoDB conectado correctamente');
    } catch (error) {
        console.error('Error al conectar MongoDB:', error.message);
        process.exit(1);
    }
};

export default connectDB;
