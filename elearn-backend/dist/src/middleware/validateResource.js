import { AppError } from '../utils/AppError.js';
/**
 * Validates request data against a Zod schema
 * @param schema - Zod schema to validate against
 * @param source - What to validate: 'body', 'query', 'params', or object with multiple sources
 * @returns Express middleware function
 *
 * @example
 * // Validate request body
 * router.post('/topics', validateResource(createTopicSchema, 'body'), handler)
 *
 * @example
 * // Validate multiple sources
 * router.put('/topics/:id', validateResource(updateTopicSchema, {
 *   body: createTopicSchema,
 *   params: z.object({ id: z.string().uuid() })
 * }), handler)
 */
export function validateResource(schema, source = 'body') {
    return (req, res, next) => {
        try {
            // Determine sources to validate
            const sources = {};
            if (typeof source === 'string') {
                sources[source] = schema;
            }
            else {
                if (source.body)
                    sources.body = source.body;
                if (source.query)
                    sources.query = source.query;
                if (source.params)
                    sources.params = source.params;
            }
            // Validate each source
            const errors = {};
            for (const [sourceName, sourcePath] of Object.entries(sources)) {
                const data = req[sourceName];
                const result = sourcePath.safeParse(data);
                if (!result.success) {
                    errors[sourceName] = result.error.flatten().fieldErrors;
                    // Log validation errors for debugging
                    console.log(`[Validation Error] ${sourceName}:`, JSON.stringify(result.error.flatten(), null, 2));
                }
            }
            // If validation failed, throw AppError
            if (Object.keys(errors).length > 0) {
                throw AppError.badRequest('Validation failed', errors);
            }
            // Validation passed, attach parsed data to request for convenience
            if (typeof source === 'string') {
                const result = schema.safeParse(req[source]);
                if (result.success) {
                    req[`${source}Parsed`] = result.data;
                }
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
}
