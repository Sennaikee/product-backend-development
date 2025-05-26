const Joi = require("joi");
exports.signupSchema = Joi.object({
  username: Joi.string().min(3).max(30).required().messages({
    "string.empty": "Username is required",
    "string.min": "Username must be at least 3 characters",
  }),

  email: Joi.string()
    .min(6)
    .max(60)
    .required()
    .email()
    .messages({
      "string.email": "Please enter a valid email",
      "string.empty": "Email is required",
      "string.min": "Email must be at least 6 characters",
    }),

  password: Joi.string()
    .required()
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
      )
    )
    .messages({
      "string.empty": "Password is required",
      "string.pattern.base":
        "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (@$!%*?&)",
    }),
});


exports.signinSchema = Joi.object({
  email: Joi.string()
    .min(6)
    .max(60)
    .required()
    .email({ tlds: { allow: ["com", "net"] } })
    .messages({
      "string.email": "Please enter a valid email",
      "string.empty": "Email is required",
      "string.min": "Email must be at least 6 characters",
    }),

  password: Joi.string()
    .required()
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
      )
    )
    .messages({
      "string.empty": "Password is required",
    }),
});

exports.createProductSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    "string.base": "Name must be a string",
    "string.empty": "Product name is required",
    "string.min": "Product name must be at least 3 characters.",
    "string.max": "Product name cannot exceed 100 characters.",
  }),
  price: Joi.number().positive().required().messages({
    "number.base": "Price must be a number.",
    "number.positive": "Price must be a positive number.",
  }),
  description: Joi.string().allow("", null).messages({
    "string.base": "Description must be a string.",
  }),
  category: Joi.string().allow("", null).messages({
    "string.base": "Category must be a string",
  }),
});

exports.updateProductSchema = Joi.object({
  name: Joi.string().min(3).max(100).messages({
    "string.base": "Name must be a string.",
    "string.min": "Product name must be at least 3 characters.",
    "string.max": "Product name cannot exceed 100 characters.",
  }),
  price: Joi.number().positive().messages({
    "number.base": "Price must be a number.",
    "number.positive": "Price must be a positive number.",
  }),
  description: Joi.string().allow("", null).messages({
    "string.base": "Description must be a string.",
  }),
  category: Joi.string().allow("", null).messages({
    "string.base": "Category must be a string",
  }),
});

exports.updateProfileSchema = Joi.object({
  username: Joi.string().min(3).max(30).trim().messages({
    "string.base": "Username must be a string",
    "string.empty": "Username is required",
    "string.min": "Username must be at least 3 characters",
    "string.max": "Username must be at most 30 characters",
  }),

  email: Joi.string().email().trim().messages({
    "string.base": "Email must be a string",
    "string.empty": "Email is required",
    "string.email": "Email must be a valid email address",
  }),
});

exports.acceptCodeSchema = Joi.object({
  providedCode: Joi.number().required(),
});