import { z } from 'zod'

export const CardSchema = z.object({
  id: z.string().min(1),
  trad: z.string().min(1),
  simp: z.string().optional(),
  pinyin: z.string().min(1),
  zhuyin: z.string().optional(),
  pos: z.string().optional(),
  gloss_en: z.string().optional().default(''),
  gloss_de: z.string().optional(),
  band: z.enum(['A', 'B', 'C']),
  level: z.number().int().min(0).max(6),
  topic: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  source: z
    .object({
      name: z.string().optional(),
      url: z.string().optional(),
    })
    .optional(),
  audio: z
    .object({
      url: z.string().optional(),
      voice: z.string().optional(),
      license: z.string().optional(),
    })
    .optional(),
  components: z.array(z.string()).optional(),
  variants: z.array(z.string()).optional(),
  culturalNote: z
    .object({
      title: z.string().optional(),
      note: z.string().optional(),
      sourceUrls: z.array(z.string()).optional(),
    })
    .optional(),
  etymology: z.string().optional(),
  storyIds: z.array(z.string()).optional(),
})

export type CardData = z.infer<typeof CardSchema>

export const StorySchema = z.object({
  id: z.string(),
  band: z.enum(['A', 'B', 'C']),
  level: z.number().int().min(0).max(6),
  bandLabel: z.string().optional(),
  title: z.string(),
  body: z.string(),
  bodySimp: z.string().optional(),
  vocabRefs: z.array(z.string()),
  audioUrl: z.string().optional(),
  cultureRefs: z.array(z.string()).optional(),
  topic: z.string().optional(),
})

export type StoryData = z.infer<typeof StorySchema>

