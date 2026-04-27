import { Router, type Request, type Response } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { validateResource } from '../middleware/validateResource.js'
import { ok } from '../utils/response.js'
import { redeemAccessCode } from '../services/student.service.js'

const router = Router()

const redeemCodeSchema = z.object({
  code: z.string().trim().min(1),
})

router.post(
  '/redeem',
  requireAuth,
  validateResource(redeemCodeSchema, 'body'),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await redeemAccessCode(req.user!.id, req.body.code)
    return ok(res, result)
  })
)

export default router