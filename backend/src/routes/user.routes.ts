
import { Router } from 'express';
import { getMe, updateMe, getUserProfile } from '../controllers/user.controller';
// import { authMiddleware } from '../middleware/auth'; // A placeholder for auth middleware

const router = Router();

// @route   GET api/v1/users/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', /* authMiddleware, */ getMe);

// @route   PUT api/v1/users/me
// @desc    Update current user's profile
// @access  Private
router.put('/me', /* authMiddleware, */ updateMe);

// @route   GET api/v1/users/:username
// @desc    Get user profile by username
// @access  Public
router.get('/:username', getUserProfile);

export default router;
