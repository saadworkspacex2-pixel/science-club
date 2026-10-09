import { sql } from "drizzle-orm";
import { achievements, members } from "@/db/schema";
import type { AchievementParticipant } from "@/lib/achievement-participant-config";
import type { MemberCertificate } from "@/lib/member-certificates";

/**
 * These projections can read both pre-migration and post-migration databases.
 * JSON conversion makes an absent additive column evaluate to null instead of
 * making PostgreSQL reject the whole SELECT.
 */
export const achievementCompatibleSelection = {
  id: achievements.id,
  title: achievements.title,
  subtitle: achievements.subtitle,
  coverImage: achievements.coverImage,
  eventName: achievements.eventName,
  organizerInfo: sql<string>`COALESCE(to_jsonb(${achievements}) ->> 'organizer_info', '')`,
  olympiadWebsite: sql<string>`COALESCE(to_jsonb(${achievements}) ->> 'olympiad_website', '')`,
  mapEmbedUrl: sql<string>`COALESCE(to_jsonb(${achievements}) ->> 'map_embed_url', '')`,
  location: achievements.location,
  date: achievements.date,
  prizes: achievements.prizes,
  medals: achievements.medals,
  description: achievements.description,
  photos: achievements.photos,
  participants: sql<AchievementParticipant[]>`COALESCE(to_jsonb(${achievements}) -> 'participants', '[]'::jsonb)`,
  seoTitle: sql<string>`COALESCE(to_jsonb(${achievements}) ->> 'seo_title', '')`,
  seoDescription: sql<string>`COALESCE(to_jsonb(${achievements}) ->> 'seo_description', '')`,
  featured: achievements.featured,
  sortOrder: achievements.sortOrder,
};

export const memberCompatibleSelection = {
  id: members.id,
  name: members.name,
  className: members.className,
  section: members.section,
  roll: members.roll,
  role: members.role,
  photoUrl: members.photoUrl,
  bio: members.bio,
  achievements: members.achievements,
  participations: members.participations,
  certificates: sql<MemberCertificate[]>`COALESCE(to_jsonb(${members}) -> 'certificates', '[]'::jsonb)`,
  seoTitle: sql<string>`COALESCE(to_jsonb(${members}) ->> 'seo_title', '')`,
  seoDescription: sql<string>`COALESCE(to_jsonb(${members}) ->> 'seo_description', '')`,
  whatsapp: members.whatsapp,
  facebook: members.facebook,
  instagram: members.instagram,
  isLeadership: members.isLeadership,
  featured: members.featured,
  active: members.active,
  sortOrder: members.sortOrder,
};

export const memberCertificateCompatibleSelection = {
  id: members.id,
  certificates: sql<MemberCertificate[]>`COALESCE(to_jsonb(${members}) -> 'certificates', '[]'::jsonb)`,
};

export const memberCardCompatibleSelection = {
  id: members.id,
  name: members.name,
  role: members.role,
  className: members.className,
  section: members.section,
  roll: members.roll,
  photoUrl: members.photoUrl,
  isLeadership: members.isLeadership,
};
