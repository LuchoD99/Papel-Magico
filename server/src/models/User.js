import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        },

        password: {
            type: String,
            required: true,
            minlength: 8,
            validate: {
                validator: (value) => value.trim().length >= 8,
                message:
                    'La contraseña debe contener al menos 8 caracteres válidos',
            },
            select: false,
        },

        role: {
            type: String,
            enum: ['admin', 'editor'],
            default: 'admin',
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    },
);

// Encriptar la contraseña antes de guardar el usuario
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    this.password = await bcrypt.hash(this.password, 12);
});

// Comparar una contraseña ingresada con el hash guardado
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
