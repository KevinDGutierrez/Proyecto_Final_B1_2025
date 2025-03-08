import { response, request } from "express";
import { hash, verify } from "argon2";
import { generarJWT } from "../helpers/generate-jwt.js"
import User from "./user.model.js";

export const register = async (req, res) => {
    
    try {
        const data = req.body;

        const encryptedPassword = await hash (data.password);

        const user = await User.create({
            name: data.name,
            surname: data.surname,
            username: data.username.toLowerCase(),
            email: data.email.toLowerCase(),
            phone: data.phone,
            password: encryptedPassword,
            role: data.role,
        });

        return res.status(201).json({
            message: "user registered successfully",
            userDetails: {
                user: user.email
            }
        });

    } catch (error) {
        
        console.log(error);

        return res.status(500).json({
            msg: "user registration failed",
            error
        });
    }

};

export const login = async (req , res) => {
    try {

        const { email, password, username } = req.body;
        
        const lowerEmail = email ? email.toLowerCase() : null;
        const lowerUsername = username ? username.toLowerCase() : null;
        
        const user = await User.findOne({
            $or: [{ email: lowerEmail }, { username: lowerUsername }] 
        });
        
        if (!user) {
            return res.status(404).json({ msg: 'user not found' });
        }
        if (user.status  === false){
            return res.status(404).json({
                msg: 'user is disabled'
            })
        }

        const validPassword = await verify(user.password, password);
        if (!validPassword) {
            return res.status(400).json({
                msg: 'The password is incorrect'
            });
        }

        const token = await generarJWT(user.id);

        return res.status(200).json({
            msg: 'Login successful',
            userDetails: {
                username: user.username,
                token: token            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Error getting user',
            error
        })
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id, password, role, email, actualpassword, ...data } = req.body;
        let { username } = req.body;

        if (username) {
            username = username.toLowerCase();
            data.username = username;
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                msg: 'user not found'
            })
        }

        if(req.user.id !== id && req.user.role !== "ADMIN"){
            return res.status(400).json({
                success: false,
                msg: 'You are not the owner of this profile, you cannot update this user'
            })
        }

        if (user.status === false) {
            return res.status(400).json({
                success: false,
                msg: 'This user has been deleted'
            });
        }

        if(password){
            if(!actualpassword){
                return res.status(400).json({
                    success: false,
                    msg: 'You must provide your current password'
                })
            }

            const verifypassword = await verify(user.password, actualpassword);

            if(!verifypassword){
                return res.status(400).json({
                    success: false,
                    msg: 'Password is incorrect'
                })
            }
            data.password = await hash(password);
        }

        const UserUpdate = await User.findByIdAndUpdate(id, data, { new: true });

        res.status(200).json({
            success: true,
            msg: 'user Updated',
            UserUpdate
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Error updating user',
            error
        })
    }
}

export const getUsers = async (req, res) => {
    try {
        const { limite = 10, desde = 0 } = req.body;
        const query = { status: true };

        const [ total, users ] = await Promise.all([
            User.countDocuments(query),
            User.find(query)
            .skip(Number(desde))
           .limit(Number(limite))
        ])

        res.status(200).json({
            success: true,
            total,
            users
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Error getting users',
            error
        })
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);

        if (!user) {
            return res.status(400).json({
                success: false,
                msg: 'User not found'
            });
        }

        if (user.status === false) {
            return res.status(400).json({
                success: false,
                msg: 'Error user disabled'
            });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Error getting user by id',
            error
        })
    }
};

export const createAdmin = async () => {
    try {
        
        const user = await User.findOne({username: "Admin".toLowerCase()})
        
        if(!user){
            const password = await hash("12345678");
            const newUser = new User({
                name: "Kevin",
                surname: "Gutierrez",
                username: "Admin".toLowerCase(),
                email: "kevin161@gmail.com",
                phone: "32111213",
                password: password,
                role: "ADMIN"
            });
            await newUser.save();
            console.log("Admin created successfully");
        }else{
            console.log("Admin already exists");
        }

    } catch (error) {
        console.error("Failed to create Admin: ", error)
    }
};


export const deleteUser = async (req, res = response) => {
    try {
        const { id } = req.params;
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                msg: "Username and password are required"
            });
        }

        const lowerUsername = username.toLowerCase();

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "User not found"
            });
        }

        if (user.username.toLowerCase() !== lowerUsername) {
            return res.status(403).json({
                success: false,
                msg: "Invalid username"
            });
        }

        const isMatch = await verify(user.password, password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                msg: "Invalid credentials"
            });
        }

        if(req.user.id !== id && req.user.role !== "ADMIN"){
            return res.status(400).json({
                success: false,
                msg: 'You are not the owner of this profile, you cannot update this user'
            })
        }

        const updatedUser = await User.findByIdAndUpdate(id, { status: false }, { new: true });

        return res.status(200).json({
            success: true,
            msg: "User deactivated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            msg: "Error deleting user",
            error
        });
    }
};
