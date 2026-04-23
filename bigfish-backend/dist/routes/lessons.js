// src/routes/lessons.ts
import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { validateResource } from '../middleware/validateResource.js';
import { z } from 'zod';
import { localizeObject } from '../utils/i18n.js';
import { ok } from '../utils/response.js';
const router = Router();
function getParam(param) {
    return Array.isArray(param) ? param[0] : param;
}
function localizeMaterial(material, lang) {
    // 1. Clone object to avoid mutation
    const result = { ...material };
    // 2. Determine content language (metadata)
    let contentLang = 'EN';
    const titleJson = material.titleJson;
    if (titleJson && typeof titleJson === 'object' && titleJson[lang]) {
        contentLang = lang;
    }
    // 3. Localize specific fields
    if (material.titleJson) {
        const localized = localizeObject(material, lang, { titleJson: 'title' });
        result.title = localized.title;
    }
    if (material.contentJson) {
        const localized = localizeObject(material, lang, { contentJson: 'content' });
        result.content = localized.content;
    }
    // 4. Cleanup internal fields
    delete result.titleJson;
    delete result.contentJson;
    // 5. Add meta info
    result.meta = {
        requestedLang: lang,
        contentLang: contentLang
    };
    return result;
}
// Schemas
const querySchema = z.object({
    lang: z.enum(['UA', 'PL', 'EN']).optional(),
    page: z.string().regex(/^\d+$/).optional().default('1'),
    limit: z.string().regex(/^\d+$/).optional().default('10'),
});
// Validation schemas for IDs (Using CUID for Prisma compatibility)
const idParams = z.object({ id: z.string().cuid() });
const topicParams = z.object({ topicId: z.string().cuid() });
// GET /lessons
router.get('/', requireAuth, validateResource(querySchema, 'query'), asyncHandler(async (req, res) => {
    const { lang, page = '1', limit = '10' } = req.query;
    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;
    const isStaff = ['ADMIN', 'EDITOR'].includes(req.user.role);
    const [materials, total] = await Promise.all([
        prisma.material.findMany({
            where: isStaff ? {} : { status: 'Published' },
            orderBy: { createdAt: 'desc' },
            take,
            skip,
            include: {
                topic: {
                    select: { id: true, name: true, slug: true, nameJson: true }
                }
            },
        }),
        prisma.material.count({ where: isStaff ? {} : { status: 'Published' } })
    ]);
    const localizedMaterials = lang
        ? materials.map((m) => localizeMaterial(m, lang))
        : materials;
    return ok(res, { data: localizedMaterials, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
}));
// GET /lessons/:id
router.get('/:id', requireAuth, validateResource(idParams, 'params'), // Corrected validation
validateResource(querySchema, 'query'), asyncHandler(async (req, res) => {
    const isStaff = ['ADMIN', 'EDITOR'].includes(req.user.role);
    const { lang } = req.query;
    const id = getParam(req.params.id);
    const material = await prisma.material.findUnique({
        where: { id },
        include: {
            topic: {
                select: { id: true, name: true, nameJson: true, slug: true },
            },
            file: true,
        },
    });
    if (!material) {
        throw AppError.notFound('Lesson not found');
    }
    if (!isStaff && material.status !== 'Published') {
        throw AppError.forbidden('Access denied');
    }
    // Fire-and-forget view increment
    prisma.material
        .update({ where: { id }, data: { views: { increment: 1 } } })
        .catch(() => { });
    if (lang) {
        const localized = localizeMaterial(material, lang);
        // Localize nested topic if present
        if (localized.topic && localized.topic.nameJson) {
            const topicLocalized = localizeObject(localized.topic, lang, { nameJson: 'name' });
            localized.topic = { ...topicLocalized };
            delete localized.topic.nameJson;
        }
        return res.json(localized);
    }
    return res.json(material);
}));
// GET /lessons/by-topic/:topicId
router.get('/by-topic/:topicId', requireAuth, validateResource(topicParams, 'params'), // Corrected validation
validateResource(querySchema, 'query'), asyncHandler(async (req, res) => {
    const isStaff = ['ADMIN', 'EDITOR'].includes(req.user.role);
    const { lang, page = '1', limit = '10' } = req.query;
    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;
    const topicId = getParam(req.params.topicId);
    const [materials, total] = await Promise.all([
        prisma.material.findMany({
            where: {
                topicId: topicId,
                ...(isStaff ? {} : { status: 'Published' }),
            },
            orderBy: { createdAt: 'asc' }, // Lessons usually ordered ASC
            take,
            skip,
        }),
        prisma.material.count({
            where: {
                topicId: topicId,
                ...(isStaff ? {} : { status: 'Published' }),
            },
        }),
    ]);
    const localizedMaterials = lang
        ? materials.map((m) => localizeMaterial(m, lang))
        : materials;
    return ok(res, { data: localizedMaterials, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
}));
export default router;
