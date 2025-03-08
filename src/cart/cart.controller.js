import Cart from "./cart.model.js";
import User from "../users/user.model.js";
import Product from "../products/product.model.js";

export const addCart = async (req, res) => {
  try {
    const { username, products } = req.body;
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (req.user.id !== user._id.toString()) {
      return res.status(400).json({
        success: false,
        msg: "You cannot add products to this cart because you are not the owner."
      });
    }

    let cart = await Cart.findOne({ user: user._id });

    if (!cart) {
      cart = new Cart({ user: user._id, products: [], totalCart: 0 });
    }

    let totalCart = 0;

    for (let i = 0; i < products.length; i++) {
      const { productName, amount } = products[i];
      
      const product = await Product.findOne({ product: { $regex: new RegExp('^' + productName + '$', 'i') } });
      
      if (!product) {
        return res.status(404).json({ msg: `Product '${productName}' not found` });
      }

      if (product.stock < amount) {
        return res.status(400).json({ msg: `Not enough stock for '${productName}'. Available: ${product.stock}` });
      }

      const productIndex = cart.products.findIndex(p => p.product.toString() === product._id.toString());

      if (productIndex > -1) {
        cart.products[productIndex].amount += amount;
        cart.products[productIndex].total = cart.products[productIndex].amount * product.price;
      } else {
        cart.products.push({ product: product._id, amount, total: amount * product.price });
      }

      product.stock -= amount;
      await product.save();
    }

    totalCart = cart.products.reduce((sum, product) => sum + product.total, 0);

    cart.totalCart = totalCart;

    await cart.save();

    res.json({
      msg: "Cart updated successfully",
      cart
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};
