/* Server-side mapping of admin entity slugs to drizzle tables */
import { desc, type Column, type SQL } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import * as s from "@/db/schema";

export interface ServerEntity {
  table: PgTable & { id: Column };
  order?: Column | SQL<unknown>;
  writable: string[];
  ints?: string[];
  bools?: string[];
  search?: Column[];
  special?: "users";
}

export const ENTITY_MAP: Record<string, ServerEntity> = {
  slides: {
    table: s.slides as unknown as PgTable & { id: Column },
    order: s.slides.sortOrder,
    writable: ["imageUrl", "imageUrlMobile", "logoUrl", "tag", "title", "subtitle", "active", "sortOrder"],
    bools: ["active"],
    ints: ["sortOrder"],
    search: [s.slides.title],
  },
  achievements: {
    table: s.achievements as unknown as PgTable & { id: Column },
    order: s.achievements.sortOrder,
    writable: ["title", "subtitle", "coverImage", "eventName", "organizerInfo", "olympiadWebsite", "mapEmbedUrl", "location", "date", "prizes", "medals", "description", "photos", "participants", "featured", "sortOrder"],
    ints: ["prizes", "medals", "sortOrder"],
    bools: ["featured"],
    search: [s.achievements.title, s.achievements.location, s.achievements.eventName],
  },
  members: {
    table: s.members as unknown as PgTable & { id: Column },
    order: s.members.sortOrder,
    writable: ["name", "role", "className", "section", "roll", "photoUrl", "bio", "achievements", "participations", "certificates", "whatsapp", "facebook", "instagram", "isLeadership", "featured", "active", "sortOrder"],
    ints: ["sortOrder"],
    bools: ["isLeadership", "featured", "active"],
    search: [s.members.name, s.members.role],
  },
  gallery: {
    table: s.galleryItems as unknown as PgTable & { id: Column },
    order: s.galleryItems.sortOrder,
    writable: ["kind", "url", "category", "title", "sortOrder"],
    ints: ["sortOrder"],
    search: [s.galleryItems.title],
  },
  projects: {
    table: s.projects as unknown as PgTable & { id: Column },
    order: s.projects.sortOrder,
    writable: ["title", "imageUrl", "summary", "description", "status", "successes", "failures", "futurePlans", "date", "featured", "sortOrder"],
    ints: ["sortOrder"],
    bools: ["featured"],
    search: [s.projects.title],
  },
  "hall-of-fame": {
    table: s.hallOfFame as unknown as PgTable & { id: Column },
    order: s.hallOfFame.sortOrder,
    writable: ["name", "photoUrl", "award", "year", "description", "sortOrder"],
    ints: ["sortOrder"],
    search: [s.hallOfFame.name, s.hallOfFame.award],
  },
  sponsors: {
    table: s.sponsors as unknown as PgTable & { id: Column },
    order: s.sponsors.sortOrder,
    writable: ["name", "logoUrl", "tagline", "website", "sortOrder"],
    ints: ["sortOrder"],
    search: [s.sponsors.name],
  },
  resources: {
    table: s.resources as unknown as PgTable & { id: Column },
    order: desc(s.resources.createdAt),
    writable: ["title", "description", "category", "fileUrl", "externalUrl"],
    search: [s.resources.title],
  },
  news: {
    table: s.news as unknown as PgTable & { id: Column },
    order: desc(s.news.createdAt),
    writable: ["title", "body", "mediaUrl", "mediaKind", "tag", "published", "isInternal"],
    bools: ["published", "isInternal"],
    search: [s.news.title],
  },
  events: {
    table: s.events as unknown as PgTable & { id: Column },
    order: s.events.sortOrder,
    writable: ["title", "description", "date", "location", "imageUrl", "sortOrder"],
    ints: ["sortOrder"],
    search: [s.events.title],
  },
  applications: {
    table: s.applications as unknown as PgTable & { id: Column },
    order: desc(s.applications.createdAt),
    writable: ["status", "note"],
    search: [s.applications.fullName, s.applications.school],
  },
  messages: {
    table: s.messages as unknown as PgTable & { id: Column },
    order: desc(s.messages.createdAt),
    writable: [],
    search: [s.messages.name],
  },
  users: {
    table: s.users as unknown as PgTable & { id: Column },
    order: s.users.id,
    writable: ["username", "name", "role", "memberId", "active"],
    ints: ["memberId"],
    bools: ["active"],
    search: [s.users.username, s.users.name],
    special: "users",
  },
};
