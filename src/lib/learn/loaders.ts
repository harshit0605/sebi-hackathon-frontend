import 'server-only';
import { getDb } from './mongo';
import type { Anchor, ContentBlock, LearningJourney, Lesson } from './types';
import { promises as fs } from 'fs';
import path from 'path';
import type { Guide, GuideContentVariant, GuideSourceType } from './guides';
import { ObjectId } from 'mongodb';

// Filters for anchors fetch (kept minimal, extend as needed)
export type AnchorFilters = {
  source_type?: string;
  min_confidence?: number;
  relevance_tags?: string[];
};

// Normalize Mongo ObjectId to string
function toPlainId<T extends { _id?: unknown }>(doc: T): T {
  if (!doc) return doc;
  try {
    const anyDoc: any = doc as any;
    if (anyDoc && anyDoc._id != null) {
      return { ...anyDoc, _id: String(anyDoc._id) } as T;
    }
    return doc;
  } catch {
    return doc;
  }
}

export async function fetchAnchors(filters: AnchorFilters = {}): Promise<Anchor[]> {
  const db = await getDb();
  const query: any = {};
  if (filters.source_type) query.source_type = filters.source_type;
  if (filters.min_confidence != null) query.confidence_score = { $gte: filters.min_confidence };
  if (filters.relevance_tags?.length) query.relevance_tags = { $in: filters.relevance_tags };

  const docs = await db.collection('anchors').find(query).limit(200).toArray();
  const normalized: Anchor[] = (docs as any[]).map((d) => toPlainId(d as any)) as Anchor[];
  return normalized;
}

// Basic journeys fetch for catalog (sorted by curated order)
export async function fetchJourneys(): Promise<LearningJourney[]> {
  const db = await getDb();
  const collectionName = process.env.MONGODB_JOURNEYS_COLLECTION || 'learning_journeys';
  const lessonsCollection = process.env.MONGODB_LESSONS_COLLECTION || 'lessons';

  const docs = await db.collection(collectionName).find({}).sort({ order: 1 }).limit(200).toArray();

  // Prepare keys
  const ids = docs.map((d: any) => d?._id).filter(Boolean);
  const idStrs = ids.map((x: any) => String(x));
  const slugs = docs.map((d: any) => d?.slug).filter(Boolean);

  type AggRow = { _id: any; count: number; avg: number };
  let byId: AggRow[] = [];
  let byIdStr: AggRow[] = [];
  let bySlug1: AggRow[] = [];
  let bySlug2: AggRow[] = [];

  try {
    if (ids.length) {
      byId = await db
        .collection(lessonsCollection)
        .aggregate<AggRow>([
          { $match: { $or: [{ journey_id: { $in: ids } }, { journeyId: { $in: ids } }] } },
          { $group: { _id: { $ifNull: ['$journey_id', '$journeyId'] }, count: { $sum: 1 }, avg: { $avg: '$estimated_minutes' } } },
        ])
        .toArray();
    }
  } catch {}
  try {
    if (idStrs.length) {
      byIdStr = await db
        .collection(lessonsCollection)
        .aggregate<AggRow>([
          { $match: { $or: [{ journey_id: { $in: idStrs } }, { journeyId: { $in: idStrs } }] } },
          { $group: { _id: { $ifNull: ['$journey_id', '$journeyId'] }, count: { $sum: 1 }, avg: { $avg: '$estimated_minutes' } } },
        ])
        .toArray();
    }
  } catch {}
  try {
    if (slugs.length) {
      bySlug1 = await db
        .collection(lessonsCollection)
        .aggregate<AggRow>([
          { $match: { journey_slug: { $in: slugs } } },
          { $group: { _id: '$journey_slug', count: { $sum: 1 }, avg: { $avg: '$estimated_minutes' } } },
        ])
        .toArray();
      bySlug2 = await db
        .collection(lessonsCollection)
        .aggregate<AggRow>([
          { $match: { journey: { $in: slugs } } },
          { $group: { _id: '$journey', count: { $sum: 1 }, avg: { $avg: '$estimated_minutes' } } },
        ])
        .toArray();
    }
  } catch {}

  const mapById = new Map<string, { count: number; avg: number }>();
  for (const r of byId) mapById.set(String(r._id), { count: r.count, avg: r.avg });
  for (const r of byIdStr) mapById.set(String(r._id), { count: r.count, avg: r.avg });
  const mapBySlug = new Map<string, { count: number; avg: number }>();
  for (const r of bySlug1) mapBySlug.set(String(r._id), { count: r.count, avg: r.avg });
  for (const r of bySlug2) mapBySlug.set(String(r._id), { count: r.count, avg: r.avg });

  const normalized: LearningJourney[] = (docs as any[]).map((d) => {
    const idKey = String(d._id);
    const slugKey = String(d.slug ?? '');
    const agg = mapById.get(idKey) ?? mapBySlug.get(slugKey);
    const lesson_count = agg?.count ?? 0;
    const avg_lesson_duration = typeof agg?.avg === 'number' ? Math.round(agg!.avg) : null;
    return { ...(toPlainId(d) as any), lesson_count, avg_lesson_duration } as unknown as LearningJourney;
  });
  return normalized;
}

// Fetch a single Journey by slug
export async function fetchJourneyBySlug(slug: string): Promise<LearningJourney | null> {
  const db = await getDb();
  const collectionName = process.env.MONGODB_JOURNEYS_COLLECTION || 'learning_journeys';
  const lessonsCollection = process.env.MONGODB_LESSONS_COLLECTION || 'lessons';

  const doc = await db.collection(collectionName).findOne({ slug });
  if (!doc) return null;

  // Aggregate lessons for this journey (prefer ObjectId match on journey_id)
  let count = 0;
  let avg: number | null = null;
  try {
    const byId = await db
      .collection(lessonsCollection)
      .aggregate([
        { $match: { $or: [
          { journey_id: doc._id },
          { journeyId: doc._id },
          { journey_id: String(doc._id) },
          { journeyId: String(doc._id) },
        ] } },
        { $group: { _id: null, count: { $sum: 1 }, avg: { $avg: '$estimated_minutes' } } },
      ])
      .toArray();
    if (byId[0]) {
      count = byId[0].count ?? 0;
      avg = typeof byId[0].avg === 'number' ? Math.round(byId[0].avg) : null;
    }
  } catch {}
  if (count === 0) {
    try {
      const bySlug = await db
        .collection(lessonsCollection)
        .aggregate([
          { $match: { $or: [ { journey_slug: slug }, { journey: slug } ] } },
          { $group: { _id: null, count: { $sum: 1 }, avg: { $avg: '$estimated_minutes' } } },
        ])
        .toArray();
      if (bySlug[0]) {
        count = bySlug[0].count ?? 0;
        avg = typeof bySlug[0].avg === 'number' ? Math.round(bySlug[0].avg) : null;
      }
    } catch {}
  }

  const out = toPlainId(doc) as unknown as LearningJourney;
  (out as any).lesson_count = count;
  (out as any).avg_lesson_duration = avg;
  return out;
}

// Fetch lessons that belong to a journey. Optionally hydrate content blocks.
export async function fetchLessonsByJourney(journeySlug: string, includeBlocks: boolean = false): Promise<Lesson[]> {
  const db = await getDb();
  const lessonsCollection = process.env.MONGODB_LESSONS_COLLECTION || 'lessons';

  // Build a robust OR query to match various schema variants
  const ors: any[] = [
    { journey_id: journeySlug },
    { journey_slug: journeySlug },
    { journey: journeySlug },
    { journeyId: journeySlug },
  ];

  // If caller passed a 24-char hex (likely a journey ObjectId), include direct ObjectId matches
  if (typeof journeySlug === 'string' && /^[a-fA-F0-9]{24}$/.test(journeySlug)) {
    try {
      const asOid = new ObjectId(journeySlug);
      ors.push({ journey_id: asOid }, { journeyId: asOid }, { journey: asOid });
    } catch { /* ignore */ }
  }

  // If a journey with this slug exists, also try matching by its ObjectId and stringified id
  try {
    const journeysCollection = process.env.MONGODB_JOURNEYS_COLLECTION || 'learning_journeys';
    const jdoc = await db.collection(journeysCollection).findOne({ slug: journeySlug }, { projection: { _id: 1 } });
    const jid = jdoc?._id;
    if (jid) {
      // 1) Primary fast path: exact match on ObjectId
      let primaryDocs: any[] = [];
      try {
        primaryDocs = await db
          .collection(lessonsCollection)
          .find({ journey_id: jid })
          .sort({ order: 1 })
          .limit(500)
          .toArray();
      } catch { /* ignore */ }
      if (primaryDocs.length) {
        const lessons = (primaryDocs as any[]).map((d) => toPlainId(d as any)) as Lesson[];
        if (!includeBlocks || lessons.length === 0) return lessons;
        // continue below to hydrate blocks
      }

      // 2) Add broader ObjectId/string variants to OR
      ors.push(
        { journey_id: jid },
        { journeyId: jid },
        { journey: jid },
        { journey_id: String(jid) },
        { journeyId: String(jid) },
        { journey: String(jid) },
      );
    }
  } catch { /* ignore */ }

  let docs: any[] = [];
  try {
    docs = await db
      .collection(lessonsCollection)
      .find({ $or: ors })
      .sort({ order: 1 })
      .limit(500)
      .toArray();
  } catch { docs = []; }

  let lessons = (docs as any[]).map((d) => toPlainId(d as any)) as Lesson[];

  // If nothing found, try alternative collections and auto-detect names containing "lesson"
  if (lessons.length === 0) {
    try {
      const altCandidates = Array.from(
        new Set([
          process.env.MONGODB_LESSONS_COLLECTION || 'lessons',
          'learning_lessons',
          'journey_lessons',
          'module_lessons',
          'course_lessons',
        ]),
      );
      const existing = await db.listCollections({}, { nameOnly: true }).toArray();
      const nameSet = new Set(existing.map((c: any) => c.name));
      const detected = existing
        .map((c: any) => String(c.name))
        .filter((n: string) => /lesson/i.test(n));
      for (const cand of [...altCandidates, ...detected]) {
        if (!nameSet.has(cand)) continue;
        const fallbackDocs = await db
          .collection(cand)
          .find({ $or: ors })
          .sort({ order: 1 })
          .limit(500)
          .toArray();
        if (fallbackDocs.length) {
          lessons = (fallbackDocs as any[]).map((d) => toPlainId(d as any)) as Lesson[];
          break;
        }
      }
    } catch {
      // ignore fallback errors
    }
  }

  if (!includeBlocks || lessons.length === 0) return lessons;

  // Hydrate content blocks (support multiple reference field names)
  const blocksCollection = process.env.MONGODB_CONTENT_BLOCKS_COLLECTION || 'content_blocks';
  const slugs = lessons.map((l) => l.slug).filter(Boolean);
  const ids = lessons.map((l) => l._id).filter(Boolean);
  const oidIds: ObjectId[] = [];
  for (const id of ids) {
    if (typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id)) {
      try { oidIds.push(new ObjectId(id)); } catch { /* ignore */ }
    }
  }
  const blockDocs = await db
    .collection(blocksCollection)
    .find({
      $or: [
        { lesson_id: { $in: slugs } },
        { lesson_slug: { $in: slugs } },
        { lessonId: { $in: slugs } },
        { lesson: { $in: slugs } },
        ...(oidIds.length ? [
          { lesson_id: { $in: oidIds } },
          { lessonId: { $in: oidIds } },
          { lesson: { $in: oidIds } },
        ] : []),
      ],
    })
    .sort({ order: 1 })
    .limit(2000)
    .toArray();

  const blocks: ContentBlock[] = (blockDocs as any[])
    .map((b) => toPlainId(b as any)) as unknown as ContentBlock[];

  const grouped: Record<string, ContentBlock[]> = {};
  for (const b of blocks) {
    const bb = b;
    const rawKey = (b as any)?.lesson_id ?? (b as any)?.lesson_slug ?? (b as any)?.lessonId ?? (b as any)?.lesson;
    const key = rawKey != null ? String(rawKey) : undefined;
    if (!key) continue;
    (grouped[key] ||= []).push(bb);
  }

  lessons = lessons.map((l) => ({
    ...l,
    content_blocks: ((grouped[l.slug] ?? grouped[l._id] ?? []) as ContentBlock[]).sort(
      (a, b) =>
        Number(
          (a as any)?.order ??
          (a as any)?.metadata?.order ??
          (a as any)?.payload?.order ??
          (a as any)?.sequence ??
          (a as any)?.position ??
          (a as any)?.index ??
          0
        ) -
        Number(
          (b as any)?.order ??
          (b as any)?.metadata?.order ??
          (b as any)?.payload?.order ??
          (b as any)?.sequence ??
          (b as any)?.position ??
          (b as any)?.index ??
          0
        )
    ),
  }));
  return lessons;
}

// Fetch a single lesson by slug (or id). Optionally hydrate content blocks.
export async function fetchLessonBySlug(slug: string, includeBlocks: boolean = false): Promise<Lesson | null> {
  const db = await getDb();
  const lessonsCollection = process.env.MONGODB_LESSONS_COLLECTION || 'lessons';

  const ors: any[] = [{ slug }, { _id: slug }, { id: slug }];
  if (typeof slug === 'string' && /^[a-fA-F0-9]{24}$/.test(slug)) {
    try { ors.push({ _id: new ObjectId(slug) }); } catch { /* ignore */ }
  }

  const raw = await db.collection(lessonsCollection).findOne({ $or: ors });
  if (!raw) return null;
  let lesson = toPlainId(raw) as unknown as Lesson;

  if (!includeBlocks) return lesson;

  const blocksCollection = process.env.MONGODB_CONTENT_BLOCKS_COLLECTION || 'content_blocks';
  const keys = [lesson.slug, lesson._id].filter(Boolean) as string[];
  const oidKeys: ObjectId[] = [];
  if (lesson._id && /^[a-fA-F0-9]{24}$/.test(lesson._id)) {
    try { oidKeys.push(new ObjectId(lesson._id)); } catch { /* ignore */ }
  }
  const blockDocs = await db
    .collection(blocksCollection)
    .find({
      $or: [
        { lesson_id: { $in: keys } },
        { lesson_slug: { $in: keys } },
        { lessonId: { $in: keys } },
        { lesson: { $in: keys } },
        ...(oidKeys.length ? [
          { lesson_id: { $in: oidKeys } },
          { lessonId: { $in: oidKeys } },
          { lesson: { $in: oidKeys } },
        ] : []),
      ],
    })
    .sort({ order: 1 })
    .limit(2000)
    .toArray();

  const blocks: ContentBlock[] = (blockDocs as any[])
    .map((b) => toPlainId(b as any)) as unknown as ContentBlock[];

  const sortedBlocks: ContentBlock[] = [...blocks].sort(
    (a, b) =>
      Number(
        (a as any)?.order ??
        (a as any)?.metadata?.order ??
        (a as any)?.payload?.order ??
        (a as any)?.sequence ??
        (a as any)?.position ??
        (a as any)?.index ??
        0
      ) -
      Number(
        (b as any)?.order ??
        (b as any)?.metadata?.order ??
        (b as any)?.payload?.order ??
        (b as any)?.sequence ??
        (b as any)?.position ??
        (b as any)?.index ??
        0
      )
  );

  // Hydrate anchors for this lesson
  const anchorsCollection = process.env.MONGODB_ANCHORS_COLLECTION || 'anchors';
  const blockIdKeys = blocks.map((b) => String((b as any)?._id)).filter(Boolean);
  const oidBlockIds: ObjectId[] = [];
  for (const bid of blockIdKeys) {
    if (/^[a-fA-F0-9]{24}$/.test(bid)) {
      try { oidBlockIds.push(new ObjectId(bid)); } catch { /* ignore */ }
    }
  }
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const anchorOr: any[] = [
    { lesson_id: { $in: keys } },
    { lessonId: { $in: keys } },
    { lesson_slug: { $in: keys } },
    { lesson: { $in: keys } },
  ];
  if (lesson.slug) {
    // match beginning with slug:: OR containing slug anywhere
    anchorOr.push({ short_label: { $regex: `^${esc(lesson.slug)}::`, $options: 'i' } });
    anchorOr.push({ short_label: { $regex: `${esc(lesson.slug)}`, $options: 'i' } });
    anchorOr.push({ title: { $regex: `${esc(lesson.slug)}`, $options: 'i' } });
  }
  // Resolve explicit anchor_ids from lesson and blocks
  const anchorIdSet = new Set<string>(Array.isArray((lesson as any).anchors) ? ((lesson as any).anchors as any[]).map(String) : []);
  for (const b of blocks) {
    const ids = (b as any)?.anchor_ids as any[] | undefined;
    if (ids) ids.forEach((x) => anchorIdSet.add(String(x)));
    if ((b as any)?.type === 'quiz') {
      const items = (b as any)?.payload?.items as any[] | undefined;
      if (items) items.forEach((q) => (q?.anchor_ids ?? []).forEach((x: any) => anchorIdSet.add(String(x))));
    }
  }
  const anchorIdList = Array.from(anchorIdSet);
  const oidAnchorIds: ObjectId[] = [];
  for (const aid of anchorIdList) {
    if (/^[a-fA-F0-9]{24}$/.test(aid)) {
      try { oidAnchorIds.push(new ObjectId(aid)); } catch { /* ignore */ }
    }
  }
  if (anchorIdList.length) anchorOr.push({ _id: { $in: anchorIdList } });
  if (oidAnchorIds.length) anchorOr.push({ _id: { $in: oidAnchorIds } });
  if (blockIdKeys.length) {
    anchorOr.push({ content_block_id: { $in: blockIdKeys } });
    anchorOr.push({ block_id: { $in: blockIdKeys } });
  }
  if (oidBlockIds.length) {
    anchorOr.push({ content_block_id: { $in: oidBlockIds } });
    anchorOr.push({ block_id: { $in: oidBlockIds } });
  }
  let anchorDocs = await db.collection(anchorsCollection).find({ $or: anchorOr }).limit(2000).toArray();
  // Fallback to common collection names if env not set or collection empty
  if ((!process.env.MONGODB_ANCHORS_COLLECTION || process.env.MONGODB_ANCHORS_COLLECTION === 'anchors') && anchorDocs.length === 0) {
    const altCollections = ['content_anchors', 'lesson_anchors'];
    for (const alt of altCollections) {
      const r = await db.collection(alt).find({ $or: anchorOr }).limit(2000).toArray();
      if (r.length) { anchorDocs = r; break; }
    }
  }
  // Dedup by _id and prefer most recently verified
  const anchorsRaw = (anchorDocs as any[]).map((a) => toPlainId(a as any));
  const seen = new Set<string>();
  const deduped = anchorsRaw.filter((a: any) => {
    const k = String(a._id);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  const anchors: Anchor[] = (deduped
    .sort((a: any, b: any) => new Date(b?.last_verified_at ?? 0).getTime() - new Date(a?.last_verified_at ?? 0).getTime())
  ) as unknown as Anchor[];

  lesson = { ...lesson, content_blocks: sortedBlocks, anchor_details: anchors };
  return lesson;
}

 // ===== Filesystem-based JSON loaders for Official Guides =====
 const DATA_DIR = path.join(process.cwd(), 'data');
 const GUIDE_FILES = ['guides_collection_1.json', 'guides_collection_2.json'];

async function readJsonFile<T = any>(relPath: string): Promise<T | null> {
  try {
    const filePath = path.isAbsolute(relPath) ? relPath : path.join(DATA_DIR, relPath);
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function mapVariant(v: any): GuideContentVariant | null {
  const lang = v?.language;
  if (lang !== 'en' && lang !== 'hi') return null;
  const out: GuideContentVariant = {
    language: lang,
    title: typeof v.title === 'string' ? v.title : undefined,
    summary: typeof v.summary === 'string' ? v.summary : undefined,
    tags: Array.isArray(v.tags) ? v.tags.filter((t: any) => typeof t === 'string') : undefined,
    mindmap_url: typeof v.mindmap_url === 'string' ? v.mindmap_url : undefined,
    audio_url: typeof v.audio_url === 'string' ? v.audio_url : undefined,
    video_url: typeof v.video_url === 'string' ? v.video_url : undefined,
    study_guide_url: typeof v.study_guide_url === 'string' ? v.study_guide_url : undefined,
    study_markdown: typeof v.study_markdown === 'string' ? v.study_markdown : undefined,
  };
  return out;
}

function mapGuide(raw: any): Guide | null {
  if (!raw || typeof raw !== 'object') return null;
  const variants = Array.isArray(raw.variants) ? raw.variants.map(mapVariant).filter(Boolean) as GuideContentVariant[] : [];
  if (!raw.id || !raw.source_type || !raw.source_url || variants.length === 0) return null;
  const st = String(raw.source_type) as GuideSourceType;
  const source_type: GuideSourceType = st === 'pdf' || st === 'video' || st === 'audio' ? st : 'pdf';
  const guide: Guide = {
    id: String(raw.id),
    source_type,
    source_url: String(raw.source_url),
    cover_image: typeof raw.cover_image === 'string' ? raw.cover_image : undefined,
    duration_minutes: typeof raw.duration_minutes === 'number' ? raw.duration_minutes : undefined,
    published: typeof raw.published === 'boolean' ? raw.published : undefined,
    title: typeof raw.title === 'string' ? raw.title : undefined,
    summary: typeof raw.summary === 'string' ? raw.summary : undefined,
    tags: Array.isArray(raw.tags) ? raw.tags.filter((t: any) => typeof t === 'string') : undefined,
    variants,
  };
  return guide;
}

export async function fetchOfficialGuidesFromJson(): Promise<Guide[]> {
  const raws = await Promise.all(GUIDE_FILES.map((f) => readJsonFile<any>(f)));
  const guides = raws
    .map((r) => mapGuide(r))
    .filter((g): g is Guide => Boolean(g))
    .filter((g) => g.published !== false); // default include unless explicitly false
  return guides;
}

export async function fetchGuideByIdFromJson(id: string): Promise<Guide | null> {
  const all = await fetchOfficialGuidesFromJson();
  return all.find((g) => g.id === id) ?? null;
}

// ===== MongoDB-based loaders for Official Guides =====
function normalizeId(raw: any): string | null {
  if (!raw) return null;
  const id = raw.id ?? raw._id;
  if (id == null) return null;
  try {
    return typeof id === 'object' && 'toString' in id ? String(id) : String(id);
  } catch {
    return null;
  }
}

function mapGuideFromDb(raw: any): Guide | null {
  if (!raw || typeof raw !== 'object') return null;
  const id = normalizeId(raw);
  const st = String(raw.source_type || '').toLowerCase() as GuideSourceType;
  const source_type: GuideSourceType = st === 'pdf' || st === 'video' || st === 'audio' ? st : 'pdf';

  // Build variants from either raw.variants or language-scoped/root-level fields
  let variants: GuideContentVariant[] = [];
  if (Array.isArray(raw.variants) && raw.variants.length > 0) {
    variants = (raw.variants as any[]).map(mapVariant).filter(Boolean) as GuideContentVariant[];
  } else {
    const langs: Array<'en' | 'hi'> = ['en', 'hi'];
    variants = langs
      .map((lang) => {
        const lv = (raw as any)?.[lang] ?? {};
        const v: GuideContentVariant = {
          language: lang,
          title: typeof lv.title === 'string' ? lv.title : typeof raw.title === 'string' ? raw.title : undefined,
          summary: typeof lv.summary === 'string' ? lv.summary : typeof raw.summary === 'string' ? raw.summary : undefined,
          tags: Array.isArray(lv.tags) ? lv.tags.filter((t: any) => typeof t === 'string') : Array.isArray(raw.tags) ? raw.tags.filter((t: any) => typeof t === 'string') : undefined,
          mindmap_url: typeof lv.mindmap_url === 'string' ? lv.mindmap_url : typeof raw.mindmap_url === 'string' ? raw.mindmap_url : undefined,
          audio_url: typeof lv.audio_url === 'string' ? lv.audio_url : typeof raw.audio_url === 'string' ? raw.audio_url : undefined,
          video_url: typeof lv.video_url === 'string' ? lv.video_url : typeof raw.video_url === 'string' ? raw.video_url : undefined,
          study_guide_url: typeof lv.study_guide_url === 'string' ? lv.study_guide_url : typeof raw.study_guide_url === 'string' ? raw.study_guide_url : undefined,
          study_markdown: typeof lv.study_markdown === 'string' ? lv.study_markdown : typeof raw.study_markdown === 'string' ? raw.study_markdown : undefined,
        };
        // Only keep if at least some meaningful content exists
        const hasAny = v.title || v.summary || v.tags?.length || v.mindmap_url || v.audio_url || v.video_url || v.study_guide_url || v.study_markdown;
        return hasAny ? v : null;
      })
      .filter(Boolean) as GuideContentVariant[];

    // If still empty but root-level fields exist, create a minimal EN variant
    if (variants.length === 0) {
      const v: GuideContentVariant = {
        language: 'en',
        title: typeof raw.title === 'string' ? raw.title : undefined,
        summary: typeof raw.summary === 'string' ? raw.summary : undefined,
        tags: Array.isArray(raw.tags) ? raw.tags.filter((t: any) => typeof t === 'string') : undefined,
        mindmap_url: typeof raw.mindmap_url === 'string' ? raw.mindmap_url : undefined,
        audio_url: typeof raw.audio_url === 'string' ? raw.audio_url : undefined,
        video_url: typeof raw.video_url === 'string' ? raw.video_url : undefined,
        study_guide_url: typeof raw.study_guide_url === 'string' ? raw.study_guide_url : undefined,
        study_markdown: typeof raw.study_markdown === 'string' ? raw.study_markdown : undefined,
      };
      const hasAny = v.title || v.summary || v.tags?.length || v.mindmap_url || v.audio_url || v.video_url || v.study_guide_url || v.study_markdown;
      if (hasAny) variants = [v];
    }
  }

  if (!id || !source_type || !raw.source_url || variants.length === 0) return null;
  return {
    id,
    source_type,
    source_url: String(raw.source_url),
    cover_image: typeof raw.cover_image === 'string' ? raw.cover_image : undefined,
    duration_minutes: typeof raw.duration_minutes === 'number' ? raw.duration_minutes : undefined,
    published: typeof raw.published === 'boolean' ? raw.published : undefined,
    title: typeof raw.title === 'string' ? raw.title : undefined,
    summary: typeof raw.summary === 'string' ? raw.summary : undefined,
    tags: Array.isArray(raw.tags) ? raw.tags.filter((t: any) => typeof t === 'string') : undefined,
    variants,
  } satisfies Guide;
}

export async function fetchOfficialGuidesFromDb(): Promise<Guide[]> {
  const db = await getDb();
  const collectionName = process.env.MONGODB_GUIDES_COLLECTION || 'official_guides';
  const docs = await db
    .collection(collectionName)
    .find({ $or: [{ published: { $exists: false } }, { published: { $ne: false } }] })
    .limit(200)
    .toArray();
  return docs.map(mapGuideFromDb).filter((g): g is Guide => Boolean(g));
}

export async function fetchGuideByIdFromDb(id: string): Promise<Guide | null> {
  const db = await getDb();
  const collectionName = process.env.MONGODB_GUIDES_COLLECTION || 'official_guides';
  const ors: any[] = [{ id }];
  if (typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id)) {
    ors.push({ _id: new ObjectId(id) });
  }
  ors.push({ _id: id }); // also try string _id
  const doc = await db.collection(collectionName).findOne({ $or: ors });
  return mapGuideFromDb(doc);
}
