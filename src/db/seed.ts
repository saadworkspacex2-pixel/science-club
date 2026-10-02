import "dotenv/config";
import { db } from "./index";
import * as schema from "./schema";
import bcrypt from "bcryptjs";

const img = (n: string) => `/images/seed/${n}`;

async function main() {
  console.log("Seeding...");

  // Wipe existing (idempotent reseed)
  await db.delete(schema.memberAccounts);
  await db.delete(schema.users);
  await db.delete(schema.slides);
  await db.delete(schema.members);
  await db.delete(schema.achievements);
  await db.delete(schema.projects);
  await db.delete(schema.galleryItems);
  await db.delete(schema.hallOfFame);
  await db.delete(schema.sponsors);
  await db.delete(schema.news);
  await db.delete(schema.events);
  await db.delete(schema.resources);
  await db.delete(schema.applications);
  await db.delete(schema.settings);

  // ---------- Users ----------
  await db.insert(schema.users).values({
    username: "admin",
    passwordHash: bcrypt.hashSync("admin123", 10),
    name: "প্রধান অ্যাডমিন",
    role: "super_admin",
  });

  // ---------- Slides ----------
  await db.insert(schema.slides).values([
    {
      imageUrl: img("lab1.jpg"),
      title: "বিজ্ঞানে বিশ্বাস, ভবিষ্যতে অগ্রগতি",
      subtitle: "বুর উত্তম শহীদ সমাদ স্কুল অ্যান্ড কলেজ সাইন্স ক্লাব — কৌতূহল থেকে আবিষ্কারের যাত্রা",
      sortOrder: 0,
    },
    {
      imageUrl: img("lab4.jpg"),
      title: "প্রতিটি পরীক্ষা, একেকটি আবিষ্কার",
      subtitle: "অণুবীক্ষণ যন্ত্রের ফোকাসে লুকিয়ে থাকে ভবিষ্যৎ বিজ্ঞানীর স্বপ্ন",
      sortOrder: 1,
    },
    {
      imageUrl: img("lab5.jpg"),
      title: "তরুণ বিজ্ঞানীদের মেলবন্ধন",
      subtitle: "একসাথে শিখি, একসাথে গবেষণা করি, একসাথে জয় করি",
      sortOrder: 2,
    },
    {
      imageUrl: img("lab9.jpg"),
      title: "কৌতূহলই আমাদের প্রকৃত শক্তি",
      subtitle: "ল্যাব থেকে জাতীয় মঞ্চ — অর্জনের ধারাবাহিক গল্প",
      sortOrder: 3,
    },
  ]);

  // ---------- Members ----------
  const memberRows = await db
    .insert(schema.members)
    .values([
      {
        name: "আরিফুল ইসলাম",
        className: "দশম",
        section: "ক",
        roll: "০৩",
        role: "সভাপতি",
        photoUrl: img("p1.jpg"),
        isLeadership: true,
        sortOrder: 0,
        bio: "বিজ্ঞানের প্রতি গভীর ভালোবাসা থেকে ২০২৩ সালে ক্লাবে যোগ দেন। রোবোটিক্স ও পদার্থবিজ্ঞানে বিশেষ আগ্রহী। জাতীয় পর্যায়ে একাধিক পুরস্কার অর্জন করেছেন।",
        achievements: "জাতীয় বিজ্ঞান অলিম্পিয়াড — স্বর্ণপদক\nআন্তঃস্কুল কুইজ — চ্যাম্পিয়ন\nরোবোটিক্স ফেস্ট — সেরা ডিজাইন পুরস্কার",
        participations: "জাতীয় বিজ্ঞান মেলা ২০২৪, ২০২৫\nঢাকা রোবোটিক্স সামিট\nআঞ্চলিক গণিত অলিম্পিয়াড",
        whatsapp: "+8801700000001",
        facebook: "https://facebook.com/ariful",
        instagram: "ariful.sci",
      },
      {
        name: "তানভীর আহমেদ",
        className: "নবম",
        section: "খ",
        roll: "০৭",
        role: "সহ-সভাপতি",
        photoUrl: img("p2.jpg"),
        isLeadership: true,
        sortOrder: 1,
        bio: "রসায়ন পরীক্ষাগারে সবচেয়ে বেশি সময় কাটান। ক্লাবের প্রকল্প ব্যবস্থাপনা ও নতুন সদস্য প্রশিক্ষণে দায়িত্বশীল।",
        achievements: "আন্তঃস্কুল বিজ্ঞান মেলা — সেরা প্রকল্প\nজাতীয় কুইজ প্রতিযোগিতা — তৃতীয়",
        participations: "বিজ্ঞান মেলা ২০২৫\nন্যাশনাল কেমিস্ট্রি ক্যাম্প",
        whatsapp: "+8801700000002",
        facebook: "https://facebook.com/tanvir",
        instagram: "tanvir.chem",
      },
      {
        name: "মেহরাব হোসেন",
        className: "দশম",
        section: "ক",
        roll: "১১",
        role: "পরিচালক",
        photoUrl: img("p3.jpg"),
        isLeadership: true,
        sortOrder: 2,
        bio: "ইভেন্ট ম্যানেজমেন্ট ও আয়োজনে দক্ষ। ক্লাবের সকল কর্মসূচির পরিকল্পনা ও বাস্তবায়নে নেতৃত্ব দেন।",
        achievements: "বিজ্ঞান মেলা আয়োজক প্যানেল — সেরা পরিচালক\nজাতীয় দিবস কর্মসূচি — বিশেষ সম্মাননা",
        participations: "বার্ষিক বিজ্ঞান সপ্তাহ ২০২৪, ২০২৫\nস্টেম ফেয়ার, রংপুর",
        whatsapp: "+8801700000003",
        facebook: "https://facebook.com/mehrab",
        instagram: "mehrab.h",
      },
      {
        name: "সাফওয়ান করিম",
        className: "অষ্টম",
        section: "ক",
        roll: "০২",
        role: "সাধারণ সম্পাদক",
        photoUrl: img("p4.jpg"),
        isLeadership: true,
        sortOrder: 3,
        bio: "লেখালেখি ও উপস্থাপনায় পারদর্শী। ক্লাবের ম্যাগাজিন ও সামাজিক যোগাযোগ মাধ্যমের দায়িত্বে রয়েছেন।",
        achievements: "আন্তঃস্কুল বিতর্ক — চ্যাম্পিয়ন\nবিজ্ঞান রচনা প্রতিযোগিতা — প্রথম",
        participations: "সায়েন্স এক্সপো ২০২৫\nরাইটার্স ওয়ার্কশপ, ঢাকা",
        whatsapp: "+8801700000004",
        facebook: "https://facebook.com/safwan",
        instagram: "safwan.write",
      },
      {
        name: "নাঈম সরকার",
        className: "নবম",
        section: "ক",
        roll: "১৫",
        role: "সদস্য",
        photoUrl: img("p5.jpg"),
        isLeadership: false,
        sortOrder: 4,
        bio: "জ্যোতির্বিজ্ঞানে আগ্রহী। রাতের আকাশ পর্যবেক্ষণ কর্মসূচির নিয়মিত সদস্য।",
        achievements: "আঞ্চলিক অ্যাস্ট্রো কুইজ — দ্বিতীয়",
        participations: "জাতীয় স্পেস ক্যাম্প\nস্টার-গেজিং নাইট ২০২৫",
        whatsapp: "",
        facebook: "",
        instagram: "naim.astro",
      },
      {
        name: "রাকিব হাসান",
        className: "অষ্টম",
        section: "খ",
        roll: "০৯",
        role: "সেরা প্রবেশকারী — ২০২৫",
        photoUrl: img("p6.jpg"),
        isLeadership: false,
        sortOrder: 5,
        bio: "প্রথম বছরেই সৌরশক্তি প্রকল্পে গুরুত্বপূর্ণ ভূমিকা রাখেন। প্রোগ্রামিং শিখছেন।",
        achievements: "নতুন কিশোর বিজ্ঞানী পুরস্কার — ২০২৫",
        participations: "বিজ্ঞান মেলা ২০২৫",
        whatsapp: "",
        facebook: "",
        instagram: "",
      },
      {
        name: "ফাহিম মাহমুদ",
        className: "দশম",
        section: "খ",
        roll: "০৫",
        role: "টেকনিক্যাল লিড",
        photoUrl: img("p7.jpg"),
        isLeadership: false,
        sortOrder: 6,
        bio: "মাল্টিমিডিয়া ও ভিডিও নির্মাণে দক্ষ। ক্লাবের সকল ডিজিটাল কনটেন্টের পেছনে তাঁর হাত।",
        achievements: "সাইন্স শর্টফিল্ম ফেস্ট — সেরা সম্পাদনা",
        participations: "ডিজিটাল কনটেন্ট সামিট\nবিজ্ঞান মেলা ২০২৫",
        whatsapp: "",
        facebook: "https://facebook.com/fahim",
        instagram: "fahim.frame",
      },
    ])
    .returning();

  // Member portal account for testing: arif / arif123
  await db.insert(schema.memberAccounts).values({
    memberId: memberRows[0].id,
    username: "arif",
    passwordHash: bcrypt.hashSync("arif123", 10),
  });

  // ---------- Achievements ----------
  await db.insert(schema.achievements).values([
    {
      title: "জাতীয় বিজ্ঞান অলিম্পিয়াড ২০২৫ — চ্যাম্পিয়ন",
      subtitle: "ঢাকা বিভাগীয় পর্ব থেকে জাতীয় ফাইনালে ঐতিহাসিক জয়",
      coverImage: img("lab2.jpg"),
      eventName: "জাতীয় বিজ্ঞান অলিম্পিয়াড",
      location: "বাংলাদেশ শিশু একাডেমি, ঢাকা",
      date: "২০২৫-১১-২২",
      prizes: 3,
      medals: 5,
      description:
        "আমাদের ক্লাবের ৫ সদস্যের দল জাতীয় বিজ্ঞান অলিম্পিয়াডের চূড়ান্ত পর্বে অংশ নিয়ে সামগ্রিক চ্যাম্পিয়নের মুকুট অর্জন করে। পদার্থবিজ্ঞান, রসায়ন ও জীববিজ্ঞান — তিনটি বিভাগেই আমরা সর্বোচ্চ নম্বর পাই। ৬৪ জেলার মোট ১২০টি দলের মধ্যে আমাদের ক্লাব সর্বোচ্চ পয়েন্ট অর্জন করে।\n\nএই জয়ের পেছনে ছিল ৮ মাসের নিরলস প্রস্তুতি, সাপ্তাহিক মক টেস্ট এবং সিনিয়র সদস্যদের মেন্টরশিপ।",
      photos: [img("lab2.jpg"), img("lab3.jpg"), img("lab5.jpg")],
      sortOrder: 0,
    },
    {
      title: "আন্তঃস্কুল বিজ্ঞান মেলা — সেরা প্রকল্প পুরস্কার",
      subtitle: "সৌরশক্তিচালিত ওয়াটার পিউরিফায়ার প্রকল্পের জয়",
      coverImage: img("lab6.jpg"),
      eventName: "রংপুর আন্তঃস্কুল বিজ্ঞান মেলা",
      location: "রংপুর জিলা স্কুল মাঠ",
      date: "২০২৫-০৯-১৪",
      prizes: 2,
      medals: 4,
      description:
        "২৮টি স্কুলের মধ্যে আমাদের 'সৌরশক্তিচালিত ওয়াটার পিউরিফায়ার' প্রকল্প সেরা প্রকল্পের পুরস্কার জেতে। বিচারকরা প্রশংসা করেন এর ব্যবহারিক প্রয়োগ ও কম খরচের কারিগরি বাস্তবায়নের।",
      photos: [img("lab6.jpg"), img("lab8.jpg")],
      sortOrder: 1,
    },
    {
      title: "জাতীয় রোবোটিক্স প্রতিযোগিতা — রানার্স-আপ",
      subtitle: "লাইন-ফলোয়িং রোবট বিভাগে দ্বিতীয় স্থান",
      coverImage: img("lab9.jpg"),
      eventName: "বাংলাদেশ রোবোটিক্স ফেস্ট",
      location: "বুয়েট, ঢাকা",
      date: "২০২৫-০৭-০৫",
      prizes: 1,
      medals: 3,
      description:
        "নিজস্ব ডিজাইনের লাইন-ফলোয়িং রোবট 'তারা-১' দিয়ে জাতীয় ফাইনালে রানার্স-আপ হওয়ার গৌরব অর্জন করি। প্রথমবারের মতো ফাইনালে উঠেই এই অর্জন।",
      photos: [img("lab9.jpg"), img("lab7.jpg")],
      sortOrder: 2,
    },
    {
      title: "আঞ্চলিক গণিত অলিম্পিয়াড — দলগত বিজয়ী",
      subtitle: "রংপুর বিভাগে আমাদের দলের টানা দ্বিতীয় শিরোপা",
      coverImage: img("lab4.jpg"),
      eventName: "আঞ্চলিক গণিত অলিম্পিয়াড",
      location: "কারমাইকেল কলেজ, রংপুর",
      date: "২০২৫-০৩-১৮",
      prizes: 2,
      medals: 6,
      description:
        "গণিত অলিম্পিয়াডের রংপুর আঞ্চলিক পর্বে আমাদের ক্লাব দলগত চ্যাম্পিয়ন হয়। ছয় সদস্য পদক জিতে জাতীয় পর্বে উত্তীর্ণ হন।",
      photos: [img("lab4.jpg"), img("lab1.jpg")],
      sortOrder: 3,
    },
  ]);

  // ---------- Projects ----------
  await db.insert(schema.projects).values([
    {
      title: "সৌরশক্তিচালিত ওয়াটার পিউরিফায়ার",
      summary: "কম খরচে সূর্যের আলো দিয়ে পানীয়জল বিশুদ্ধকরণ ব্যবস্থা",
      description:
        "গ্রামাঞ্চলের বিশুদ্ধ পানীয়জল সংকট মোকাবিলায় সৌরপ্যানেল চালিত UV ও কার্বন ফিল্টার ব্যবস্থা তৈরি করি। দৈনিক ৫০ লিটার পানি বিশুদ্ধ করা সম্ভব।",
      imageUrl: img("lab8.jpg"),
      status: "success",
      successes: "আন্তঃস্কুল বিজ্ঞান মেলায় সেরা প্রকল্প পুরস্কার\nস্কুলে প্রোটোটাইপ স্থাপনা সম্পন্ন\nস্থানীয় প্রশাসনের প্রশংসাপত্র",
      failures: "শুরুতে UV বাল্বের খরচ বেশি ছিল — পরে LED ভিত্তিক সমাধানে খরচ ৬০% কমানো হয়",
      futurePlans: "রংপুরের ৩টি গ্রামে পাইলট স্থাপনার পরিকল্পনা চলছে",
      sortOrder: 0,
    },
    {
      title: "স্মার্ট ক্যাম্পোস অ্যাপ",
      summary: "স্কুলের নোটিশ, রুটিন ও রিসোর্স এক অ্যাপে",
      description:
        "শিক্ষার্থীদের জন্য একটি মোবাইল অ্যাপ যেখানে ক্লাস রুটিন, নোটিশ বোর্ড, পরীক্ষার সিলেবাস ও সাইন্স ক্লাবের রিসোর্স সবকিছু একসাথে থাকবে।",
      imageUrl: img("lab10.jpg"),
      status: "ongoing",
      successes: "UI ডিজাইন চূড়ান্ত\nব্যাকএন্ড API তৈরি\nপাইলট টেস্টিং ৫০ জন শিক্ষার্থীর কাছে চলমান",
      failures: "অফলাইন মোডে ডেটা সিঙ্ক নিয়ে কারিগরি জটিলতার সম্মুখীন হতে হয়েছে",
      futurePlans: "২০২৬ সালের মার্চে পূর্ণাঙ্গ রিলিজ",
      sortOrder: 1,
    },
    {
      title: "হাইড্রোপনিক্স দ্রুতগামী উদ্ভিদ চাষ",
      summary: "মাটি ছাড়া পানির মাধ্যমে সবজি চাষের পরীক্ষা",
      description:
        "ল্যাবে ছোট পরিসরে হাইড্রোপনিক্স পদ্ধতিতে পালং শাক ও লেটুস চাষের পরীক্ষা চালাই। পুষ্টি দ্রবণের মাত্রা নিয়ন্ত্রণে ব্যর্থতার কারণে প্রথম ফসল নষ্ট হয়।",
      imageUrl: img("lab3.jpg"),
      status: "failed",
      successes: "প্রথম চেষ্টাতেই অঙ্কুরোদগমে ৯০% সফলতা",
      failures: "পুষ্টি দ্রবণের pH মাত্রা নিয়ন্ত্রণ ব্যর্থতায় প্রথম ফসল নষ্ট হয় — এখান থেকেই স্বয়ংক্রিয় pH মাপার প্রয়োজনীয়তা শিখি",
      futurePlans: "pH সেন্সর যুক্ত স্বয়ংক্রিয় ব্যবস্থা নিয়ে আবার শুরুর পরিকল্পনা",
      sortOrder: 2,
    },
    {
      title: "ক্যানস্যাট — মিনি স্যাটেলাইট প্রকল্প",
      summary: "সোডা ক্যানের আকারে আবহাওয়া তথ্য সংগ্রহকারী উপগ্রহ",
      description:
        "আন্তর্জাতিক ক্যানস্যাট প্রতিযোগিতার লক্ষ্যে তাপমাত্রা, চাপ ও আর্দ্রতা মাপতে সক্ষম মিনি স্যাটেলাইট তৈরির মহাপরিকল্পনা।",
      imageUrl: img("lab7.jpg"),
      status: "future",
      successes: "প্রাথমিক ডিজাইন নথি প্রস্তুত",
      failures: "",
      futurePlans: "২০২৬-এর শেষে প্রোটোটাইপ\nপ্যারাশুট অবতরণ পরীক্ষা\nদেশি-বিদেশি স্পনসরশিপ সংগ্রহ",
      sortOrder: 3,
    },
  ]);

  // ---------- Gallery ----------
  const cats: Array<[string, string, string]> = [
    ["lab1.jpg", "school", "বিজ্ঞান ল্যাবে আমাদের দল"],
    ["lab2.jpg", "events", "রসায়ন পরীক্ষা কর্মশালা"],
    ["lab3.jpg", "school", "নতুন সদস্য ওরিয়েন্টেশন"],
    ["lab4.jpg", "team", "অণুবীক্ষণ যন্ত্রে গবেষণা"],
    ["lab5.jpg", "events", "বার্ষিক বিজ্ঞান মেলা ২০২৫"],
    ["lab6.jpg", "events", "পুরস্কার বিতরণী অনুষ্ঠান"],
    ["lab7.jpg", "team", "টিম মিটিং ও পরিকল্পনা"],
    ["lab8.jpg", "alumni", "প্রাক্তন সদস্য মিলনমেলা"],
    ["lab9.jpg", "team", "প্রকল্প উপস্থাপনা"],
    ["lab10.jpg", "school", "ক্যাম্পাস উদ্বোধন অনুষ্ঠান"],
  ];
  await db.insert(schema.galleryItems).values(
    cats.map((c, i) => ({ url: img(c[0]), category: c[1], title: c[2], kind: "image", sortOrder: i }))
  );

  // ---------- Hall of Fame ----------
  await db.insert(schema.hallOfFame).values([
    {
      name: "আরিফুল ইসলাম",
      photoUrl: img("p1.jpg"),
      award: "জাতীয় বিজ্ঞান অলিম্পিয়াড — স্বর্ণপদক",
      description: "২০২৫ সালে জাতীয় বিজ্ঞান অলিম্পিয়াডে পদার্থবিজ্ঞান বিভাগে স্বর্ণপদক জয় করে ক্লাবকে জাতীয় মঞ্চে সম্মানিত করেন।",
      sortOrder: 0,
    },
    {
      name: "সাফওয়ান করিম",
      photoUrl: img("p4.jpg"),
      award: "জাতীয় বিজ্ঞান রচনা প্রতিযোগিতা — প্রথম",
      description: "কৃত্রিম বুদ্ধিমত্তা নিয়ে লেখা প্রবন্ধে জাতীয় পর্যায়ে প্রথম স্থান অর্জন করেন।",
      sortOrder: 1,
    },
    {
      name: "রাকিব হাসান",
      photoUrl: img("p6.jpg"),
      award: "নতুন কিশোর বিজ্ঞানী পুরস্কার ২০২৫",
      description: "প্রথম বর্ষেই অসাধারণ অবদানের জন্য জাতীয় কিশোর বিজ্ঞানী সম্মাননায় ভূষিত হন।",
      sortOrder: 2,
    },
    {
      name: "তানভীর আহমেদ",
      photoUrl: img("p2.jpg"),
      award: "আন্তর্জাতিক কেমিস্ট্রি কুইজ — সম্মাননা সনদ",
      description: "অনলাইনে অনুষ্ঠিত আন্তর্জাতিক রসায়ন কুইজে দক্ষিণ এশিয়ার সেরা ৫%-এর মধ্যে স্থান করেন।",
      sortOrder: 3,
    },
  ]);

  // ---------- Sponsors ----------
  await db.insert(schema.sponsors).values(
    [
      "রংপুর টেক ল্যাব",
      "উত্তরা প্রকাশনী",
      "বিজ্ঞান বাতায়ন",
      "গবেষণা ফাউন্ডেশন",
      "ইয়ুথ ইনোভেশন হাব",
      "স্টেম বাংলাদেশ",
    ].map((name, i) => ({ name, logoUrl: "", website: "", sortOrder: i }))
  );

  // ---------- News ----------
  await db.insert(schema.news).values([
    {
      title: "বার্ষিক বিজ্ঞান মেলা ২০২৬ এর রেজিস্ট্রেশন শুরু",
      body: "আগামী ১৫ ফেব্রুয়ারি বার্ষিক বিজ্ঞান মেলা অনুষ্ঠিত হবে। প্রকল্প জমা দেওয়ার শেষ তারিখ ১ ফেব্রুয়ারি। আগ্রহীরা ক্লাব রুমে যোগাযোগ করুন।",
      mediaUrl: img("lab5.jpg"),
      mediaKind: "image",
      isInternal: false,
    },
    {
      title: "জাতীয় রোবোটিক্স প্রতিযোগিতার জন্য দল গঠন",
      body: "২০২৬ সালের জাতীয় রোবোটিক্স প্রতিযোগিতায় অংশগ্রহণের জন্য ৪ সদস্যের দল গঠন করা হবে। আগ্রহী সদস্যদের আগামী শুক্রবার পর্যন্ত নাম জমা দিতে হবে।",
      mediaUrl: "",
      mediaKind: "none",
      isInternal: false,
    },
    {
      title: "নতুন ল্যাব যন্ত্রপাতি হস্তান্তর",
      body: "ক্লাবের জন্য নতুন মাইক্রোস্কোপ, রাসায়নিক সেট ও আরডুইনো কিট বরাদ্দ পেয়েছি। সদস্যরা আগামী সপ্তাহ থেকে ব্যবহার করতে পারবেন।",
      mediaUrl: img("lab7.jpg"),
      mediaKind: "image",
      isInternal: true,
    },
  ]);

  // ---------- Events ----------
  await db.insert(schema.events).values([
    {
      title: "বার্ষিক বিজ্ঞান মেলা ২০২৬",
      date: "২০২৬-০২-১৫",
      location: "স্কুল প্রাঙ্গণ",
      description: "ক্লাবের সবচেয়ে বড় আয়োজন — প্রকল্প প্রদর্শনী, কুইজ, রোবোট শো এবং বিজ্ঞানীদের বক্তৃতা।",
      imageUrl: img("lab5.jpg"),
      sortOrder: 0,
    },
    {
      title: "স্টার গেজিং নাইট",
      date: "২০২৬-০১-২০",
      location: "স্কুল ছাদ",
      description: "টেলিস্কোপ দিয়ে রাতের আকাশ পর্যবেক্ষণ — শুক্র, বৃহস্পতি ও চাঁদের ক্র্যাটার দেখার সুযোগ।",
      imageUrl: img("lab9.jpg"),
      sortOrder: 1,
    },
    {
      title: "রোবোটিক্স বুটক্যাম্প",
      date: "২০২৬-০৩-০৫",
      location: "কম্পিউটার ল্যাব",
      description: "নতুন সদস্যদের জন্য ৩ দিনব্যাপী আরডুইনো ও বেসিক রোবোটিক্স প্রশিক্ষণ।",
      imageUrl: img("lab7.jpg"),
      sortOrder: 2,
    },
  ]);

  // ---------- Resources ----------
  await db.insert(schema.resources).values([
    {
      title: "পদার্থবিজ্ঞান — অধ্যায়ভিত্তিক সাজেশন নোট",
      category: "নোট",
      fileUrl: "",
      description: "নবম-দশম শ্রেণির পদার্থবিজ্ঞানের গুরুত্বপূর্ণ অধ্যায়গুলোর সংক্ষিপ্ত নোট।",
    },
    {
      title: "বিজ্ঞান অলিম্পিয়াড প্রস্তুতি গাইড",
      category: "গাইড",
      fileUrl: "",
      description: "ক্লাবের সিনিয়রদের তৈরি ধাপে ধাপে প্রস্তুতি রোডম্যাপ।",
    },
    {
      title: "অতীত বছরের প্রশ্নপত্র সংকলন",
      category: "প্রশ্নপত্র",
      fileUrl: "",
      description: "গত ৫ বছরের অলিম্পিয়াড ও বিজ্ঞান মেলার প্রশ্নপত্র।",
    },
    {
      title: "ক্লাব ম্যাগাজিন — প্রথম সংখ্যা",
      category: "ম্যাগাজিন",
      fileUrl: "",
      description: "সদস্যদের লেখা, গবেষণা ও গল্পে সাজানো বার্ষিক ম্যাগাজিন।",
    },
  ]);

  // ---------- Sample application ----------
  await db.insert(schema.applications).values({
    school: "Cantt Board Girls School, Rangpur",
    className: "৮",
    fullName: "নুসরাত জাহান",
    classRoll: "১২",
    phone: "01700000999",
    whatsapp: "01700000999",
    instagram: "nusrat.science",
    status: "pending",
  });

  // ---------- Settings ----------
  await db.insert(schema.settings).values([
    { key: "logoUrl", value: "" },
    { key: "clubName", value: "বুর উত্তম শহীদ সমাদ স্কুল অ্যান্ড কলেজ সাইন্স ক্লাব" },
    { key: "tagline", value: "কৌতূহল থেকে আবিষ্কার — আমরা গাই ভবিষ্যতের বিজ্ঞান" },
    {
      key: "mission",
      value:
        "প্রতিটি শিক্ষার্থীর মধ্যে বৈজ্ঞানিক কৌতূহল, গবেষণা মানসিকতা ও উদ্ভাবনী চর্চা জাগ্রত করা — যেন তৈরি হয় ভবিষ্যতের বিজ্ঞানী, প্রকৌশলী ও দেশরত্ন।",
    },
    {
      key: "vision",
      value:
        "রংপুর অঞ্চলের সেরা স্কুল-ভিত্তিক বিজ্ঞান সংগঠন হয়ে জাতীয় ও আন্তর্জাতিক মঞ্চে বাংলাদেশের তরুণ বিজ্ঞানীদের প্রতিনিধিত্ব করা।",
    },
    {
      key: "history",
      value:
        "২০১৮ সালে কয়েকজন কৌতূহলী শিক্ষার্থী ও বিজ্ঞান বিভাগের শিক্ষকদের হাত ধরে যাত্রা শুরু আমাদের ক্লাবের। ছোট্ট একটি ল্যাব কর্নার থেকে আজ জাতীয় পুরস্কারজয়ী প্রতিষ্ঠান — এই যাত্রার প্রতিটি ধাপে ছিল অক্লান্ত পরিশ্রম, স্বপ্ন ও বিজ্ঞানের প্রতি গভীর ভালোবাসা। আজ আমরা দুই শতাধিক সদস্যের এক পরিবার।",
    },
    { key: "email", value: "scienceclub.busssc@gmail.com" },
    { key: "phone", value: "+880 1700-000000" },
    { key: "address", value: "বুর উত্তম শহীদ সমাদ স্কুল অ্যান্ড কলেজ, রংপুর" },
    { key: "facebook", value: "https://facebook.com/busssc.scienceclub" },
    { key: "youtube", value: "https://youtube.com/@busssc-science" },
    { key: "instagram", value: "https://instagram.com/busssc.science" },
  ]);

  console.log("Seed complete ✓");
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
