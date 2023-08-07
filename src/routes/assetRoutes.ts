import { Router } from "express";
import { uploadImage, resizeAndRotateImage, uploadVideo, addWatermarkToVideo, extractAudioFromVideo } from "../controllers/AssetController";
import multer from 'multer';

const router = Router();

// Function to filter uploaded files to allow only PNG and JPEG images  
const upload = multer({
    storage: multer.diskStorage({
        destination: "uploads/",
    }),
    
    fileFilter: (req, file, cb) => {
      if (
        file.mimetype === "image/png" || file.mimetype === "image/jpeg"
      ) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    },
});
router.post('/upload', upload.single('file'), uploadImage);

router.get('/resize-and-rotate/:id', resizeAndRotateImage);

const uploadMp4 = multer({
  storage: multer.diskStorage({
      destination: "uploads/videos/",
  }),
  
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "video/mp4"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});
router.post('/uploadVideo', uploadMp4.single('video'), uploadVideo);

router.post('/addWatermarkToVideo/:assetId', addWatermarkToVideo);
router.post('/extractAudioFromVideo/:assetId', extractAudioFromVideo);


export const assetRoutes = router;
