import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getUserInfoFromRequest } from "../shared/auth";
import { userRepo } from "../index";
import { ErrorResponse } from "../shared/types";

/**
 * POST /api/users/sync - Create or update user in MongoDB (called after Firebase auth)
 */
app.http("syncUser", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "users/sync",
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const { userId, userEmail } = await getUserInfoFromRequest(request);
      
      const body = await request.json() as any;
      
      context.log(`Syncing user: ${userId} (${userEmail})`);

      // Check if user already exists
      let user = await userRepo.getUserById(userId);

      if (user) {
        // Update existing user
        user = await userRepo.updateLastLogin(userId);
        context.log(`✅ User updated: ${userId}`);
      } else {
        // Create new user
        user = await userRepo.createUser({
          userId,
          email: userEmail || body.email || '',
          displayName: body.displayName,
          photoURL: body.photoURL,
          emailVerified: body.emailVerified || false,
          provider: body.provider || 'email',
          metadata: body.metadata,
        });
        context.log(`✅ New user created: ${userId}`);
      }

      return {
        status: 200,
        jsonBody: user,
      };
    } catch (error: any) {
      context.error("Error in syncUser:", error);
      return {
        status: 500,
        jsonBody: { message: "Failed to sync user", error: error.message } as ErrorResponse,
      };
    }
  },
});

/**
 * GET /api/users/me - Get current user's information
 */
app.http("getCurrentUser", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "users/me",
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const { userId } = await getUserInfoFromRequest(request);
      
      const user = await userRepo.getUserById(userId);

      if (!user) {
        return {
          status: 404,
          jsonBody: { message: "User not found" } as ErrorResponse,
        };
      }

      return {
        status: 200,
        jsonBody: user,
      };
    } catch (error: any) {
      context.error("Error in getCurrentUser:", error);
      return {
        status: 500,
        jsonBody: { message: "Failed to get user", error: error.message } as ErrorResponse,
      };
    }
  },
});

/**
 * PATCH /api/users/me - Update current user's information
 */
app.http("updateCurrentUser", {
  methods: ["PATCH"],
  authLevel: "anonymous",
  route: "users/me",
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const { userId } = await getUserInfoFromRequest(request);
      
      const body = await request.json() as any;
      
      const user = await userRepo.updateUser(userId, {
        displayName: body.displayName,
        photoURL: body.photoURL,
        emailVerified: body.emailVerified,
      });

      if (!user) {
        return {
          status: 404,
          jsonBody: { message: "User not found" } as ErrorResponse,
        };
      }

      context.log(`✅ User updated: ${userId}`);

      return {
        status: 200,
        jsonBody: user,
      };
    } catch (error: any) {
      context.error("Error in updateCurrentUser:", error);
      return {
        status: 500,
        jsonBody: { message: "Failed to update user", error: error.message } as ErrorResponse,
      };
    }
  },
});

/**
 * DELETE /api/users/me - Delete current user from MongoDB
 */
app.http("deleteCurrentUser", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "users/me",
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const { userId } = await getUserInfoFromRequest(request);
      
      // Delete user from MongoDB
      const deleted = await userRepo.deleteUser(userId);

      if (!deleted) {
        return {
          status: 404,
          jsonBody: { message: "User not found" } as ErrorResponse,
        };
      }

      context.log(`✅ User deleted from MongoDB: ${userId}`);

      return {
        status: 204,
      };
    } catch (error: any) {
      context.error("Error in deleteCurrentUser:", error);
      return {
        status: 500,
        jsonBody: { message: "Failed to delete user", error: error.message } as ErrorResponse,
      };
    }
  },
});

