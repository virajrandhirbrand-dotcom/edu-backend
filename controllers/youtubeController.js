const { google } = require('googleapis');

// Helper function to get YouTube API instance
const getYouTubeInstance = () => {
    if (!process.env.YOUTUBE_API_KEY) {
        throw new Error('YouTube API key is not configured');
    }
    return google.youtube({
        version: 'v3',
        auth: process.env.YOUTUBE_API_KEY
    });
};

// Search for educational videos based on course/topic
exports.searchEducationalVideos = async (req, res) => {
    try {
        const { query, maxResults = 5 } = req.body;

        console.log('YouTube search request:', { query, maxResults });

        if (!query || query.trim().length === 0) {
            return res.status(400).json({
                error: 'Please provide a search query for video recommendations.'
            });
        }

        // Check if YouTube API key is configured
        if (!process.env.YOUTUBE_API_KEY) {
            console.log('YouTube API key not found in environment variables');
            return res.status(500).json({
                error: 'YouTube API key is not configured. Please set YOUTUBE_API_KEY environment variable.'
            });
        }

        console.log('YouTube API key found, proceeding with search...');

        console.log(`Searching YouTube for: "${query}"`);

        // Get YouTube API instance
        const youtube = getYouTubeInstance();

        // Search for videos with educational focus
        const searchResponse = await youtube.search.list({
            part: 'snippet',
            q: `${query} tutorial course education`,
            type: 'video',
            maxResults: maxResults,
            order: 'relevance',
            videoDuration: 'medium', // 4-20 minutes videos
            videoDefinition: 'high',
            videoEmbeddable: true,
            safeSearch: 'moderate'
        });

        const videos = searchResponse.data.items.map(item => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`
        }));

        res.json({
            query: query,
            videos: videos,
            totalResults: videos.length
        });

    } catch (error) {
        console.error('YouTube API Error:', error);
        
        // Check if it's a quota exceeded error
        if (error.code === 403 && error.message.includes('quota')) {
            console.log('YouTube API quota exceeded, returning fallback data');
            return res.json({
                query: query,
                videos: [
                    {
                        videoId: 'fallback-1',
                        title: 'Educational Video - Search Temporarily Unavailable',
                        description: 'YouTube API quota exceeded. Please try again later or contact support.',
                        thumbnail: 'https://via.placeholder.com/320x180/cccccc/666666?text=Video+Unavailable',
                        channelTitle: 'System',
                        publishedAt: new Date().toISOString(),
                        url: '#',
                        embedUrl: '#'
                    }
                ],
                totalResults: 1,
                quotaExceeded: true,
                message: 'YouTube API quota exceeded. Videos will be available again tomorrow.'
            });
        }
        
        res.status(500).json({
            error: 'Failed to fetch YouTube videos. Please try again later.',
            details: error.message
        });
    }
};

// Get course-specific video recommendations
exports.getCourseVideos = async (req, res) => {
    try {
        const { courseName, subject } = req.body;

        if (!courseName) {
            return res.status(400).json({
                error: 'Course name is required for video recommendations.'
            });
        }

        // Check if YouTube API key is configured
        if (!process.env.YOUTUBE_API_KEY) {
            console.log('YouTube API key not found for course videos');
            return res.status(500).json({
                error: 'YouTube API key is not configured.'
            });
        }

        // Create educational search query
        const searchQuery = subject 
            ? `${courseName} ${subject} tutorial course`
            : `${courseName} tutorial course education`;

        console.log(`Getting course videos for: "${searchQuery}"`);

        // Get YouTube API instance
        const youtube = getYouTubeInstance();

        // Search for course-specific videos
        const searchResponse = await youtube.search.list({
            part: 'snippet',
            q: searchQuery,
            type: 'video',
            maxResults: 8,
            order: 'relevance',
            videoDuration: 'medium',
            videoDefinition: 'high',
            videoEmbeddable: true,
            safeSearch: 'moderate'
        });

        const videos = searchResponse.data.items.map(item => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
            course: courseName,
            subject: subject || 'General'
        }));

        res.json({
            course: courseName,
            subject: subject || 'General',
            videos: videos,
            totalResults: videos.length
        });

    } catch (error) {
        console.error('YouTube Course Videos Error:', error);
        
        // Check if it's a quota exceeded error
        if (error.code === 403 && error.message.includes('quota')) {
            console.log('YouTube API quota exceeded, returning fallback course data');
            return res.json({
                course: courseName,
                subject: subject || 'General',
                videos: [
                    {
                        videoId: 'course-fallback-1',
                        title: 'Course Videos - Temporarily Unavailable',
                        description: 'YouTube API quota exceeded. Course videos will be available again tomorrow.',
                        thumbnail: 'https://via.placeholder.com/320x180/cccccc/666666?text=Course+Videos+Unavailable',
                        channelTitle: 'System',
                        publishedAt: new Date().toISOString(),
                        url: '#',
                        embedUrl: '#'
                    }
                ],
                totalResults: 1,
                quotaExceeded: true,
                message: 'YouTube API quota exceeded. Course videos will be available again tomorrow.'
            });
        }
        
        res.status(500).json({
            error: 'Failed to fetch course videos. Please try again later.',
            details: error.message
        });
    }
};

// Get trending educational videos
exports.getTrendingEducationalVideos = async (req, res) => {
    try {
        const { category = 'education' } = req.body;

        console.log(`Getting trending educational videos`);

        // Check if YouTube API key is configured
        if (!process.env.YOUTUBE_API_KEY) {
            console.log('YouTube API key not found for trending videos');
            return res.status(500).json({
                error: 'YouTube API key is not configured.'
            });
        }

        // Get YouTube API instance
        const youtube = getYouTubeInstance();

        // Search for trending educational content
        const searchResponse = await youtube.search.list({
            part: 'snippet',
            q: 'programming tutorial computer science education',
            type: 'video',
            maxResults: 6,
            order: 'viewCount',
            publishedAfter: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
            videoDuration: 'medium',
            videoDefinition: 'high',
            videoEmbeddable: true,
            safeSearch: 'moderate'
        });

        const videos = searchResponse.data.items.map(item => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
            category: 'trending'
        }));

        res.json({
            category: 'trending',
            videos: videos,
            totalResults: videos.length
        });

    } catch (error) {
        console.error('YouTube Trending Videos Error:', error);
        
        // Check if it's a quota exceeded error
        if (error.code === 403 && error.message.includes('quota')) {
            console.log('YouTube API quota exceeded, returning fallback trending data');
            return res.json({
                category: 'trending',
                videos: [
                    {
                        videoId: 'trending-fallback-1',
                        title: 'Trending Educational Content - Temporarily Unavailable',
                        description: 'YouTube API quota exceeded. Trending videos will be available again tomorrow.',
                        thumbnail: 'https://via.placeholder.com/320x180/cccccc/666666?text=Trending+Unavailable',
                        channelTitle: 'System',
                        publishedAt: new Date().toISOString(),
                        url: '#',
                        embedUrl: '#',
                        category: 'trending'
                    }
                ],
                totalResults: 1,
                quotaExceeded: true,
                message: 'YouTube API quota exceeded. Trending videos will be available again tomorrow.'
            });
        }
        
        res.status(500).json({
            error: 'Failed to fetch trending videos. Please try again later.',
            details: error.message
        });
    }
};
