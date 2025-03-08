import User from '../users/user.model.js'
import Category from '../categories/category.model.js';
import Product from '../products/product.model.js'
import Bill from '../bills/bill.model.js'

export const existenteEmail = async (email = ' ') => {
    
    const existeEmail = await User.findOne({ email });

    if (existeEmail) {
        throw new Error(`El email ${ email } ya existe en la base de datos`);
    }
};

export const existeUserById = async (id = '') => {
    const existeUser = await User.findById(id);

    if (!existeUser) {
        throw new Error(`El ID ${ id } no es un usuario válido`);
    }
};

export const existeCategoryById = async (id = '') => {
    const existeCategory = await Category.findById(id);

    if (!existeCategory){
        throw new Error(`El ID ${ id } no es una categoría válida`);
    }
};

export const existeProductById = async (id = '') => {
    const existeProductById = await Product.findById(id);

    if (!existeProductById){
        throw new Error(`El ID ${ id } no es un product válido`);
    }
};

export const existeBillById = async (id = '') => {
    const existeBillById = await Bill.findById(id);

    if (!existeBillById){
        throw new Error(`El ID ${ id } no es una bill válida`);
    }
};