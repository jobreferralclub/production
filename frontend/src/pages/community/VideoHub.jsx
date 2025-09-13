// VideoHub.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiVideo, FiPlay, FiUsers, FiCalendar, FiPlus, FiLive } = FiIcons;

const VideoHub = () => {
  const [activeTab, setActiveTab] = useState('library');

  // ---------------------------
  // Demo Video Data
  // ---------------------------
  const videos = [
    {
      id: 1,
      title: 'How to Ace Your Tech Interview',
      thumbnail:
        'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=225&fit=crop',
      duration: '45:32',
      views: 2847,
      type: 'tutorial',
      mentor: 'Sarah Chen',
      uploaded: '2 days ago',
    },
    {
      id: 2,
      title: 'Networking Strategies for Career Growth',
      thumbnail:
        'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=225&fit=crop',
      duration: '32:18',
      views: 1923,
      type: 'webinar',
      mentor: 'Mike Rodriguez',
      uploaded: '1 week ago',
    },
    {
      id: 3,
      title: 'Resume Review Session - Live',
      thumbnail:
        'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=225&fit=crop',
      duration: '1:15:22',
      views: 3421,
      type: 'live-session',
      mentor: 'Emily Davis',
      uploaded: '3 days ago',
    },
  ];

  // ---------------------------
  // Demo Upcoming Events
  // ---------------------------
  const upcomingEvents = [
    {
      id: 1,
      title: 'Q&A with FAANG Engineers',
      date: 'Tomorrow, 2:00 PM PST',
      attendees: 234,
      host: 'David Kim',
    },
    {
      id: 2,
      title: 'Salary Negotiation Workshop',
      date: 'Friday, 6:00 PM PST',
      attendees: 189,
      host: 'Lisa Wang',
    },
  ];

  // ---------------------------
  // Navigation Tabs
  // ---------------------------
  const tabs = [
    { id: 'library', name: 'Video Library', icon: FiVideo },
    { id: 'live', name: 'Live Events', icon: FiLive },
    { id: 'upload', name: 'Upload Content', icon: FiPlus },
  ];

  // ---------------------------
  // Render Video Library
  // ---------------------------
  const renderVideoLibrary = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['All', 'Tutorials', 'Webinars', 'Live Sessions', 'Q&A'].map((filter) => (
          <button
            key={filter}
            className="px-4 py-2 bg-zinc-900 border border-gray-700 rounded-full text-sm text-gray-300 hover:bg-gray-700 transition-colors"
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-zinc-900 rounded-2xl overflow-hidden border border-gray-700 shadow-[0_0_15px_rgba(0,200,255,0.15)] hover:shadow-[0_0_25px_rgba(0,200,255,0.25)] transition-shadow"
          >
            <div className="relative">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <button className="bg-white bg-opacity-90 rounded-full p-3 hover:bg-opacity-100 transition-all">
                  <SafeIcon icon={FiPlay} className="w-6 h-6 text-black" />
                </button>
              </div>
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                {video.duration}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-white mb-2 line-clamp-2">
                {video.title}
              </h3>
              <p className="text-sm text-gray-400 mb-2">by {video.mentor}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center space-x-1">
                  <SafeIcon icon={FiUsers} className="w-3 h-3" />
                  <span>{video.views} views</span>
                </span>
                <span>{video.uploaded}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // ---------------------------
  // Render Live Events
  // ---------------------------
  const renderLiveEvents = () => (
    <div className="space-y-6">
      {/* Upcoming Events */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Upcoming Events</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingEvents.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900 rounded-2xl p-6 border border-gray-700 shadow-[0_0_15px_rgba(255,0,150,0.15)] hover:shadow-[0_0_25px_rgba(255,0,150,0.25)] transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-white mb-1">{event.title}</h4>
                  <p className="text-sm text-gray-400">Hosted by {event.host}</p>
                </div>
                <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                  Live
                </span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                <span className="flex items-center space-x-1">
                  <SafeIcon icon={FiCalendar} className="w-4 h-4" />
                  <span>{event.date}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <SafeIcon icon={FiUsers} className="w-4 h-4" />
                  <span>{event.attendees} attending</span>
                </span>
              </div>
              <button className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors">
                Join Event
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Live Streaming Setup */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 rounded-2xl p-6 border border-gray-700 shadow-[0_0_15px_rgba(0,255,150,0.15)] hover:shadow-[0_0_25px_rgba(0,255,150,0.25)] transition-shadow"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Start Live Session</h3>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Session title..."
            className="w-full p-3 bg-black border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <textarea
            placeholder="Session description..."
            rows={3}
            className="w-full p-3 bg-black border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="text-primary-600 focus:ring-primary-500 rounded" />
                <span className="text-sm text-gray-300">Record session</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="text-primary-600 focus:ring-primary-500 rounded" />
                <span className="text-sm text-gray-300">Send notifications</span>
              </label>
            </div>
            <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
              <SafeIcon icon={FiLive} className="w-4 h-4" />
              <span>Go Live</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // ---------------------------
  // Render Upload Content
  // ---------------------------
  const renderUploadContent = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900 rounded-2xl p-6 border border-gray-700 shadow-[0_0_15px_rgba(0,150,255,0.15)] hover:shadow-[0_0_25px_rgba(0,150,255,0.25)] transition-shadow"
    >
      <h3 className="text-lg font-semibold text-white mb-6">Upload New Content</h3>
      <div className="space-y-6">
        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center bg-black">
          <SafeIcon icon={FiVideo} className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-white mb-2">Upload Video</h4>
          <p className="text-gray-400 mb-4">Drag and drop your video file or click to browse</p>
          <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors">
            Choose File
          </button>
        </div>

        {/* Video Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
            <input
              type="text"
              className="w-full p-3 bg-black border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter video title..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <select className="w-full p-3 bg-black border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <option>Select category...</option>
              <option>Tutorial</option>
              <option>Webinar</option>
              <option>Q&A Session</option>
              <option>Interview Tips</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
          <textarea
            rows={4}
            className="w-full p-3 bg-black border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Describe your video content..."
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="text-primary-600 focus:ring-primary-500 rounded" />
              <span className="text-sm text-gray-300">Premium content</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="text-primary-600 focus:ring-primary-500 rounded" />
              <span className="text-sm text-gray-300">Send notification to subscribers</span>
            </label>
          </div>
          <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors">
            Upload Video
          </button>
        </div>
      </div>
    </motion.div>
  );

  // ---------------------------
  // Main Return
  // ---------------------------
  return (
    <div className="space-y-6 bg-black min-h-screen p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Video Hub</h1>
        <p className="text-gray-400 mt-1">Manage video content and live sessions</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
              }`}
            >
              <SafeIcon icon={tab.icon} className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Dynamic Content */}
      <div>
        {activeTab === 'library' && renderVideoLibrary()}
        {activeTab === 'live' && renderLiveEvents()}
        {activeTab === 'upload' && renderUploadContent()}
      </div>
    </div>
  );
};

export default VideoHub;
