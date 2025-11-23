import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getUserInfoFromRequest } from "../shared/auth";
import { subjectRepo } from "../index";
import { CreateSubjectRequest, UpdateSubjectRequest, ErrorResponse } from "../shared/types";

/**
 * GET /api/subjects - List all subjects for current user
 */
app.http("getSubjects", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "subjects",
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const { userId } = await getUserInfoFromRequest(request);
      const subjects = await subjectRepo.getSubjectsByUser(userId);
      
      return {
        status: 200,
        jsonBody: subjects,
      };
    } catch (error) {
      context.error("Error in getSubjects:", error);
      return {
        status: 500,
        jsonBody: { message: "Internal server error" } as ErrorResponse,
      };
    }
  },
});

/**
 * POST /api/subjects - Create a new subject
 */
app.http("createSubject", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "subjects",
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const { userId, userEmail } = await getUserInfoFromRequest(request);
      const body = await request.json() as CreateSubjectRequest;

      // Validate required fields
      if (!body.name || !body.color) {
        return {
          status: 400,
          jsonBody: { message: "name and color are required" } as ErrorResponse,
        };
      }

      const subject = await subjectRepo.createSubject(userId, {
        name: body.name,
        color: body.color,
        userEmail,
      });

      return {
        status: 201,
        jsonBody: subject,
      };
    } catch (error) {
      context.error("Error in createSubject:", error);
      return {
        status: 500,
        jsonBody: { message: "Internal server error" } as ErrorResponse,
      };
    }
  },
});

/**
 * GET /api/subjects/{id} - Get a single subject by ID
 */
app.http("getSubject", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "subjects/{id}",
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const { userId } = await getUserInfoFromRequest(request);
      const id = request.params.id;

      if (!id) {
        return {
          status: 400,
          jsonBody: { message: "Subject ID is required" } as ErrorResponse,
        };
      }

      const subject = await subjectRepo.getSubjectById(userId, id);

      if (!subject) {
        return {
          status: 404,
          jsonBody: { message: "Subject not found" } as ErrorResponse,
        };
      }

      return {
        status: 200,
        jsonBody: subject,
      };
    } catch (error) {
      context.error("Error in getSubject:", error);
      return {
        status: 500,
        jsonBody: { message: "Internal server error" } as ErrorResponse,
      };
    }
  },
});

/**
 * PUT /api/subjects/{id} - Update a subject
 */
app.http("updateSubject", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "subjects/{id}",
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const { userId } = await getUserInfoFromRequest(request);
      const id = request.params.id;

      if (!id) {
        return {
          status: 400,
          jsonBody: { message: "Subject ID is required" } as ErrorResponse,
        };
      }

      const body = await request.json() as UpdateSubjectRequest;
      const subject = await subjectRepo.updateSubject(userId, id, body);

      if (!subject) {
        return {
          status: 404,
          jsonBody: { message: "Subject not found" } as ErrorResponse,
        };
      }

      return {
        status: 200,
        jsonBody: subject,
      };
    } catch (error) {
      context.error("Error in updateSubject:", error);
      return {
        status: 500,
        jsonBody: { message: "Internal server error" } as ErrorResponse,
      };
    }
  },
});

/**
 * DELETE /api/subjects/{id} - Delete a subject
 */
app.http("deleteSubject", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "subjects/{id}",
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const { userId } = await getUserInfoFromRequest(request);
      const id = request.params.id;

      if (!id) {
        return {
          status: 400,
          jsonBody: { message: "Subject ID is required" } as ErrorResponse,
        };
      }

      // TODO: Also cascade delete notes and flashcards for this subject
      await subjectRepo.deleteSubject(userId, id);

      return {
        status: 204,
      };
    } catch (error) {
      context.error("Error in deleteSubject:", error);
      return {
        status: 500,
        jsonBody: { message: "Internal server error" } as ErrorResponse,
      };
    }
  },
});

