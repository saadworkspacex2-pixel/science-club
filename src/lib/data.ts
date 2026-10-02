import { cache } from "react";
import { db } from "@/db";
import * as s from "@/db/schema";
import { asc, desc, eq as eq2 } from "drizzle-orm";

export type SettingsMap = Record<string, string>;

export const getSettings = cache(async (): Promise<SettingsMap> => {
  const rows = await db.select().from(s.settings);
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
});

export const getSlides = cache(async () =>
  db.select().from(s.slides).orderBy(asc(s.slides.sortOrder), asc(s.slides.id))
);

export const getMembers = cache(async () =>
  db.select().from(s.members).orderBy(asc(s.members.sortOrder), asc(s.members.id))
);

export const getAchievements = cache(async () =>
  db.select().from(s.achievements).orderBy(asc(s.achievements.sortOrder), asc(s.achievements.id))
);

export const getProjects = cache(async () =>
  db.select().from(s.projects).orderBy(asc(s.projects.sortOrder), asc(s.projects.id))
);

export const getGallery = cache(async () =>
  db.select().from(s.galleryItems).orderBy(asc(s.galleryItems.sortOrder), asc(s.galleryItems.id))
);

export const getHallOfFame = cache(async () =>
  db.select().from(s.hallOfFame).orderBy(asc(s.hallOfFame.sortOrder), asc(s.hallOfFame.id))
);

export const getSponsors = cache(async () =>
  db.select().from(s.sponsors).orderBy(asc(s.sponsors.sortOrder), asc(s.sponsors.id))
);

export const getNews = cache(async () =>
  db.select().from(s.news).where(eq2(s.news.isInternal, false)).orderBy(desc(s.news.createdAt), desc(s.news.id))
);

export const getInternalNews = cache(async () =>
  db.select().from(s.news).where(eq2(s.news.isInternal, true)).orderBy(desc(s.news.createdAt), desc(s.news.id))
);

export const getEvents = cache(async () =>
  db.select().from(s.events).orderBy(asc(s.events.sortOrder), asc(s.events.id))
);

export const getResources = cache(async () =>
  db.select().from(s.resources).orderBy(desc(s.resources.createdAt), desc(s.resources.id))
);
