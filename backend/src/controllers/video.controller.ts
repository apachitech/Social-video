
import { Request, Response } from 'express';
import { mockVideos, mockUsers } from '../data';
import { Video, Comment } from '../types';

// Placeholder: Get video feed
// FIX: Use Request and Response types directly from express to resolve type conflicts.
export const getFeed = async (req: Request, res: Response) => {
    console.log('Fetching video feed');
    // We return the current state of our in-memory data store
    res.status(200).json({ videos: mockVideos });
};

// Functional mock: Upload a video
// FIX: Use Request and Response types directly from express to resolve type conflicts.
export const uploadVideo = async (req: Request, res: Response) => {
    const { description } = req.body;
    // const videoFile = req.file; // In a real app, from multer middleware
    // const userId = req.user.id; // From auth middleware
    const userId = 'u1'; // Mock user for demonstration

    if (!description) {
        return res.status(400).json({ msg: 'Description is required' });
    }

    const currentUser = mockUsers.find(u => u.id === userId);
    if (!currentUser) {
        return res.status(404).json({ msg: 'User not found' });
    }

    const newVideo: Video = {
        id: `v${Date.now()}`,
        // In a real app, this URL would come from a cloud storage service
        videoSources: [{ quality: 'Auto', url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4' }],
        thumbnailUrl: 'https://i.ytimg.com/vi/otNh9bTjX1k/maxresdefault.jpg',
        description,
        user: currentUser,
        likes: 0,
        comments: 0,
        shares: 0,
        views: 0,
        commentsData: [],
        status: 'approved',
        uploadDate: new Date().toISOString(),
    };

    mockVideos.unshift(newVideo); // Add to the start of the array to simulate a feed

    console.log('Video uploaded, new video count:', mockVideos.length);
    
    res.status(201).json(newVideo);
};

// Functional mock: Add a comment to a video
// FIX: Use Request and Response types directly from express to resolve type conflicts.
export const addComment = async (req: Request, res: Response) => {
    const { videoId } = req.params;
    const { text, userId } = req.body; // Use userId from request body

    // Validate that both text and userId were provided
    if (!text || !userId) {
        return res.status(400).json({ msg: 'Comment text and userId are required' });
    }

    const video = mockVideos.find(v => v.id === videoId);
    if (!video) {
        return res.status(404).json({ msg: 'Video not found' });
    }

    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
        return res.status(404).json({ msg: 'User not found' });
    }

    const newComment: Comment = {
        id: `c${Date.now()}`,
        user: user,
        text,
        timestamp: new Date().toISOString(),
    };

    video.commentsData.unshift(newComment);
    video.comments += 1;

    console.log(`Comment added to video ${videoId}. Total comments: ${video.comments}`);

    res.status(201).json(newComment);
};
