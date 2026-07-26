import multer from 'multer';
import { Request } from 'express';

const storage = multer.diskStorage({})

const fileFilter = (req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error('Only JPEG, PNG, and WebP images are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export default upload;