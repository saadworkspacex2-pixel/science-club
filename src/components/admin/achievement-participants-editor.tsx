"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, UserRound } from "lucide-react";
import type { AchievementParticipant } from "@/lib/achievement-participant-config";
import { PARTICIPANT_RESULTS } from "@/lib/achievement-participant-config";

type MemberOption = {
  id: number;
  name: string;
  role: string;
  className: string;
  photoUrl: string;
  active?: boolean;
};

export default function AchievementParticipantsEditor({
  value,
  onChange,
}: {
  value: AchievementParticipant[];
  onChange: (participants: AchievementParticipant[]) => void;
}) {
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const participants = Array.isArray(value) ? value : [];

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const res = await fetch("/api/admin/members");
        const data = await res.json();
        if (active) setMembers(Array.isArray(data.rows) ? data.rows : []);
      } catch {
        if (active) setMembers([]);
      } finally {
        if (active) setLoadingMembers(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const update = (index: number, patch: Partial<AchievementParticipant>) => {
    onChange(participants.map((participant, current) =>
      current === index ? { ...participant, ...patch } : participant
    ));
  };

  const add = () => {
    const participant: AchievementParticipant = {
      id: globalThis.crypto?.randomUUID?.() ?? `participant-${Date.now()}`,
      memberId: null,
      name: "",
      role: "",
      sector: "",
      result: "unknown",
      award: "",
    };
    onChange([...participants, participant]);
  };

  const setMember = (index: number, rawId: string) => {
    if (!rawId) {
      update(index, { memberId: null, name: "", role: "" });
      return;
    }
    const memberId = Number(rawId);
    const member = members.find((candidate) => candidate.id === memberId);
    if (!member) return;
    update(index, { memberId: member.id, name: member.name, role: member.role || "সদস্য" });
  };

  return (
    <div className="rounded-2xl border p-3 sm:p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="max-w-2xl text-[11.5px] leading-relaxed" style={{ color: "var(--ink-3)" }}>
          ক্লাবের সদস্য বেছে নিলে তার ছবি, নাম ও পদ প্রোফাইলের সঙ্গে যুক্ত হবে। অন্য শিক্ষার্থীর নামও হাতে লিখতে পারবেন; ফলাফলে পুরস্কার পেয়েছে, পায়নি বা শুধু অংশ নিয়েছে নির্বাচন করুন।
        </p>
        <button
          type="button"
          onClick={add}
          className="btn-brand shrink-0 !px-3.5 !py-2 text-[12px]"
        >
          <Plus className="h-3.5 w-3.5" /> শিক্ষার্থী যোগ করুন
        </button>
      </div>

      {loadingMembers && (
        <p className="mb-2 flex items-center gap-2 text-[11px]" style={{ color: "var(--ink-3)" }}>
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> সদস্য তালিকা লোড হচ্ছে…
        </p>
      )}

      {participants.length === 0 ? (
        <div className="grid place-items-center rounded-xl border border-dashed py-8 text-center">
          <UserRound className="mb-2 h-5 w-5" style={{ color: "var(--ink-3)" }} />
          <p className="text-[12px] font-semibold">এখনও কোনো শিক্ষার্থী যোগ করা হয়নি</p>
          <p className="mt-1 text-[10.5px]" style={{ color: "var(--ink-3)" }}>
            সদস্য বা অন্য শিক্ষার্থী যোগ করে সেক্টর ও ফলাফল লিখুন।
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead className="bg-black/[0.035] text-[10.5px] uppercase tracking-wide dark:bg-white/[0.04]">
              <tr>
                <th className="px-3 py-2.5 font-bold">শিক্ষার্থী / সদস্য</th>
                <th className="px-3 py-2.5 font-bold">সেক্টর</th>
                <th className="px-3 py-2.5 font-bold">ফলাফল</th>
                <th className="px-3 py-2.5 font-bold">পুরস্কার / স্থান</th>
                <th className="w-12 px-2 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {participants.map((participant, index) => {
                const member = members.find((candidate) => candidate.id === participant.memberId);
                const missingMember = Boolean(participant.memberId && !member);
                return (
                  <tr key={participant.id || index} className="align-top">
                    <td className="min-w-[260px] space-y-2 p-2.5">
                      <select
                        className="field !py-2 text-[11.5px]"
                        value={participant.memberId ? String(participant.memberId) : ""}
                        onChange={(event) => setMember(index, event.target.value)}
                      >
                        <option value="">অন্য শিক্ষার্থী / নাম লিখুন</option>
                        {missingMember && (
                          <option value={participant.memberId!}>
                            {participant.name || `সদস্য #${participant.memberId}`} (তালিকায় নেই)
                          </option>
                        )}
                        {members.map((candidate) => (
                          <option key={candidate.id} value={candidate.id}>
                            {candidate.name} — {candidate.role || "সদস্য"}
                          </option>
                        ))}
                      </select>
                      {member ? (
                        <div className="flex min-w-0 items-center gap-2.5 rounded-lg bg-black/[0.035] p-2 dark:bg-white/[0.04]">
                          {member.photoUrl ? (
                            <img src={member.photoUrl} alt={member.name} className="h-9 w-9 shrink-0 rounded-lg object-cover" />
                          ) : (
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--brand)_15%,transparent)] text-[13px] font-bold text-[var(--brand)]">
                              {member.name.charAt(0)}
                            </span>
                          )}
                          <span className="min-w-0">
                            <span className="block truncate text-[12px] font-bold">{member.name}</span>
                            <span className="block truncate text-[10.5px]" style={{ color: "var(--ink-3)" }}>
                              {member.role || "সদস্য"}{member.className ? ` · শ্রেণি ${member.className}` : ""}
                            </span>
                          </span>
                        </div>
                      ) : missingMember ? (
                        <div className="rounded-lg bg-amber-500/10 p-2 text-[10.5px] text-amber-700 dark:text-amber-300">
                          {participant.name} · {participant.role || "সদস্যের তথ্য পাওয়া যায়নি"}
                        </div>
                      ) : (
                        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,.8fr)] gap-2">
                          <input
                            className="field !py-2 text-[11.5px]"
                            maxLength={120}
                            value={participant.name}
                            onChange={(event) => update(index, { name: event.target.value })}
                            placeholder="শিক্ষার্থীর নাম *"
                          />
                          <input
                            className="field !py-2 text-[11.5px]"
                            maxLength={100}
                            value={participant.role}
                            onChange={(event) => update(index, { role: event.target.value })}
                            placeholder="ভূমিকা (ঐচ্ছিক)"
                          />
                        </div>
                      )}
                    </td>
                    <td className="min-w-[150px] p-2.5">
                      <input
                        className="field !py-2 text-[11.5px]"
                        maxLength={120}
                        value={participant.sector}
                        onChange={(event) => update(index, { sector: event.target.value })}
                        placeholder="যেমন: জীববিজ্ঞান"
                      />
                    </td>
                    <td className="min-w-[180px] p-2.5">
                      <select
                        className="field !py-2 text-[11.5px]"
                        value={participant.result}
                        onChange={(event) => update(index, { result: event.target.value as AchievementParticipant["result"] })}
                      >
                        {PARTICIPANT_RESULTS.map((result) => (
                          <option key={result.value} value={result.value}>{result.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="min-w-[170px] p-2.5">
                      <input
                        className="field !py-2 text-[11.5px]"
                        maxLength={180}
                        value={participant.award}
                        onChange={(event) => update(index, { award: event.target.value })}
                        placeholder={participant.result === "awarded" ? "যেমন: ১ম স্থান" : "ঐচ্ছিক"}
                      />
                    </td>
                    <td className="p-2.5">
                      <button
                        type="button"
                        onClick={() => onChange(participants.filter((_, rowIndex) => rowIndex !== index))}
                        aria-label={`${participant.name || "শিক্ষার্থী"} মুছুন`}
                        className="glass grid h-8 w-8 place-items-center rounded-full text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
