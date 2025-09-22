export const getYouTubeEmbedUrl = (url: string, isMuted: boolean = true): string | null => {
  let videoId: string | null = null;
  // Regular expression to find the YouTube video ID from various URL formats
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    videoId = match[2];
  }
  
  if (videoId) {
    const muteParam = isMuted ? 1 : 0;
    // Construct the embed URL with parameters for a seamless, autoplaying, and looped experience
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${muteParam}&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`;
  }
  return null;
};