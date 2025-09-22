import { Router } from 'express';
import { getLiveStreams, startLiveStream } from '../controllers/livestream.controller';

const router = Router();

// @route   GET api/v1/livestreams
// @desc    Get all active livestreams
// @access  Public
router.get('/', getLiveStreams);

// @route   POST api/v1/livestreams/start
// @desc    Start a new livestream
// @access  Private (auth middleware would be here)
router.post('/start', startLiveStream);

export default router;
