import Joi from "joi";

export const updateSettingsSchema = Joi.object({
  siteName: Joi.string().min(2).max(100).optional(),
  siteDescription: Joi.string().max(500).optional(),
  siteLogo: Joi.string().optional().allow(""),

  contactEmail: Joi.string().email().optional().allow(""),
  contactPhone: Joi.string()
    .pattern(/^[0-9]+$/)
    .min(10)
    .max(15)
    .optional()
    .allow(""),
  whatsappNumber: Joi.string()
    .pattern(/^[0-9]+$/)
    .min(10)
    .max(15)
    .optional()
    .allow(""),

  facebookUrl: Joi.string().uri().optional().allow(""),
  instagramUrl: Joi.string().uri().optional().allow(""),
  tiktokUrl: Joi.string().uri().optional().allow(""),

  address: Joi.string().max(200).optional().allow(""),

  shippingFee: Joi.number().min(0).max(1000).optional(),
  freeShippingMin: Joi.number().min(0).max(100000).optional(),

  returnPolicy: Joi.string().max(1000).optional().allow(""),
});
