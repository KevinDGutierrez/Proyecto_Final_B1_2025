import { response, request } from "express";
import Product from "./product.model.js";
import Category from "../categories/category.model.js"

export const addProduct = async (req, res) =>{
    try {
        const data  = req.body;
        const category = await Category.findOne({ name: data.name.toLowerCase() });

        if(!category){
            return res.status(404).json({
                success: false,
                msg: 'Category not found'
            })
        }

        if(req.user.role !== 'ADMIN'){
            return res.status(403).json({
                msg: 'You do not have permissions to add product'
            });
        }
        
        const product = await Product.create({
            ...data,
            category: category._id,
            name: category.name
        });

        const detailsProduct = await Product.findById(product._id)
            .populate('category', 'name');

        const details = {
            detailsProduct: {
                detailsProduct
            }
        }

        return res.status(201).json({
            message: "product registered successfully",
            details
            
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: "error adding product",
            error
        })
    }
};



export const updateProduct = async (req, res) =>{
    try {
        const { id } = req.params;
        const { _id, ...data } = req.body;
        let { name } = req.body;

        if (name) {
            name = name.toLowerCase();
            data.name = name;
        }

        const product = await Product.findById(id);
        if (!product) {
            return res.status(400).json({
                success: false,
                msg: "product not found"
            });
        }

        const category = await Category.findOne({ name });
        if (!category) {
            return res.status(400).json({
                success: false,
                msg: "Category not found"
            });
        }

        data.category = category._id;

        
        if(req.user.role !== 'ADMIN'){
            return res.status(403).json({
                msg: 'You do not have permissions to updating products'
            });
        }

        if (product.status === false) {
            return res.status(400).json({
                success: false,
                msg: 'the product is disabled'
            });
        }

    
        const updateProduct = await Product.findByIdAndUpdate(id, data, { new: true });

        const detailsProduct = await Product.findById(updateProduct._id)
            .populate('category', 'name');

        const details = {
            detailsProduct: {
                detailsProduct
            }
        }

        return res.status(200).json({
            success: true,
            msg: "Product updated successfully",
            details
        }); 
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: "Error updating product",
            error
        })
    }
};

export const deleteProduct = async ( req, res = response ) =>{
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        
        if (!product) {
            return res.status(400).json({
                success: false,
                msg: "Product not found"
            });
        }

        if(req.user.role !== 'ADMIN'){
            return res.status(403).json({
                msg: 'You do not have permissions to delete product'
            });
        }

        const updateProduct = await Product.findByIdAndUpdate(id, { status: false }, { new: true });

        return res.status(200).json({
            success: true,
            msg: 'product disabled',
            product: updateProduct
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: "Error deleting product",
            error
        })
    }
};


export const listProducts = async (req, res) => {
    try {
        const { name, category, inStock, sortByStock } = req.query;

        const filters = { status: true };

        if (name) {
            filters.product = { $regex: name, $options: "i" };
        }

        if (category) {
            const categoryFound = await Category.findOne({
                name: { $regex: category, $options: "i" }
            });
            if (categoryFound) {
                filters.category = categoryFound._id; 
            } else {
                return res.status(404).json({ msg: 'Category not found' });
            }
        }

        if (inStock === 'false') {
            filters.stock = 0;
        }

        const sortOptions = sortByStock === 'true' ? { stock: 1 } : {};

        const products = await Product.find(filters)
            .populate('category', 'name')
            .limit(10)
            .sort(sortOptions);

        return res.status(200).json({
            message: "Products retrieved successfully",
            products
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: "Error retrieving products",
            error
        });
    }
};

export const searchProductById = async (req, res = response) => {
    try {
        const { id } = req.params;
        
        const product = await Product.findById(id);

        if (!product) {
            return res.status(400).json({
                success: false,
                msg: 'product not found'
            });
        }

        if (product.status === false) {
            return res.status(400).json({
                success: false,
                msg: 'Error product disabled'
            });
        }

        res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        console.log(error);
        return res.status(500)({
            msg: "Error searching for products",
            error
        })
    }
}
