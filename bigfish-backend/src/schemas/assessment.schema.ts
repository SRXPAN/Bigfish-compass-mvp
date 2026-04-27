/**
 * Assessment Validation Schemas
 * Zod schemas for assessment session and response submission
 */
import { z } from 'zod'
import { commonSchemas } from './common.schema.js'

/**
 * Assessment response schema (single response to a question)
 */
export const assessmentResponseSchema = z.object({
  questionId: z.string().cuid('Invalid question ID'),
  selectedOptions: z.array(z.string().cuid()).optional(),
  scaleValue: z.number().int().min(1).max(5).optional(),
  textValue: z.string().max(5000).optional(),
})

export type AssessmentResponseInput = z.infer<typeof assessmentResponseSchema>

/**
 * Start assessment schema (path params)
 */
export const startAssessmentParamSchema = z.object({
  templateId: z.string().cuid('Invalid template ID'),
})

export type StartAssessmentParam = z.infer<typeof startAssessmentParamSchema>

/**
 * Submit assessment schema (path params + body)
 */
export const submitAssessmentParamSchema = z.object({
  sessionId: z.string().cuid('Invalid session ID'),
})

export const submitAssessmentBodySchema = z.object({
  responses: z
    .array(assessmentResponseSchema)
    .min(1, 'At least one response is required'),
})

export type SubmitAssessmentParam = z.infer<typeof submitAssessmentParamSchema>
export type SubmitAssessmentBody = z.infer<typeof submitAssessmentBodySchema>

/**
 * Get session schema (path params)
 */
export const getAssessmentSessionParamSchema = z.object({
  sessionId: z.string().cuid('Invalid session ID'),
})

export type GetAssessmentSessionParam = z.infer<typeof getAssessmentSessionParamSchema>

/**
 * Template ID param schema
 */
export const templateIdParamSchema = z.object({
  id: z.string().cuid('Invalid template ID'),
})

export type TemplateIdParam = z.infer<typeof templateIdParamSchema>

/**
 * All assessment schemas exported for easy access
 */
export const assessmentSchemas = {
  startParam: startAssessmentParamSchema,
  submitParam: submitAssessmentParamSchema,
  submitBody: submitAssessmentBodySchema,
  getSessionParam: getAssessmentSessionParamSchema,
  templateIdParam: templateIdParamSchema,
  assessmentResponse: assessmentResponseSchema,
}
