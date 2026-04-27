import { Router, type Request, type Response } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { validateResource } from '../middleware/validateResource.js'
import { created } from '../utils/response.js'
import { generateAccessCode } from '../services/counselor.service.js'

const router = Router()

const generateCodeSchema = z.object({
  maxUses: z.number().int().positive(),
})

router.post(
  '/codes',
  requireAuth,
  validateResource(generateCodeSchema, 'body'),
  asyncHandler(async (req: Request, res: Response) => {
    const accessCode = await generateAccessCode(req.user!.id, req.body.maxUses)
    return created(res, { accessCode })
  })
)

export default router