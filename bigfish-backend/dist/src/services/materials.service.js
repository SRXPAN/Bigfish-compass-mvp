// src/services/materials.service.ts
import { prisma } from '../db.js';
/**
 * Updates a material with localized content
 * Handles fallbacks and JSON fields construction
 */
export async function updateMaterialWithLocalization(id, dto) {
    const updateData = {};
    // Type update if provided
    if (dto.type) {
        updateData.type = dto.type; // Ideally imports MaterialType enum from client
    }
    // Legacy/Fallback fields (Main language EN)
    if (dto.titleEN)
        updateData.title = dto.titleEN;
    if (dto.linkEN)
        updateData.url = dto.linkEN;
    if (dto.contentEN)
        updateData.content = dto.contentEN;
    // JSON Localization fields (The real localization)
    // We use simple objects, Prisma handles JSON serialization
    // 1. Build titleJson
    const titleJson = {
        EN: dto.titleEN || '',
        UA: dto.titleUA || '',
        PL: dto.titlePL || ''
    };
    // Remove empty keys to keep DB clean (optional, but good practice)
    Object.keys(titleJson).forEach(k => titleJson[k] === '' && delete titleJson[k]);
    updateData.titleJson = titleJson;
    // 2. Build urlJson (was urlCache)
    const urlJson = {
        EN: dto.linkEN || '',
        UA: dto.linkUA || '',
        PL: dto.linkPL || ''
    };
    Object.keys(urlJson).forEach(k => urlJson[k] === '' && delete urlJson[k]);
    updateData.urlJson = urlJson;
    // 3. Build contentJson
    const contentJson = {
        EN: dto.contentEN || '',
        UA: dto.contentUA || '',
        PL: dto.contentPL || ''
    };
    Object.keys(contentJson).forEach(k => contentJson[k] === '' && delete contentJson[k]);
    updateData.contentJson = contentJson;
    const updated = await prisma.material.update({
        where: { id },
        data: updateData
    });
    return updated;
}
