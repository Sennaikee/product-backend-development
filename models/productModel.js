const mongoose = require('mongoose');
const ProductSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter product name"],
    },

    price: {
      type: Number,
      required: [true, "Please enter price"],
      default: 0,
    },

    description: {
      type: String,
    },

    category: {
      type: String,
      required: [true, "Please enter category name"],
    },
    
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Product must have a creator"],
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;