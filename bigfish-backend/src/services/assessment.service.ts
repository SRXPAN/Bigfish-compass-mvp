// src/services/assessment.service.ts
/**
 * Assessment Service
 * Handles career assessment sessions and scoring
 */
import { prisma } from '../db.js'
import { AppError } from '../utils/AppError.js'
import { logger } from '../utils/logger.js'
import type { Lang } from '../shared'

export interface StartAssessmentResult {
  id: string
  studentId: string
  templateId: string
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED'
  startedAt: Date
}

export interface AssessmentResponse {
  questionId: string
  selectedOptions?: string[] // For multi-choice
  scaleValue?: number // For scale questions
  textValue?: string // For text questions
}

export interface SubmitAssessmentResult {
  sessionId: string
  profileScoreId: string
  dimensionScores: Record<string, number>
  overallScore: number
  topDimensions: string[]
}

/**
 * Start an assessment session - deducts 1 token from student
 */
export async function startAssessment(
  studentId: string,
  templateId: string
): Promise<StartAssessmentResult> {
  logger.info(`[startAssessment] Starting assessment for student ${studentId}, template ${templateId}`)

  // Fetch user and template in parallel
  const [user, template] = await Promise.all([
    prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, tokens: true, role: true },
    }),
    prisma.assessmentTemplate.findUnique({
      where: { id: templateId },
      select: { id: true, isActive: true },
    }),
  ])

  if (!user) {
    logger.warn(`[startAssessment] User ${studentId} not found`)
    throw AppError.notFound('User not found')
  }

  if (!template) {
    logger.warn(`[startAssessment] Assessment template ${templateId} not found`)
    throw AppError.notFound('Assessment template not found')
  }

  if (!template.isActive) {
    logger.warn(`[startAssessment] Assessment template ${templateId} is not active`)
    throw AppError.forbidden('Assessment template is not available')
  }

  // Check token balance
  if (!user.tokens || user.tokens <= 0) {
    logger.warn(`[startAssessment] Student ${studentId} has insufficient tokens (${user.tokens ?? 0})`)
    throw AppError.forbidden('Not enough tokens to start the assessment')
  }

  // Use transaction to atomically decrement tokens and create session
  const session = await prisma.$transaction(async (tx) => {
    // Decrement tokens (only if still > 0 to avoid race conditions)
    const updated = await tx.user.updateMany({
      where: {
        id: studentId,
        tokens: { gt: 0 },
      },
      data: {
        tokens: { decrement: 1 },
      },
    })

    if (updated.count === 0) {
      logger.warn(`[startAssessment] Token deduction failed for student ${studentId} - race condition detected`)
      throw AppError.forbidden('Not enough tokens to start the assessment')
    }

    // Create assessment session
    const newSession = await tx.assessmentSession.create({
      data: {
        studentId,
        templateId,
        status: 'IN_PROGRESS',
        locale: 'EN' as any,
        startedAt: new Date(),
      },
      select: {
        id: true,
        studentId: true,
        templateId: true,
        status: true,
        startedAt: true,
      },
    })

    return newSession
  })

  logger.info(`[startAssessment] Created assessment session ${session.id} for student ${studentId}`)

  return {
    id: session.id,
    studentId: session.studentId,
    templateId: session.templateId,
    status: session.status as 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED',
    startedAt: session.startedAt,
  }
}

/**
 * Submit assessment responses and calculate dimension scores
 */
export async function submitAssessment(
  sessionId: string,
  studentId: string,
  responses: AssessmentResponse[]
): Promise<SubmitAssessmentResult> {
  logger.info(
    `[submitAssessment] Submitting ${responses.length} responses for session ${sessionId}, student ${studentId}`
  )

  // Fetch the session
  const session = await prisma.assessmentSession.findUnique({
    where: { id: sessionId },
    include: {
      template: {
        include: {
          questions: true,
        },
      },
    },
  })

  if (!session) {
    logger.warn(`[submitAssessment] Session ${sessionId} not found`)
    throw AppError.notFound('Assessment session not found')
  }

  if (session.studentId !== studentId) {
    logger.warn(`[submitAssessment] Session ${sessionId} does not belong to student ${studentId}`)
    throw AppError.forbidden('Assessment session does not belong to this student')
  }

  if (session.status === 'COMPLETED') {
    logger.warn(`[submitAssessment] Session ${sessionId} already completed`)
    throw AppError.badRequest('Assessment session has already been completed')
  }

  // Create a map of questions with their options
  const questionMap = new Map<string, any>()
  for (const question of session.template.questions) {
    questionMap.set(question.id, question)
  }

  // Build dimension scores by aggregating weights from selected options
  const dimensionScores: Record<string, number> = {}

  // Save all responses and aggregate dimension weights
  const responsesToSave: Array<{
    sessionId: string
    questionId: string
    selectedOptions: string | null
    scaleValue: number | null
    textValue: string | null
    answeredAt: Date
  }> = []

  for (const response of responses) {
    const question = questionMap.get(response.questionId)
    if (!question) {
      logger.warn(`[submitAssessment] Question ${response.questionId} not found in template`)
      throw AppError.badRequest(`Question ${response.questionId} not found`)
    }

    // Create response record
    responsesToSave.push({
      sessionId,
      questionId: response.questionId,
      selectedOptions: response.selectedOptions ? JSON.stringify(response.selectedOptions) : null,
      scaleValue: response.scaleValue ?? null,
      textValue: response.textValue ?? null,
      answeredAt: new Date(),
    })

    // Aggregate dimension weights from selected options
    if (response.selectedOptions && Array.isArray(response.selectedOptions)) {
      const optionsJson = question.options
      if (optionsJson && Array.isArray(optionsJson)) {
        for (const optionId of response.selectedOptions) {
          const option = optionsJson.find((o: any) => o.id === optionId)
          if (option && option.dimensionWeights) {
            for (const [dimension, weight] of Object.entries(option.dimensionWeights)) {
              dimensionScores[dimension] = (dimensionScores[dimension] ?? 0) + (weight as number)
            }
          }
        }
      }
    } else if (response.scaleValue && question.options) {
      // For scale questions, assume the scale value maps to a dimension
      const optionsJson = question.options
      if (optionsJson && Array.isArray(optionsJson)) {
        // Map scale value to a selected option or use it directly
        const option = optionsJson[response.scaleValue - 1]
        if (option && option.dimensionWeights) {
          for (const [dimension, weight] of Object.entries(option.dimensionWeights)) {
            dimensionScores[dimension] = (dimensionScores[dimension] ?? 0) + (weight as number)
          }
        }
      }
    }
  }

  // Calculate overall score (normalize to 0-100 range)
  const totalWeight = Object.values(dimensionScores).reduce((sum, val) => sum + val, 0) || 1
  const overallScore = Math.round((totalWeight / (responses.length * 10)) * 100) // Normalize based on response count

  // Determine top 3 dimensions
  const topDimensions = Object.entries(dimensionScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([dim]) => dim)

  // Save all responses and create ProfileScore in a transaction
  const profileScore = await prisma.$transaction(async (tx) => {
    // Save responses
    if (responsesToSave.length > 0) {
      await tx.assessmentResponse.createMany({
        data: responsesToSave as any,
        skipDuplicates: true,
      })
    }

    // Update session status
    await tx.assessmentSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED' as any,
        completedAt: new Date(),
      },
    })

    // Create ProfileScore
    const profile = await tx.profileScore.create({
      data: {
        sessionId,
        studentId,
        dimensionScores,
        overallScore,
        topDimensions,
      },
      select: {
        id: true,
        sessionId: true,
        dimensionScores: true,
        overallScore: true,
        topDimensions: true,
      },
    })

    return profile
  })

  logger.info(
    `[submitAssessment] Completed assessment session ${sessionId} with overall score ${overallScore}`
  )

  return {
    sessionId: profileScore.sessionId,
    profileScoreId: profileScore.id,
    dimensionScores: profileScore.dimensionScores as Record<string, number>,
    overallScore: profileScore.overallScore,
    topDimensions: profileScore.topDimensions,
  }
}

/**
 * Get assessment session details with responses
 */
export async function getAssessmentSession(
  sessionId: string,
  studentId: string
) {
  logger.info(`[getAssessmentSession] Fetching session ${sessionId} for student ${studentId}`)

  const session = await prisma.assessmentSession.findUnique({
    where: { id: sessionId },
    include: {
      template: {
        select: {
          id: true,
          name: true,
          nameJson: true,
          durationMinutes: true,
        },
      },
      responses: true,
      profileScore: true,
    },
  })

  if (!session) {
    logger.warn(`[getAssessmentSession] Session ${sessionId} not found`)
    throw AppError.notFound('Assessment session not found')
  }

  if (session.studentId !== studentId) {
    logger.warn(`[getAssessmentSession] Session ${sessionId} does not belong to student ${studentId}`)
    throw AppError.forbidden('Assessment session does not belong to this student')
  }

  return session
}
