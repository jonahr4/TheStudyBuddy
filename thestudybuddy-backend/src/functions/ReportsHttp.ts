import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getUserInfoFromRequest } from '../shared/auth';
import { Report } from '../models/Report';

/**
 * HTTP Trigger: Submit a bug report or feature request
 * POST /api/reports
 */
async function submitReport(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('Processing report submission');

  try {
    const user = await getUserInfoFromRequest(request);
    if (!user || !user.userId) {
      return { status: 401, jsonBody: { error: 'Unauthorized' } };
    }

    const body = await request.json() as {
      type: 'bug' | 'feature' | 'improvement' | 'other';
      description: string;
    };

    if (!body.type || !body.description) {
      return {
        status: 400,
        jsonBody: { error: 'Type and description are required' },
      };
    }

    if (body.description.trim().length < 10) {
      return {
        status: 400,
        jsonBody: { error: 'Description must be at least 10 characters' },
      };
    }

    const report = new Report({
      userId: user.userId,
      userEmail: user.userEmail || 'unknown',
      type: body.type,
      description: body.description.trim(),
      status: 'new',
    });

    await report.save();

    context.log(`Report submitted by user ${user.userId}`);

    return {
      status: 201,
      jsonBody: {
        message: 'Report submitted successfully',
        reportId: report._id,
      },
    };
  } catch (error) {
    context.error('Error submitting report:', error);
    return {
      status: 500,
      jsonBody: { error: 'Failed to submit report' },
    };
  }
}

/**
 * HTTP Trigger: Get all reports (admin only - for future use)
 * GET /api/reports
 */
async function getReports(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('Fetching reports');

  try {
    const user = await getUserInfoFromRequest(request);
    if (!user || !user.userId) {
      return { status: 401, jsonBody: { error: 'Unauthorized' } };
    }

    // Get all reports for the user
    const reports = await Report.find({ userId: user.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    return {
      status: 200,
      jsonBody: { reports },
    };
  } catch (error) {
    context.error('Error fetching reports:', error);
    return {
      status: 500,
      jsonBody: { error: 'Failed to fetch reports' },
    };
  }
}

app.http('ReportsSubmit', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'reports',
  handler: submitReport,
});

app.http('ReportsGet', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'reports',
  handler: getReports,
});
