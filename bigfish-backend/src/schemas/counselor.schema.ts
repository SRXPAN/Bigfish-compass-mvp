// src/schemas/counselor.schema.ts
import { z } from 'zod'

export const generateAccessCodeSchema = z.object({
  maxUses: z.number().int().positive('maxUses must be a positive integer')
})

export type GenerateAccessCodeInput = z.infer<typeof generateAccessCodeSchema>
