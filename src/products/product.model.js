import { Schema, model } from "mongoose";

const productSchema = Schema({
      product:{
        type: String,
        required: true,
        unique: true
    },
    information:{
        type: String,
        required: true
    },
    price:{
        type: Number,
        required: true,
        min: 0
    },
    stock:{
        type: Number,
        required: true,
        min: 0
    },
    category:{
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },
    status:{
      type: Boolean,
      default: true
    }
}, {
  timestamps: true,
  versionKey: false
});


export default model("Product", productSchema);