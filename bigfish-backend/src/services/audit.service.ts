import { prisma } from '../db.js'

export const AuditActions = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
} as const

export const AuditResources = {
  USER: 'USER',
  FILE: 'FILE',
  TOPIC: 'TOPIC',
} as const

export type AuditAction = typeof AuditActions[keyof typeof AuditActions]
export type AuditResource = typeof AuditResources[keyof typeof AuditResources]

export async function auditLog(_entry: {
  userId?: string
  action: AuditAction
  resource: AuditResource
  resourceId?: string
  metadata?: Record<string, unknown>
  ip?: string
  userAgent?: string
}) {
  await prisma.$transaction(async () => undefined)
}
