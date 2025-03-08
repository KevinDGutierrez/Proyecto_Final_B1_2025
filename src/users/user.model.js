import { Schema, model } from "mongoose";

const UserSchema = Schema({
        name:{
            type: String,
            required: true
        },
        surname:{
            type: String,
            required: true
        },
        username:{
            type: String,
            unique: true
        },
        email:{
            type: String,
            required: [true, "email is required"],
            unique: true
        },
        password:{
            type: String,
            required: true,
            minlength: [8, "Password must be 8 characters long"]
        },
        phone:{
            type: String,
            minlength: [8, "The phone number must have 8 characters"],
            maxlength: [8, "The phone number must have 8 characters"],
            required: true
        },
        role:{
            type: String,
            enum: ["ADMIN", "CLIENT"],
            default: "CLIENT"
        },
        status:{
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        versionKey: false   
    }
);

UserSchema.methods.toJSON = function (){
    const {__v, password, _id,...user} = this.toObject();
    user.id = _id;
    return user;
}

export default model("User", UserSchema);