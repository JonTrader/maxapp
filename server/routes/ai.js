import express from 'express';
import multer from 'multer';
import auth from '../middleware/auth.js';
import { analyze } from '../controllers/aiController.js';

const router = express.Router();

// Configure multer for in-memory PDF storage
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

router.use(auth);

router.post('/analyze', upload.single('resume'), analyze);

export default router;
