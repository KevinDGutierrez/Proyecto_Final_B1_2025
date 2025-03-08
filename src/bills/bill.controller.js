import Cart from "../cart/cart.model.js";
import User from "../users/user.model.js";
import Bill from "./bill.model.js";
import Product from "../products/product.model.js";

export const createBill = async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const cart = await Cart.findOne({ user: user._id });

    if (!cart) {
      return res.status(404).json({ msg: "Cart not found" });
    }

    if (req.user.id !== user._id.toString()) {
      return res.status(400).json({
        success: false,
        msg: "You cannot create a bill for this cart because you are not the owner."
      });
    }

    let totalBill = 0;
    const billProducts = [];

    for (let i = 0; i < cart.products.length; i++) {
      const cartProduct = cart.products[i];
      const product = await Product.findById(cartProduct.product);

      if (!product) {
        return res.status(404).json({ msg: `Product not found: ${cartProduct.product}` });
      }

      const totalProduct = cartProduct.amount * product.price;
      billProducts.push({
        product: product._id,
        amount: cartProduct.amount,
        total: totalProduct
      });

      totalBill += totalProduct;
    }

    const bill = new Bill({
      user: user._id,
      products: billProducts,
      total: totalBill,
      date: new Date()
    });

    await bill.save();

    cart.products = [];
    await cart.save();

    res.json({
      msg: "Bill created successfully and cart emptied",
      bill
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error adding bill" });
  }
};


export const viewMyBill = async (req, res) => {
    const { username } = req.body;
  
    try {
      const user = await User.findOne({ username: username.toLowerCase() });
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      };

      if (req.user.id !== user._id.toString()) {
        return res.status(400).json({
          success: false,
          msg: "You cannot view the bills of this user because you are not the owner."
        });
      };
  
      const bills = await Bill.find({ user: user._id });
  
      if (bills.length === 0) {
        return res.status(404).json({ msg: "No bills found for this user" });
      }
  
      res.json({
        msg: "Bills retrieved successfully",
        bills
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Error viewing bill" });
    }
  };

  export const getBill = async (req, res) => {
    try {
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
          msg: 'You do not have permissions to search bills'
        });
      }
  
      const bills = await Bill.find({ status: true }).limit(10);
  
      if (bills.length === 0) {
        return res.status(404).json({ msg: "No bills found" });
      }
  
      res.json({
        msg: "Bills retrieved successfully",
        bills
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Error listing bills" });
    }
  };
  

  export const getBillById = async (req, res) => {
    try {
      const { id } = req.params;

      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
          msg: 'You do not have permissions to search bills by ID'
        });
      }
      
      const bill = await Bill.findById(id).populate('products.product');
      if (!bill) {
          return res.status(404).json({
              success: false,
              msg: "Bill not found"
          });
      }

      res.status(200).json({
          success: true,
          bill
      });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Error searching for bill" });
    }
  };
  


  export const updateBill = async (req, res) => {
    try {
      const { id } = req.params;
      const { products } = req.body;  
  
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
          msg: 'You do not have permissions to update bills'
        });
      }
  
      let bill = await Bill.findById(id);
      if (!bill) {
        return res.status(404).json({ msg: "Bill not found" });
      }
  
      for (const productData of products) {
        const { productName, amount } = productData;
  
        const product = await Product.findOne({ 
          product: { $regex: new RegExp('^' + productName + '$', 'i') } 
        });
  
        if (!product) {
          return res.status(404).json({ msg: `Product with name ${productName} not found` });
        }
  
        const productIndex = bill.products.findIndex(p => p.product.toString() === product._id.toString());
        if (productIndex > -1) {
          const oldAmount = bill.products[productIndex].amount;
  
          bill.products[productIndex].amount = amount;
  
          bill.products[productIndex].total = amount * product.price;
  
          const stockDifference = amount - oldAmount;
          product.stock -= stockDifference;
  
          if (product.stock < 0) {
            return res.status(400).json({ msg: `Not enough stock for ${productName}` });
          }
  
          await product.save();
        } else {
          return res.status(404).json({ msg: `Product not found in the bill` });
        }
      }
  
      let totalBill = 0;
      for (let p of bill.products) {
        totalBill += p.total;
      }
      bill.total = totalBill;
  
      await bill.save();
  
      return res.status(200).json({
        msg: "Bill updated successfully",
        bill
      });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Error updating Bill" });
    }
  };
  
  