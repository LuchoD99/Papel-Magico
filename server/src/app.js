import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import apiRoutes from './routes/index.js';
const app = express();

app.use(helmet());
app.use(
    cors({
        origin: process.env.CLIENT_URL,
    }),
);

app.use(express.json());
app.use(morgan('dev'));

app.use('/api', apiRoutes);

// Manejo de rutas inexistentes
app.use((req, res) => {
    return res.status(404).json({
        message: 'Ruta no encontrada',
    });
});

// Manejo general de errores
app.use((err, req, res, next) => {
    console.error('Error del servidor:', err);

    return res.status(500).json({
        message: 'Error interno del servidor',
    });
});

export default app;
