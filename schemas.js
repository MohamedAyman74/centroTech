const Joi = require("joi");

module.exports.courseSchema = Joi.object({
  course: Joi.object({
    name: Joi.string().required(),
    subject: Joi.string().required(),
    email: Joi.string().email().required(),
    price: Joi.number().required().min(0),
  }).required(),
});
