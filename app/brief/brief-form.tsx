"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { links } from "../site-config";
import { QUESTION_COUNT, SECTIONS, type Question } from "./questions";

type Answer = { picked: string[]; note: string };

/** Bumped when the question list changes enough that old drafts read wrong. */
const STORAGE_KEY = "mgumrah:brief:eticaret:v1";

const EMPTY: Answer = { picked: [], note: "" };

function isAnswered(answer: Answer | undefined) {
  return Boolean(answer && (answer.picked.length > 0 || answer.note.trim()));
}

function noteLabel(question: Question) {
  return question.noteLabel ?? "Eklemek istediğin bir şey";
}

/**
 * The whole form as one WhatsApp-ready block. Unanswered questions stay in the
 * output marked as blank rather than being dropped: knowing which question was
 * skipped is itself an answer, and a numbered list that silently loses entries
 * is impossible to read against the form.
 */
function buildText(name: string, answers: Record<string, Answer>) {
  const lines: string[] = ["E-TİCARET HEDEF TAKİP UYGULAMASI — SORU FORMU"];

  if (name.trim()) lines.push(`Cevaplayan: ${name.trim()}`);
  lines.push(`Tarih: ${new Date().toLocaleDateString("tr-TR")}`);

  const answered = SECTIONS.flatMap((section) => section.questions).filter((question) =>
    isAnswered(answers[question.id])
  ).length;
  lines.push(`Cevaplanan: ${answered}/${QUESTION_COUNT}`, "");

  let index = 0;
  for (const section of SECTIONS) {
    lines.push(`— ${section.title.toUpperCase()} —`);
    for (const question of section.questions) {
      index += 1;
      const answer = answers[question.id] ?? EMPTY;
      lines.push(`${index}) ${question.q}`);

      if (answer.picked.length > 0) lines.push(`   → ${answer.picked.join(" + ")}`);
      if (answer.note.trim()) {
        const prefix = answer.picked.length > 0 ? "   Not: " : "   → ";
        lines.push(prefix + answer.note.trim().replace(/\n/g, "\n   "));
      }
      if (!isAnswered(answer)) lines.push("   → (boş bırakıldı)");
      lines.push("");
    }
  }

  return lines.join("\n").trim();
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Safari refuses the async API outside a trusted gesture chain and older
    // WebViews do not ship it at all; the deprecated path still works there.
    try {
      const field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(field);
      return ok;
    } catch {
      return false;
    }
  }
}

export default function BriefForm() {
  const [name, setName] = useState("");
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [restored, setRestored] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  // Restore before the first save runs, so an empty initial state can never
  // overwrite a draft that took ten minutes to fill in.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { name?: string; answers?: Record<string, Answer> };
        if (parsed.name) setName(parsed.name);
        if (parsed.answers) setAnswers(parsed.answers);
      }
    } catch {
      // A corrupt draft is not worth blocking the form over.
    }
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ name, answers }));
    } catch {
      // Private mode / quota — the form still works, it just won't survive a reload.
    }
  }, [name, answers, restored]);

  const answeredCount = useMemo(
    () =>
      SECTIONS.flatMap((section) => section.questions).filter((question) => isAnswered(answers[question.id]))
        .length,
    [answers]
  );

  const toggle = useCallback((question: Question, option: string) => {
    setAnswers((prev) => {
      const current = prev[question.id] ?? EMPTY;
      const has = current.picked.includes(option);
      const picked =
        question.kind === "multi"
          ? has
            ? current.picked.filter((item) => item !== option)
            : [...current.picked, option]
          : has
            ? []
            : [option];
      return { ...prev, [question.id]: { ...current, picked } };
    });
  }, []);

  const setNote = useCallback((id: string, note: string) => {
    setAnswers((prev) => ({ ...prev, [id]: { ...(prev[id] ?? EMPTY), note } }));
  }, []);

  const send = useCallback(async () => {
    const text = buildText(name, answers);
    // Opened before the clipboard is awaited: a window.open that lands after an
    // await has lost the click that authorised it, and mobile Safari blocks it.
    // No phone number in the link on purpose — WhatsApp opens its own contact
    // picker, so this page never has to carry a private number in public source.
    const opened = window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    const copied = await copyToClipboard(text);
    setStatus(
      opened
        ? copied
          ? "WhatsApp açılıyor. Metin panoya da kopyalandı — gelmezse sohbete yapıştırman yeterli."
          : "WhatsApp açılıyor."
        : copied
          ? "WhatsApp açılamadı ama metin panoya kopyalandı — sohbete yapıştırabilirsin."
          : "WhatsApp açılamadı. \"Panoya kopyala\" ile deneyebilirsin."
    );
  }, [name, answers]);

  const copy = useCallback(async () => {
    const copied = await copyToClipboard(buildText(name, answers));
    setStatus(copied ? "Kopyalandı. İstediğin yere yapıştırabilirsin." : "Kopyalanamadı — metni elle seçmen gerekiyor.");
  }, [name, answers]);

  const mail = useCallback(() => {
    const text = buildText(name, answers);
    const subject = encodeURIComponent("E-ticaret hedef takip — soru formu");
    window.location.href = `mailto:${links.email}?subject=${subject}&body=${encodeURIComponent(text)}`;
  }, [name, answers]);

  const reset = useCallback(() => {
    if (!confirm("Bütün cevaplar silinsin mi?")) return;
    setName("");
    setAnswers({});
    setStatus("Form sıfırlandı.");
  }, []);

  let number = 0;

  return (
    <div className="brief">
      <div className="brief-field brief-name">
        <label htmlFor="brief-name">Adın</label>
        <input
          id="brief-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Örn. Emrullah"
          autoComplete="name"
        />
      </div>

      {SECTIONS.map((section) => (
        <section key={section.id} className="brief-section" aria-labelledby={`sec-${section.id}`}>
          <div className="brief-section-head">
            <h2 id={`sec-${section.id}`}>{section.title}</h2>
            <p>{section.blurb}</p>
          </div>

          {section.questions.map((question) => {
            const answer = answers[question.id] ?? EMPTY;
            number += 1;
            return (
              <div
                key={question.id}
                className={`brief-q${isAnswered(answer) ? " is-answered" : ""}`}
                role="group"
                aria-labelledby={`q-${question.id}`}
              >
                <p className="brief-q-text" id={`q-${question.id}`}>
                  <span className="brief-q-no">{number}</span>
                  {question.q}
                </p>
                {question.hint ? <p className="brief-q-hint">{question.hint}</p> : null}

                {question.options ? (
                  <div className="brief-chips">
                    {question.options.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`brief-chip${answer.picked.includes(option) ? " is-on" : ""}`}
                        aria-pressed={answer.picked.includes(option)}
                        onClick={() => toggle(question, option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                ) : null}

                <div className="brief-field">
                  <label htmlFor={`note-${question.id}`}>{noteLabel(question)}</label>
                  <textarea
                    id={`note-${question.id}`}
                    rows={question.long ? 4 : 2}
                    value={answer.note}
                    onChange={(event) => setNote(question.id, event.target.value)}
                    placeholder={question.kind === "text" ? "Buraya yazabilirsin…" : "İstersen boş bırak"}
                  />
                </div>
              </div>
            );
          })}
        </section>
      ))}

      <div className="brief-actions">
        <button type="button" className="btn primary" onClick={send}>
          WhatsApp ile gönder
        </button>
        <button type="button" className="btn" onClick={copy}>
          Panoya kopyala
        </button>
        <button type="button" className="btn" onClick={mail}>
          E-posta ile gönder
        </button>
        <button type="button" className="brief-reset" onClick={reset}>
          Sıfırla
        </button>
      </div>

      <p className="brief-status" role="status" aria-live="polite">
        {status ?? "Cevapların bu cihazda otomatik saklanıyor; sayfayı kapatsan da kaybolmaz."}
      </p>

      <div className="brief-bar">
        <div className="brief-bar-meter" aria-hidden="true">
          <span style={{ width: `${(answeredCount / QUESTION_COUNT) * 100}%` }} />
        </div>
        <span className="brief-bar-count">
          {answeredCount}/{QUESTION_COUNT} cevaplandı
        </span>
        <button type="button" className="btn primary brief-bar-send" onClick={send}>
          Gönder
        </button>
      </div>
    </div>
  );
}
