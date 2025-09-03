// Typed models for Learn section (use `type` per user preference)

export type Level = 'beginner' | 'intermediate' | 'advanced';

export type LearningJourney = {
  _id: string;
  slug: string;
  title: string;
  description?: string;
  cover_image?: string; // URL (can be Google Drive link)
  level?: Level;
  order?: number;
  estimated_hours?: number;
  tags?: string[];
  prerequisites?: string[];
  sebi_topics?: string[];
  outcomes?: (LearningOutcome | string)[];
  status?: string;
  // Aggregated
  lesson_count?: number;
  avg_lesson_duration?: number | null;
};

export type Lesson = {
  _id: string;
  slug: string;
  journey_id: string; // equals learning_journeys.slug
  title: string;
  subtitle?: string;
  unit?: string;
  estimated_minutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  order: number;
  learning_objectives?: string[];
  prerequisites?: string[];
  tags?: string[];
  anchors?: string[]; // anchor IDs
  voice_ready?: boolean;
  voice_script_id?: string | null;
  metadata?: Record<string, unknown> & { review_status?: string };
  // Aggregated / optional
  journey_title?: string;
  journey_level?: Level;
  content_blocks?: ContentBlock[];
  anchor_details?: Anchor[];
};

export type BlockType =
  | 'concept'
  | 'example'
  | 'interactive'
  | 'quiz'
  | 'reflection'
  | 'callout';

export type ContentBlockBase = {
  _id: string;
  lesson_id: string; // equals parent lesson slug
  order: number;
  type: BlockType;
  anchor_ids?: string[]; // equals anchors._id
};

export type ConceptPayload = {
  heading: string;
  rich_text_md: string;
  image_key?: string | null;
  key_terms?: string[];
  sebi_context?: string;
};

export type ExamplePayload = {
  scenario_title: string;
  scenario_md: string;
  qa_pairs?: { question: string; answer: string }[];
  indian_context?: boolean;
};

export type InteractivePayload = {
  widget_kind: string;
  widget_config?: {
    title: string;
    description?: string;
    parameters?: string[];
    default_values?: string[];
  };
  instructions_md?: string;
  expected_outcomes?: string[];
  scoring_rubric?: { criteria?: string[]; scoring_method?: string; passing_threshold?: string };
  fallback_content?: string;
};

export type QuizItem = {
  stem: string;
  choices: { text: string; correct: boolean; explanation: string }[];
  rationale?: string;
  anchor_ids?: string[];
  difficulty?: string;
};

export type QuizPayload = {
  quiz_type: string;
  items: QuizItem[];
  pass_threshold: number; // percent threshold (0-100)
};

export type ReflectionPayload = {
  prompt_md: string;
  guidance_md?: string;
  min_chars?: number;
  reflection_type?: string;
  sample_responses?: string[];
};

export type CalloutPayload = {
  style: 'warning' | 'info' | 'compliance' | 'tip' | 'sebi_guideline';
  title: string;
  text_md: string;
};

export type ContentBlock =
  | (ContentBlockBase & { type: 'concept'; payload: ConceptPayload })
  | (ContentBlockBase & { type: 'example'; payload: ExamplePayload })
  | (ContentBlockBase & { type: 'interactive'; payload: InteractivePayload })
  | (ContentBlockBase & { type: 'quiz'; payload: QuizPayload })
  | (ContentBlockBase & { type: 'reflection'; payload: ReflectionPayload })
  | (ContentBlockBase & { type: 'callout'; payload: CalloutPayload });

export type LearningOutcome = {
  outcome: string;
  assessment_criteria?: string[];
  anchor_ids?: string[];
};

export type Anchor = {
  _id: string; // <lesson_slug>::<short_label>
  source_type?: string; // e.g., SEBI_PDF
  source_url?: string;
  relevance_tags?: string[];
  confidence_score?: number;
  last_verified_at?: string; // ISO datetime
  // Optional rich fields (present in some sources)
  title?: string;
  short_label?: string;
  excerpt?: string;
  document_title?: string;
  section?: string;
  created_at?: string;
  // Aggregated
  usage_count?: number;
  used_in_lessons?: string[];
};
