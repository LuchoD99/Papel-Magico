import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
        },

        pricingType: {
            type: String,
            enum: ['fixed', 'quote'],
            default: 'quote',
        },

        price: {
            type: Number,
            min: 0,
            required: function () {
                return this.pricingType === 'fixed';
            },
        },

        images: {
            type: [String],
            default: [],
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

const Product = mongoose.model('Product', productSchema);

export default Product;
