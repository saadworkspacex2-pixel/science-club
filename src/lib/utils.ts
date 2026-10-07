import clsx, { type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Convert latin digits to Bangla digits */
export function bn(n: number | string | null | undefined) {
  if (n === null || n === undefined || n === "") return "০";
  const num = Number(n);
  if (Number.isNaN(num)) return String(n);
  return num.toLocaleString("bn-BD");
}

export function bnDate(d: Date | string | null | undefined) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export const CLUB = {
  name: "বিউএসএস সাইেন্স ক্লাব",
  full: "বীর উত্তম শহীদ সমাদ স্কুল অ্যান্ড কলেজ",
  sub: "সাইেন্স ক্লাব",
  english: "Science Club of Bir Uttam Shaheed Samad School & College",
  location: "রংপুর সেনানিবাস, রংপুর",
  email: "scienceclub@bussc.edu.bd",
  phone: "+880 1700-000000",
  schools: [
    "বীর উত্তম শহীদ সমাদ স্কুল অ্যান্ড কলেজ",
    "ক্যান্ট বোর্ড গার্লস স্কুল, রংপুর",
  ],
};
