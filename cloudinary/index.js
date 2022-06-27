const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "CentroTech/users",
    allowedFormat: ["jpeg", "png", "jpg"],
  },
});

const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "CentroTech/lectures",
    // allowedFormat: ["mp4"],
    resource_type: "auto",
  },
});

const courseImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "CentroTech/courses",
    // allowedFormat: ["mp4"],
    allowedFormat: ["jpeg", "png", "jpg"],
  },
});

module.exports = {
  cloudinary,
  storage,
  videoStorage,
  courseImageStorage,
};
