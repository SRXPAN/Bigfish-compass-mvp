export interface LocalizedString {
    UA?: string;
    PL?: string;
    EN?: string;
}
export interface LocalizedObject {
    UA: string;
    PL: string;
    EN: string;
}
export type Role = 'ADMIN' | 'EDITOR' | 'STUDENT';
export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    xp: number;
    avatar?: string | null;
    emailVerified?: boolean;
}
export interface AuthUser extends User {
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}
export interface AuthResponse {
    user: User;
}
export type Category = 'Programming' | 'Mathematics' | 'Databases' | 'Networks' | 'WebDevelopment' | 'MobileDevelopment' | 'MachineLearning' | 'Security' | 'DevOps' | 'OperatingSystems';
export type MaterialType = 'pdf' | 'video' | 'link' | 'text';
export type Lang = 'UA' | 'PL' | 'EN';
export type Status = 'Draft' | 'Published';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export interface Material {
    id: string;
    title: string;
    titleJson?: LocalizedString;
    type: MaterialType;
    url?: string;
    fileId?: string;
    content?: string;
    contentJson?: LocalizedString;
    lang?: Lang;
    status?: Status;
    tags?: string[];
}
export interface QuizLite {
    id: string;
    title: string;
    titleJson?: LocalizedString;
    durationSec: number;
    status?: Status;
}
export interface TopicLite {
    id: string;
    name: string;
    nameJson?: LocalizedString;
    quizzes: QuizLite[];
}
export interface TopicTree {
    id: string;
    slug: string;
    name: string;
    nameJson?: LocalizedString;
    description?: string;
    descJson?: LocalizedString;
    category?: Category;
    status?: Status;
    materials: Material[];
    quizzes: QuizLite[];
    children?: TopicTree[];
}
export interface Option {
    id: string;
    text: string;
    textJson?: LocalizedString;
    correct?: boolean;
}
export interface Question {
    id: string;
    text: string;
    textJson?: LocalizedString;
    explanation?: string;
    explanationJson?: LocalizedString;
    options: Option[];
    tags: string[];
    difficulty: Difficulty;
}
export interface Quiz {
    id: string;
    title: string;
    titleJson?: LocalizedString;
    durationSec: number;
    topicId: string;
    status?: Status;
    token?: string;
    questions: Question[];
}
export interface QuizAnswer {
    questionId: string;
    optionId: string;
}
export interface QuizSubmitRequest {
    answers: QuizAnswer[];
}
export interface QuizSubmitResult {
    correct: number;
    total: number;
    xpEarned: number;
    correctMap?: Record<string, string>;
    solutions?: Record<string, string>;
}
export interface ActivityLog {
    date: string;
    timeSpent: number;
    quizAttempts: number;
    materialsViewed: number;
    goalsMet: number;
}
export interface UserStats {
    currentStreak: number;
    longestStreak: number;
    totalTimeSpent: number;
    last7DaysActivity: ActivityLog[];
    lastActiveDate: string;
}
export interface ApiError {
    error: string;
    details?: unknown;
}
export interface ApiSuccess<T = unknown> {
    data: T;
    message?: string;
}
export interface TranslationJson {
    UA: string;
    PL: string;
    EN: string;
}
export type PartialTranslationJson = Partial<TranslationJson>;
export interface WeakSpotTranslationJson {
    topic: TranslationJson;
    advice: TranslationJson;
}
export interface AchievementTranslationJson {
    name: TranslationJson;
    description: TranslationJson;
}
export declare function getTranslation(json: TranslationJson | PartialTranslationJson | null | undefined, lang: Lang, fallback?: string): string;
export interface CreateTopicRequest {
    name: string;
    slug: string;
    description?: string;
    parentId?: string;
    category?: Category;
}
export interface UpdateTopicRequest {
    name?: string;
    slug?: string;
    description?: string;
    parentId?: string | null;
    category?: Category;
    publish?: boolean;
}
export interface CreateMaterialRequest {
    title: string;
    type: MaterialType;
    url?: string;
    content?: string;
    lang?: Lang;
    publish?: boolean;
}
export interface UpdateMaterialRequest {
    title?: string;
    type?: MaterialType;
    url?: string;
    content?: string;
    lang?: Lang;
    publish?: boolean;
    status?: Status;
}
export interface CreateQuizRequest {
    title: string;
    durationSec?: number;
    publish?: boolean;
}
export interface CreateQuestionRequest {
    text: string;
    explanation?: string;
    difficulty?: Difficulty;
    tags?: string[];
    options: Array<{
        text: string;
        correct: boolean;
    }>;
}
export declare const VALIDATION: {
    readonly PASSWORD_MIN_LENGTH: 6;
    readonly PASSWORD_MAX_LENGTH: 100;
    readonly NAME_MIN_LENGTH: 2;
    readonly NAME_MAX_LENGTH: 100;
    readonly EMAIL_MAX_LENGTH: 255;
    readonly SLUG_MAX_LENGTH: 100;
    readonly CONTENT_MAX_LENGTH: 50000;
    readonly URL_MAX_LENGTH: 2000;
};
export interface CsrfTokenResponse {
    csrfToken: string;
}
//# sourceMappingURL=index.d.ts.map