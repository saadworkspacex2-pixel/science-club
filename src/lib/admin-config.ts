/* Serializable UI config for the admin panel (client-safe) */

export type FieldType =
  | "text"
  | "textarea"
  | "longtext"
  | "number"
  | "select"
  | "image"
  | "media"
  | "file"
  | "boolean"
  | "banner"
  | "members"
  | "participants"
  | "certificates"
  | "password";

export interface FieldConfig {
  key: string;
  label: string;
  type: FieldType;
  list?: boolean;
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  full?: boolean;
}

export interface EntityUI {
  title: string;
  singular: string;
  icon: string;
  description?: string;
  hasOrder?: boolean;
  readOnly?: boolean;
  fields: FieldConfig[];
}

export const ENTITIES: Record<string, EntityUI> = {
  slides: {
    title: "হিরো স্লাইড",
    singular: "স্লাইড",
    icon: "gallery",
    description: "হোমপেজের সিনেমাটিক ব্যানার স্লাইড",
    hasOrder: true,
    fields: [
      { key: "imageUrl", label: "ব্যানার ছবি — কম্পিউটার ও মোবাইল ক্রপ", type: "banner", required: true, full: true },
      { key: "logoUrl", label: "প্রতিযোগিতা / ইভেন্ট লোগো (ব্যানারের কোণে দেখাবে)", type: "image", full: true },
      { key: "title", label: "শিরোনাম", type: "text", required: true, list: true },
      { key: "tag", label: "ট্যাগ", type: "text", list: true, placeholder: "যেমন: জাতীয় অর্জন" },
      { key: "subtitle", label: "সাবটাইটেল", type: "textarea", full: true },
      { key: "active", label: "সক্রিয়", type: "boolean", list: true },
    ],
  },
  achievements: {
    title: "অর্জনসমূহ",
    singular: "অর্জন",
    icon: "trophy",
    description: "পুরস্কার, মেডেল ও প্রতিযোগিতার ফলাফল",
    hasOrder: true,
    fields: [
      { key: "coverImage", label: "অলিম্পিয়াড / অর্জনের ছবি", type: "image", full: true },
      { key: "title", label: "শিরোনাম", type: "text", required: true, list: true },
      { key: "eventName", label: "অলিম্পিয়াড / ইভেন্টের নাম", type: "text", list: true, placeholder: "জাতীয় বিজ্ঞান অলিম্পিয়াড" },
      { key: "organizerInfo", label: "আয়োজকের তথ্য", type: "textarea", full: true, placeholder: "আয়োজক প্রতিষ্ঠানের নাম, যোগাযোগ বা সংক্ষিপ্ত পরিচিতি" },
      { key: "olympiadWebsite", label: "অলিম্পিয়াডের ওয়েবসাইট", type: "text", full: true, placeholder: "https://example.org" },
      { key: "location", label: "ভেন্যু / স্থান", type: "text", list: true, placeholder: "যেমন: রংপুর" },
      { key: "mapEmbedUrl", label: "ভেন্যুর এমবেড ম্যাপ URL", type: "text", full: true, placeholder: "Google Maps → Share → Embed a map → কপি করা iframe src URL" },
      { key: "date", label: "তারিখ", type: "text", placeholder: "যেমন: ২৮ নভেম্বর ২০২৫", list: true },
      { key: "subtitle", label: "সংক্ষিপ্ত বিবরণ", type: "textarea", full: true },
      { key: "description", label: "বিস্তারিত বিবরণ", type: "longtext", full: true },
      { key: "prizes", label: "পুরস্কার সংখ্যা", type: "number" },
      { key: "medals", label: "মেডেল সংখ্যা", type: "number" },
      { key: "participants", label: "শিক্ষার্থী, সেক্টর ও ফলাফল তালিকা", type: "participants", full: true },
      { key: "featured", label: "হোমপেজে দেখান", type: "boolean" },
    ],
  },
  members: {
    title: "সদস্য ও নেতৃত্ব",
    singular: "সদস্য",
    icon: "users",
    description: "ক্লাবের সদস্যদের প্রোফাইল ও পদ",
    hasOrder: true,
    fields: [
      { key: "photoUrl", label: "প্রোফাইল ছবি", type: "image", full: true },
      { key: "name", label: "নাম", type: "text", required: true, list: true },
      { key: "role", label: "পদ / ভূমিকা", type: "text", required: true, list: true },
      { key: "className", label: "শ্রেণি", type: "text", list: true, placeholder: "যেমন: দশম" },
      { key: "section", label: "শাখা", type: "text" },
      { key: "roll", label: "রোল", type: "text" },
      { key: "bio", label: "বায়ো", type: "longtext", full: true },
      { key: "achievements", label: "অর্জনসমূহ (প্রতি লাইনে একটি)", type: "longtext", full: true },
      { key: "participations", label: "অংশগ্রহণ (প্রতি লাইনে একটি)", type: "longtext", full: true },
      { key: "certificates", label: "সার্টিফিকেট (একসাথে ১২+ ফাইল আপলোড করা যাবে)", type: "certificates", full: true },
      { key: "whatsapp", label: "হোয়াটসঅ্যাপ নম্বর", type: "text" },
      { key: "facebook", label: "ফেসবুক লিংক", type: "text" },
      { key: "instagram", label: "ইনস্টাগ্রাম ইউজারনেম", type: "text" },
      { key: "isLeadership", label: "নেতৃত্ব কমিটি", type: "boolean" },
      { key: "featured", label: "হোমপেজে দেখান", type: "boolean" },
      { key: "active", label: "সক্রিয়", type: "boolean", list: true },
    ],
  },
  gallery: {
    title: "গ্যালারী",
    singular: "আইটেম",
    icon: "image",
    description: "ছবি ও ভিডিও গ্যালারী",
    hasOrder: true,
    fields: [
      { key: "url", label: "ছবি / ভিডিও", type: "media", required: true, full: true },
      {
        key: "kind",
        label: "ধরন",
        type: "select",
        options: [
          { value: "image", label: "ছবি" },
          { value: "video", label: "ভিডিও" },
        ],
      },
      {
        key: "category",
        label: "ক্যাটাগরি",
        type: "select",
        list: true,
        options: [
          { value: "school", label: "স্কুল" },
          { value: "team", label: "দলের সদস্য" },
          { value: "alumni", label: "অ্যালামনাই" },
          { value: "events", label: "নেটওয়ার্ক / ইভেন্ট" },
        ],
      },
      { key: "title", label: "ক্যাপশন", type: "text", list: true },
    ],
  },
  projects: {
    title: "প্রকল্প ইতিহাস",
    singular: "প্রকল্প",
    icon: "flask",
    description: "সম্পন্ন, চলমান ও ভবিষ্যৎ প্রকল্প",
    hasOrder: true,
    fields: [
      { key: "imageUrl", label: "ছবি", type: "image", full: true },
      { key: "title", label: "শিরোনাম", type: "text", required: true, list: true },
      {
        key: "status",
        label: "অবস্থা",
        type: "select",
        list: true,
        options: [
          { value: "success", label: "সফল" },
          { value: "ongoing", label: "চলমান" },
          { value: "failed", label: "ব্যর্থ" },
          { value: "future", label: "ভবিষ্যৎ পরিকল্পনা" },
        ],
      },
      { key: "date", label: "সময়কাল", type: "text", list: true, placeholder: "২০২৫" },
      { key: "summary", label: "সংক্ষিপ্ত বিবরণ", type: "textarea", full: true },
      { key: "description", label: "বিস্তারিত", type: "longtext", full: true },
      { key: "successes", label: "সফলতা ও পুরস্কার (প্রতি লাইনে একটি)", type: "longtext", full: true },
      { key: "failures", label: "ব্যর্থতা / শিক্ষা", type: "longtext", full: true },
      { key: "futurePlans", label: "ভবিষ্যৎ পরিকল্পনা", type: "longtext", full: true },
      { key: "featured", label: "হোমপেজে দেখান", type: "boolean" },
    ],
  },
  "hall-of-fame": {
    title: "হল অফ ফেম",
    singular: "সম্মাননা",
    icon: "star",
    description: "জাতীয় ও আন্তর্জাতিক পুরস্কারজয়ীদের বিশেষ গ্যালারী",
    hasOrder: true,
    fields: [
      { key: "photoUrl", label: "ছবি", type: "image", full: true },
      { key: "name", label: "নাম", type: "text", required: true, list: true },
      { key: "award", label: "পুরস্কার", type: "text", required: true, list: true },
      { key: "year", label: "বছর", type: "text", list: true },
      { key: "description", label: "বিবরণ", type: "longtext", full: true },
    ],
  },
  sponsors: {
    title: "স্পনসর ও পার্টনার",
    singular: "পার্টনার",
    icon: "handshake",
    description: "উদ্যোগ সমর্থনকারী প্রতিষ্ঠানের লোগো ওয়াল",
    hasOrder: true,
    fields: [
      { key: "logoUrl", label: "লোগো", type: "image", full: true },
      { key: "name", label: "নাম", type: "text", required: true, list: true },
      { key: "tagline", label: "ধরন / ট্যাগলাইন", type: "text", list: true },
      { key: "website", label: "ওয়েবসাইট", type: "text" },
    ],
  },
  resources: {
    title: "রিসোর্স লাইব্রেরি",
    singular: "রিসোর্স",
    icon: "folder",
    description: "নোট, গাইড, প্রশ্নপত্র ও ম্যাগাজিন",
    fields: [
      { key: "title", label: "শিরোনাম", type: "text", required: true, list: true },
      {
        key: "category",
        label: "ক্যাটাগরি",
        type: "select",
        list: true,
        options: [
          { value: "নোট", label: "নোট" },
          { value: "গাইড", label: "গাইড" },
          { value: "প্রশ্নপত্র", label: "প্রশ্নপত্র" },
          { value: "ম্যাগাজিন", label: "ম্যাগাজিন" },
          { value: "লিংক", label: "উপকারী লিংক" },
        ],
      },
      { key: "description", label: "বিবরণ", type: "textarea", full: true },
      { key: "fileUrl", label: "ফাইল (PDF)", type: "file", full: true },
      { key: "externalUrl", label: "বা বাইরের লিংক", type: "text", full: true },
    ],
  },
  news: {
    title: "সংবাদ ও ঘোষণা",
    singular: "সংবাদ",
    icon: "news",
    description: "হোমপেজ স্ট্রিপ ও সংবাদ পাতার ঘোষণা",
    fields: [
      { key: "title", label: "শিরোনাম", type: "text", required: true, list: true },
      { key: "tag", label: "ট্যাগ", type: "text", list: true, placeholder: "ইভেন্ট / নোটিশ / সংবাদ" },
      { key: "body", label: "বিবরণ", type: "longtext", full: true },
      { key: "mediaUrl", label: "ছবি / ভিডিও", type: "media", full: true },
      {
        key: "mediaKind",
        label: "মিডিয়া ধরন",
        type: "select",
        options: [
          { value: "none", label: "কিছু নয়" },
          { value: "image", label: "ছবি" },
          { value: "video", label: "ভিডিও" },
        ],
      },
      { key: "published", label: "প্রকাশিত", type: "boolean", list: true },
      { key: "isInternal", label: "শুধু সদস্যদের জন্য", type: "boolean" },
    ],
  },
  events: {
    title: "ইভেন্ট ও ক্যালেন্ডার",
    singular: "ইভেন্ট",
    icon: "calendar",
    description: "আসন্ন অনুষ্ঠানের তালিকা",
    hasOrder: true,
    fields: [
      { key: "imageUrl", label: "ছবি (ঐচ্ছিক)", type: "image", full: true },
      { key: "title", label: "শিরোনাম", type: "text", required: true, list: true },
      { key: "date", label: "তারিখ", type: "text", list: true, placeholder: "২০ জানুয়ারি ২০২৬" },
      { key: "location", label: "স্থান", type: "text", list: true },
      { key: "description", label: "বিবরণ", type: "textarea", full: true },
    ],
  },
  messages: {
    title: "যোগাযোগ বার্তা",
    singular: "বার্তা",
    icon: "bell",
    description: "যোগাযোগ ফর্ম থেকে আসা বার্তা",
    readOnly: true,
    fields: [
      { key: "name", label: "নাম", type: "text", list: true },
      { key: "email", label: "ইমেইল", type: "text", list: true },
      { key: "message", label: "বার্তা", type: "textarea", full: true, list: true },
    ],
  },
  users: {
    title: "ব্যবহারকারী ও অ্যাক্সেস",
    singular: "ব্যবহারকারী",
    icon: "shield",
    description: "অ্যাডমিন, এডিটর ও সদস্য লগইন অ্যাক্সেস",
    fields: [
      { key: "name", label: "নাম", type: "text", required: true, list: true },
      { key: "username", label: "ইউজারনেম", type: "text", required: true, list: true },
      {
        key: "role",
        label: "ভূমিকা",
        type: "select",
        list: true,
        options: [
          { value: "super_admin", label: "সুপার অ্যাডমিন" },
          { value: "editor", label: "এডিটর" },
          { value: "member", label: "সদস্য" },
        ],
      },
      { key: "password", label: "পাসওয়ার্ড (খালি রাখলে অপরিবর্তিত)", type: "password" },
      { key: "memberId", label: "সংযুক্ত সদস্য আইডি", type: "number" },
      { key: "active", label: "সক্রিয়", type: "boolean", list: true },
    ],
  },
};
