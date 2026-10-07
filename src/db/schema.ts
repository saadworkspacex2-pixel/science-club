import { sql } from "drizzle-orm";
import type { AchievementParticipant } from "@/lib/achievement-participant-config";
import type { MemberCertificate } from "@/lib/member-certificates";
import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

/* Schema aligned 1:1 with the production Neon database.
   New columns are additive (with defaults) so existing data is preserved. */

export const slides = pgTable("slides", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(), // desktop / tablet (16:9)
  imageUrlMobile: text("image_url_mobile").notNull().default(""), // phone portrait (4:5)
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull().default(""),
  tag: text("tag").notNull().default(""),
  logoUrl: text("logo_url").notNull().default(""), // contest / event logo badge
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull().default(""),
  coverImage: text("cover_image").notNull().default(""),
  eventName: text("event_name").notNull().default(""),
  organizerInfo: text("organizer_info").notNull().default(""),
  olympiadWebsite: text("olympiad_website").notNull().default(""),
  mapEmbedUrl: text("map_embed_url").notNull().default(""),
  location: text("location").notNull().default(""),
  date: text("date").notNull().default(""),
  prizes: integer("prizes").notNull().default(0),
  medals: integer("medals").notNull().default(0),
  description: text("description").notNull().default(""),
  photos: jsonb("photos").notNull().default(sql`'[]'::jsonb`).$type<string[]>(),
  participants: jsonb("participants").notNull().default(sql`'[]'::jsonb`).$type<AchievementParticipant[]>(),
  featured: boolean("featured").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

/** Links achievements to the team members who earned them (many-to-many) */
export const achievementMembers = pgTable("achievement_members", {
  id: serial("id").primaryKey(),
  achievementId: integer("achievement_id").notNull(),
  memberId: integer("member_id").notNull(),
});

export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  className: text("class_name").notNull().default(""),
  section: text("section").notNull().default(""),
  roll: text("roll").notNull().default(""),
  role: text("role").notNull().default("সদস্য"),
  photoUrl: text("photo_url").notNull().default(""),
  bio: text("bio").notNull().default(""),
  achievements: text("achievements").notNull().default(""),
  participations: text("participations").notNull().default(""),
  certificates: jsonb("certificates").notNull().default(sql`'[]'::jsonb`).$type<MemberCertificate[]>(),
  whatsapp: text("whatsapp").notNull().default(""),
  facebook: text("facebook").notNull().default(""),
  instagram: text("instagram").notNull().default(""),
  isLeadership: boolean("is_leadership").notNull().default(false),
  featured: boolean("featured").notNull().default(false),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const galleryItems = pgTable("gallery_items", {
  id: serial("id").primaryKey(),
  kind: text("kind").notNull().default("image"), // image | video
  url: text("url").notNull(),
  category: text("category").notNull().default("school"), // school | team | alumni | events
  title: text("title").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary").notNull().default(""),
  description: text("description").notNull().default(""),
  imageUrl: text("image_url").notNull().default(""),
  status: text("status").notNull().default("ongoing"), // success | ongoing | failed | future
  successes: text("successes").notNull().default(""),
  failures: text("failures").notNull().default(""),
  futurePlans: text("future_plans").notNull().default(""),
  date: text("date").notNull().default(""),
  featured: boolean("featured").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const hallOfFame = pgTable("hall_of_fame", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  photoUrl: text("photo_url").notNull().default(""),
  award: text("award").notNull().default(""),
  year: text("year").notNull().default(""),
  description: text("description").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const sponsors = pgTable("sponsors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  logoUrl: text("logo_url").notNull().default(""),
  tagline: text("tagline").notNull().default(""),
  website: text("website").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull().default("নোট"), // নোট | গাইড | প্রশ্নপত্র | ম্যাগাজিন | লিংক
  fileUrl: text("file_url").notNull().default(""),
  externalUrl: text("external_url").notNull().default(""),
  description: text("description").notNull().default(""),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  school: text("school").notNull(),
  className: text("class_name").notNull(),
  fullName: text("full_name").notNull(),
  classRoll: text("class_roll").notNull(),
  phone: text("phone").notNull(),
  whatsapp: text("whatsapp").notNull().default(""),
  instagram: text("instagram").notNull().default(""),
  status: text("status").notNull().default("pending"), // pending | contacted | accepted | rejected
  note: text("note").notNull().default(""),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull().default(""),
  mediaUrl: text("media_url").notNull().default(""),
  mediaKind: text("media_kind").notNull().default("none"), // none | image | video
  isInternal: boolean("is_internal").notNull().default(false),
  tag: text("tag").notNull().default(""),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  date: text("date").notNull().default(""),
  location: text("location").notNull().default(""),
  description: text("description").notNull().default(""),
  imageUrl: text("image_url").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const memberAccounts = pgTable("member_accounts", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull().default("Admin"),
  role: text("role").notNull().default("editor"), // super_admin | editor | member
  memberId: integer("member_id"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
});

export const siteFiles = pgTable("site_files", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default("file"),
  mime: text("mime").notNull().default("application/octet-stream"),
  size: integer("size").notNull().default(0),
  data: text("data").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().default(""),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});
