
import { Router } from 'express';
import { getFeed, uploadVideo, addComment } from '../controllers/video.controller';
// import { authMiddleware } from '../middleware/auth';
// import { upload } from '../middleware/upload'; // Middleware for handling file uploads

const router = Router();

// @route   GET api/v1/videos/feed
// @desc    Get video feed
// @access  Private
router.get('/feed', /* authMiddleware, */ getFeed);

// @route   POST api/v1/videos/upload
// @desc    Upload a video
// @access  Private
router.post('/upload', /* authMiddleware, upload.single('video'), */ uploadVideo);

// @route   POST api/v1/videos/:videoId/comments
// @desc    Add a comment to a video
// @access  Private
router.post('/:videoId/comments', /* authMiddleware, */ addComment);


export default router;