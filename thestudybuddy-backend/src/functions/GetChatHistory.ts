import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getUserInfoFromRequest } from "../shared/auth";
import ChatMessage from "../models/ChatMessage";
import { ErrorResponse } from "../shared/types";

/**
 * GET /api/chat/history/:subjectId
 * Get chat history for a specific subject
 */
app.http("getChatHistory", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "chat/history/{subjectId}",
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const { userId } = await getUserInfoFromRequest(request);
      const subjectId = request.params.subjectId;

      if (!subjectId) {
        return {
          status: 400,
          jsonBody: { message: "subjectId is required" } as ErrorResponse,
        };
      }

      // Get the limit from query params (default to 50)
      const limit = parseInt(request.query.get('limit') || '50', 10);

      // Fetch chat history
      const messages = await ChatMessage.find({
        userId,
        subjectId,
      })
        .sort({ timestamp: 1 })
        .limit(limit)
        .select('role content timestamp')
        .exec();

      context.log(`Found ${messages.length} messages for subject ${subjectId}`);

      return {
        status: 200,
        jsonBody: {
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
          })),
        },
      };

    } catch (error: any) {
      context.error("Error fetching chat history:", error);
      return {
        status: 500,
        jsonBody: { 
          message: "Failed to fetch chat history", 
          error: error.message 
        } as ErrorResponse,
      };
    }
  },
});

/**
 * DELETE /api/chat/history/:subjectId
 * Clear chat history for a specific subject
 */
app.http("clearChatHistory", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "chat/history/{subjectId}",
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const { userId } = await getUserInfoFromRequest(request);
      const subjectId = request.params.subjectId;

      if (!subjectId) {
        return {
          status: 400,
          jsonBody: { message: "subjectId is required" } as ErrorResponse,
        };
      }

      // Delete all chat messages for this subject
      const result = await ChatMessage.deleteMany({
        userId,
        subjectId,
      });

      context.log(`Deleted ${result.deletedCount} messages for subject ${subjectId}`);

      return {
        status: 200,
        jsonBody: {
          message: `Cleared ${result.deletedCount} messages`,
          deletedCount: result.deletedCount,
        },
      };

    } catch (error: any) {
      context.error("Error clearing chat history:", error);
      return {
        status: 500,
        jsonBody: { 
          message: "Failed to clear chat history", 
          error: error.message 
        } as ErrorResponse,
      };
    }
  },
});
