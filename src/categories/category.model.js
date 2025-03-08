import { Schema, model } from "mongoose";

const categorySchema = Schema({
      name:{
        type: String,
        required: true,
        unique: true
    },
    information:{
        type: String,
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


export default model("Category", categorySchema);