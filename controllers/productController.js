const axios = require("axios")
const Product = require("../models/productModel");
const User = require("../models/userModel")
const cache = require("../utils/cache")
const {createProductSchema, updateProductSchema} = require("../middleware/validator")


exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (error) {
    console.log("Error getting all products", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    res.status(200).json(product);
  } catch (error) {
    console.log("Error getting product: ", error);;
    res.status(500).json({ message: "Invalid id" });
  }
}; 

exports.createProduct = async (req, res) => {
  try {
    const { error, value } = createProductSchema.validate(req.body);
    if (error) {
      console.log(error)
      return res
        .status(400)
        .json({ success: false, message: error.message });
    }
    const product = await Product.create({
      ...value,
      createdBy: req.user.userId,
    });
    res.status(200).json(product);
  } catch (error) {
    console.log("Error creating product: ", error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = updateProductSchema.validate(req.body);
    if (error) {
      console.log(error);
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }
    // Find product first
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if the logged-in user is the creator
    if (product.createdBy.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized: Not your product" });
    }

    // Proceed to update
    await Product.findByIdAndUpdate(id, value);
    const updatedProduct = await Product.findById(id);
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.log("Error updating product: ", error);
    res.status(500).json({ message: error.message });
  }
}; 

exports.deleteProduct = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    console.log(user.role);
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    if (id) {
      if ((product.createdBy.toString() === req.user.userId) || (user.role === "superadmin")) {
      await Product.findByIdAndDelete(id);
      res.status(200).json({ message: "Product deleted successfully" });
    }
    return res
        .status(403)
        .json({ message: "Unauthorized: Not your product" });
    } else {
      const result = await User.deleteMany({}); // Deletes all users
      res.status(200).json({
        success: true,
        message: "All users deleted successfully",
        deletedCount: result.deletedCount,
      });
    }   
  } catch (error) {
    console.log("Error deleting product: ", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getProductPriceInCurrency = async (req, res) => {
  const { id, currency } = req.params;
  const targetCurrency = currency.toUpperCase();
  const baseCurrency = "EUR";

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const cacheKey = `rate-${baseCurrency}-${targetCurrency}`;
    let exchangeRate = cache.get(cacheKey);

    if (!exchangeRate) {
      console.log("Calling:", `${process.env.EXCHANGE_API_BASE}/latest`);
      console.log("With params:", {
        access_key: process.env.EXCHANGE_API_KEY,
        symbols: targetCurrency,
      });

      const response = await axios.get(
        `${process.env.EXCHANGE_API_BASE}/latest`,
        {
          params: {
            access_key: process.env.EXCHANGE_API_KEY,
            base: baseCurrency,
            symbols: targetCurrency,
          },
        }
      );

      exchangeRate = response.data.rates?.[targetCurrency];

      if (!exchangeRate) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid currency" });
      }

      cache.set(cacheKey, exchangeRate);
    }

    const convertedPrice = product.price * exchangeRate;

    return res.status(200).json({
      // success: true,
      // product: product.name,
      // basePrice: product.price,
      price: parseFloat(convertedPrice.toFixed(2)),
      currency: targetCurrency,
      exchangeRate,
    });
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .json({ success: false, message: "Currency conversion failed" });
  }
};

