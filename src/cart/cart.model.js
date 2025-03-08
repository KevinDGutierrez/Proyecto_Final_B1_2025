import { Schema, model } from "mongoose";

const cartSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    products: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            amount: {
                type: Number,
                required: true,
                min: 1
            },
            total: {
                type: Number
            }
        }
    ],
    totalCart: {
        type: Number,
        default: 0 
    },
    status: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
});

export default model("Cart", cartSchema);
