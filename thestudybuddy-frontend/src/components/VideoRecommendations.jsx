import React, { useState, useEffect } from 'react';
import { youtubeApi } from '../services/api';
import { FaYoutube, FaPlay } from 'react-icons/fa';

const VideoRecommendations = ({ searchQuery, title = "Recommended Videos", maxResults = 6 }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (searchQuery) {
      fetchVideos();
    }
  }, [searchQuery]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await youtubeApi.getRecommendations(searchQuery, maxResults);
      setVideos(data.items || []);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
      setError(error.message || 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const openVideo = (videoId) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    const skeletonCount = maxResults <= 3 ? maxResults : 3;
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <FaYoutube className="text-red-500 text-2xl" />
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        <div className={`grid gap-4 ${maxResults <= 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-40 bg-white/10 rounded-t-lg"></div>
              <div className="bg-white/5 p-4 rounded-b-lg space-y-2">
                <div className="h-4 bg-white/10 rounded w-3/4"></div>
                <div className="h-3 bg-white/10 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
        <p className="text-red-300">
          {error === 'YouTube API not configured' 
            ? 'YouTube recommendations are not available yet. Please configure the API key.'
            : `Failed to load videos: ${error}`
          }
        </p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="bg-white/5 rounded-lg p-6 text-center">
        <FaYoutube className="text-gray-400 text-4xl mx-auto mb-2" />
        <p className="text-gray-400">No videos found for this topic</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <FaYoutube className="text-red-500 text-2xl" />
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>
      <div className={`grid gap-4 ${videos.length === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {videos.map((video) => (
          <div
            key={video.id.videoId}
            onClick={() => openVideo(video.id.videoId)}
            className="bg-white/10 backdrop-blur-lg rounded-lg overflow-hidden cursor-pointer 
                     hover:bg-white/20 transition-all duration-300 hover:scale-105 group
                     border border-white/10 hover:border-red-500/50"
          >
            <div className="relative">
              <img
                src={video.snippet.thumbnails.medium.url}
                alt={video.snippet.title}
                className="w-full h-40 object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 
                            transition-opacity duration-300 flex items-center justify-center">
                <div className="bg-red-500 rounded-full p-3">
                  <FaPlay className="text-white text-xl" />
                </div>
              </div>
            </div>
            <div className="p-4">
              <h4 className="text-white font-semibold line-clamp-2 mb-2 group-hover:text-red-300 
                           transition-colors duration-200">
                {video.snippet.title}
              </h4>
              <p className="text-gray-300 text-sm">{video.snippet.channelTitle}</p>
              <p className="text-gray-400 text-xs mt-1">
                {new Date(video.snippet.publishedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoRecommendations;

