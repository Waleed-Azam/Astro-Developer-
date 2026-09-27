/**
 * Content collections — the Astro replacement for Webflow CMS Collections.
 * Webflow "Projects" collection → `projects` · Webflow "Blog Posts" → `journal`.
 * Editors keep writing Markdown; `pnpm` diff shows exactly what changed.
 */
import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    client: z.string(),
    location: z.string(),
    year: z.number(),
    services: z.array(z.string()),
    cover: z.string(),
    coverAlt: z.string(),
    featured: z.boolean().default(false),
    summary: z.string(),
    area: z.string().optional(),
    duration: z.string().optional(),
  }),
});

const journal = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    author: z.string().default('Ingrid Fjord'),
    tags: z.array(z.string()).default([]),
    cover: z.string(),
    coverAlt: z.string(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, journal };
