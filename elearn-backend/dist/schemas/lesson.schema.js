/**
 * Lesson/Material View Validation Schemas
 * Zod schemas for lesson/material viewing endpoints
 */
import { z } from 'zod';
import { commonSchemas } from './common.schema.js';
/**
 * Lesson/Material ID parameter schema
 * Changed from UUID to CUID
 */
export const lessonIdParamSchema = z.object({
    id: z.string().cuid('Invalid lesson/material ID'),
});
/**
 * Lesson query parameters schema
 */
export const lessonQuerySchema = z.object({
    lang: commonSchemas.lang.optional(),
    includeProgress: z
        .enum(['true', 'false'])
        .optional()
        .transform((v) => v === 'true'),
});
/**
 * Mark lesson as viewed schema
 */
export const markLessonViewedSchema = z.object({
    materialId: z.string().cuid('Invalid material ID'), // Changed to CUID
    timeSpent: z.number().int().min(0).optional(),
    completedPercentage: z
        .number()
        .min(0)
        .max(100)
        .optional(),
});
/**
 * Lesson progress query schema
 */
export const lessonProgressQuerySchema = z.object({
    materialId: z.string().cuid('Invalid material ID'), // Changed to CUID
});
/**
 * All lesson schemas
 */
export const lessonSchemas = {
    idParam: lessonIdParamSchema,
    query: lessonQuerySchema,
    markViewed: markLessonViewedSchema,
    progressQuery: lessonProgressQuerySchema,
};
