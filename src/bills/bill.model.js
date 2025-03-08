import { Schema, model } from "mongoose";

const BillSchema = Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
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
                type: Number,
                required: true
            }
        }
    ],
    total: { 
        type: Number,
        default: 0 
    },
    status: {
        type: Boolean,
        default: true
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    versionKey: false
})

export default model("Bill", BillSchema);
