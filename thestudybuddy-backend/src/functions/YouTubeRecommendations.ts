import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getUserInfoFromRequest } from "../shared/auth";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

interface YouTubeSearchResponse {
  items: Array<{
    id: {
      videoId: string;
    };
    snippet: {
      title: string;
      description: string;
      channelTitle: string;
      publishedAt: string;
      thumbnails: {
        default: { url: string; width: number; height: number };
        medium: { url: string; width: number; height: number };
        high: { url: string; width: number; height: number };
      };
    };
  }>;
}

app.http("getYouTubeRecommendations", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "youtube/recommendations",
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const { userId } = await getUserInfoFromRequest(request);
      const query = request.query.get('query');
      const maxResults = request.query.get('maxResults') || '6';
      
      if (!query) {
        return {
          status: 400,
          jsonBody: { message: "Search query is required" }
        };
      }

      if (!YOUTUBE_API_KEY) {
        context.warn("YouTube API key not configured");
        return {
          status: 503,
          jsonBody: { message: "YouTube API not configured" }
        };
      }

      context.log(`Fetching YouTube recommendations for query: ${query}`);

      // Search YouTube with filters for educational content
      const params = new URLSearchParams({
        part: 'snippet',
        q: `${query} tutorial education`,
        type: 'video',
        videoCategoryId: '27', // Education category
        maxResults: maxResults,
        order: 'relevance',
        safeSearch: 'strict',
        videoEmbeddable: 'true',
        key: YOUTUBE_API_KEY
      });

      const response = await fetch(`${YOUTUBE_API_URL}?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        context.error("YouTube API error:", errorData);
        return {
          status: response.status,
          jsonBody: { 
            message: "YouTube API request failed",
            error: errorData 
          }
        };
      }

      const data: YouTubeSearchResponse = await response.json();

      context.log(`✅ Found ${data.items?.length || 0} videos for query: ${query}`);

      return {
        status: 200,
        jsonBody: data
      };
    } catch (error: any) {
      context.error("Error fetching YouTube recommendations:", error);
      return {
        status: 500,
        jsonBody: { 
          message: "Failed to fetch recommendations",
          error: error.message 
        }
      };
    }
  }
});

