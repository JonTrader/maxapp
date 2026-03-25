import express from 'express';
import multer from 'multer';
import auth from '../middleware/auth.js';
import { limiter } from '../lib/rateLimit.js';
import {
  getAll,
  getApplication,
  create,
  update,
  remove
} from '../controllers/applicationController.js';

const router = express.Router();

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

router.use(auth, limiter);

router.get('/', getAll);
router.get('/:id', getApplication);
router.post('/', upload.single('resume'), create);
router.put('/:id', update);
router.delete('/:id', remove);

export default router;