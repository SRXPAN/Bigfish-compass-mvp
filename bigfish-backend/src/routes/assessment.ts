// src/routes/assessment.ts
/**
 * Assessment Routes
 * Endpoints for career assessment sessions and scoring
 */
import { Router, Request, Response } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler, AppError } from '../middleware/errorHandler.js'
import { validateResource } from '../middleware/validateResource.js'
import { assessmentSchemas } from '../schemas/assessment.schema.js'
import {
  startAssessment,
  submitAssessment,
  getAssessmentSession,
} from '../services/assessment.service.js'

const router = Router()

/**
 * Helper to get param from Express (handles string | string[] edge case)
 */
function getParam(param: string | string[]): string {
  return Array.isArray(param) ? param[0] : param
}

/**
 * POST /api/assessment/:templateId/start
 * Start a new assessment session (deducts 1 token)
 */
router.post(
  '/:templateId/start',
  requireAuth,
  validateResource(assessmentSchemas.startParam, 'params'),
  asyncHandler(async (req: Request, res: Response) => {
    const templateId = getParam(req.params.templateId)
    const studentId = req.user!.id

    const session = await startAssessment(studentId, templateId)
    return res.status(201).json(session)
  })
)

/**
 * POST /api/assessment/:sessionId/submit
 * Submit assessment responses and calculate dimension scores
 */
router.post(
  '/:sessionId/submit',
  requireAuth,
  validateResource(assessmentSchemas.submitParam, 'params'),
  validateResource(assessmentSchemas.submitBody, 'body'),
  asyncHandler(async (req: Request, res: Response) => {
    const sessionId = getParam(req.params.sessionId)
    const studentId = req.user!.id
    const { responses } = req.body

    const result = await submitAssessment(sessionId, studentId, responses)
    return res.json(result)
  })
)

/**
 * GET /api/assessment/:sessionId
 * Get assessment session details and responses
 */
router.get(
  '/:sessionId',
  requireAuth,
  validateResource(assessmentSchemas.getSessionParam, 'params'),
  asyncHandler(async (req: Request, res: Response) => {
    const sessionId = getParam(req.params.sessionId)
    const studentId = req.user!.id

    const session = await getAssessmentSession(sessionId, studentId)
    return res.json(session)
  })
)

export default router
