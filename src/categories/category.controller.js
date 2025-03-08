import { response, request } from "express";
import Category from './category.model.js'
import Product from '../products/product.model.js';


export const addCategory = async (req, res) => {
    try {
        
        const data = req.body;

        if(req.user.role !== 'ADMIN'){
            return res.status(403).json({
                msg: 'You do not have permissions to add categories'
            });
        }

        const category = await Category.create({
            name: data.name.toLowerCase(),
            information: data.information
        })

        return res.status(200).json({
            message: "categorie add",
            category
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error adding category'
        });
    }
};

export const updateCategory = async (req, res = response) => {
    try {
        const { id } = req.params;
        const { _id, ...data } = req.body;

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                msg: 'Category not found'
            });
        }

        if(req.user.role !== 'ADMIN'){
            return res.status(403).json({
                msg: 'You do not have permissions to update categories'
            });
        }

        if (category.estado === false) {
            return res.status(400).json({
                success: false,
                msg: 'This category has been deleted'
            });
        }

        const updatedCategory = await Category.findByIdAndUpdate(id, data, { new: true });

        return res.status(200).json({
            success: true,
            msg: 'Category updated successfully',
            category: updatedCategory
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            msg: 'Error updating category',
            error
        });
    }
};


export const deleteCategory = async (req, res = response) => {
    try {
        const { id } = req.params;

        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({
                msg: 'You do not have permissions to delete categories'
            });
        }

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                msg: "Category not found",
            });
        }

        if (category.name === 'General') {
            return res.status(400).json({
                msg: 'The general category cannot be eliminated'
            });
        }

        const generalCategory = await Category.findOne({ name: 'General' });
        if (!generalCategory) {
            return res.status(500).json({
                msg: 'General category not found. Please create a "General" category first.'
            });
        }

        await Product.updateMany({ category: id }, { category: generalCategory._id });

        await Category.findByIdAndUpdate(id, { status: false });

        return res.status(200).json({
            success: true,
            msg: "Category successfully disabled and products reassigned to 'General'",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            msg: "Error deactivating category",
            error,
        });
    }
};



export const createCategory = async () => {
    try {
        const category = await Category.findOne({ name: new RegExp("^General$", "i") });

        if (!category) {
            const newCategory = new Category({
                name: "General",
                information: "Categoría general"
            });
            await newCategory.save();
            console.log("General Category created successfully");
        } else {
            console.log("General Category already exists");
        }
    } catch (error) {
        console.error("Failed to create category", error);
    }
};

export const getCategories = async (req = request, res = response) => {
    try {

        const { limite = 10, desde = 0 } = req.body;
        const query = { status: true };

        if(req.user.role !== 'ADMIN'){
            return res.status(403).json({
                msg: 'You do not have permissions to get categories'
            });
        }

        const [ total, categories ] = await Promise.all([
            Category.countDocuments(query),
            Category.find(query)
               .skip(Number(desde))
               .limit(Number(limite))
        ]);

        res.status(200).json({
            success: true,
            total,
            categories
        });
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: "Error getting categories",
            error
        });
    }
}

export const getCategoryById = async (req, res) => {
    try {

        const { id } = req.params;

        if(req.user.role !== 'ADMIN'){
            return res.status(403).json({
                msg: 'You do not have permissions to search categories'
            });
        }

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                msg: "Category not found"
            });
        }

        if (category.status === false) {
            return res.status(400).json({
                success: false,
                msg: "Error category disabled"
            });
        }

        res.status(200).json({
            success: true,
            category
        });
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: "Error searching for category",
            error
        });
    }
};
