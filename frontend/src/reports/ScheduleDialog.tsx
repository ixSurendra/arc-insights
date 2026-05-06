/**
 * Report scheduling dialog — Phase 1 UI only.
 *
 * Captures cadence, time, day-of, recipients, and format. The actual
 * delivery wires in Phase 2 (P2-13 — graphile-worker + tenant SMTP +
 * license-service quotas). Saving here only updates the in-memory
 * reports store; nothing fires.
 */
import { Mail, X } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/Button";
import { useReports } from "./store";
import type { Cadence, Schedule } from "./types";

interface Props {
  reportId: string;
  current: Schedule | undefined;
  onClose: () => void;
}

const CADENCE_LABEL: Record<Cadence, string> = {
  daily: "Every day",
  weekly: "Every week",
  monthly: "Every month",
  quarterly: "Every quarter",
};

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function ScheduleDialog({ reportId, current, onClose }: Props) {
  const setSchedule = useReports((s) => s.setSchedule);
  const [draft, setDraft] = useState<Schedule>(
    () =>
      current ?? {
        enabled: true,
        cadence: "weekly",
        time: "08:00",
        dayOf: 1,
        recipients: [],
        format: "pdf+csv",
      },
  );
  const [recipientInput, setRecipientInput] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSchedule(reportId, draft);
    onClose();
  };

  const onRemove = () => {
    setSchedule(reportId, undefined);
    onClose();
  };

  const addRecipient = () => {
    const v = recipientInput.trim();
    if (!v) return;
    if (draft.recipients.includes(v)) return;
    setDraft({ ...draft, recipients: [...draft.recipients, v] });
    setRecipientInput("");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Schedule report"
      onClick={onClose}
      style={overlayStyle}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={onSubmit}
        style={dialogStyle}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "var(--space-3)",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "var(--text-lg)",
                fontWeight: 600,
                color: "var(--color-fg)",
              }}
            >
              Schedule delivery
            </h2>
            <p
              style={{
                margin: "var(--space-1) 0 0",
                fontSize: "var(--text-sm)",
                color: "var(--color-fg-muted)",
              }}
            >
              Phase 1 saves the schedule. Email + Slack delivery wire in Phase 2
              along with tenant SMTP and quota gating.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--color-fg-muted)",
              cursor: "pointer",
              padding: 4,
            }}
          >
            <X size={16} />
          </button>
        </div>

        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-2)",
            fontSize: "var(--text-sm)",
            color: "var(--color-fg)",
          }}
        >
          <input
            type="checkbox"
            checked={draft.enabled}
            onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })}
          />
          Enabled — pause delivery without losing the schedule
        </label>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "var(--space-3)",
          }}
        >
          <Field label="Cadence">
            <select
              value={draft.cadence}
              onChange={(e) =>
                setDraft({ ...draft, cadence: e.target.value as Cadence })
              }
              style={inputStyle}
            >
              {Object.entries(CADENCE_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Time of day">
            <input
              type="time"
              value={draft.time}
              onChange={(e) => setDraft({ ...draft, time: e.target.value })}
              style={inputStyle}
            />
          </Field>
        </div>

        {draft.cadence === "weekly" && (
          <Field label="Day of week">
            <select
              value={draft.dayOf ?? 1}
              onChange={(e) =>
                setDraft({ ...draft, dayOf: Number(e.target.value) })
              }
              style={inputStyle}
            >
              {WEEKDAYS.map((d, i) => (
                <option key={d} value={i}>
                  {d}
                </option>
              ))}
            </select>
          </Field>
        )}
        {draft.cadence === "monthly" && (
          <Field label="Day of month (1–28)">
            <input
              type="number"
              min={1}
              max={28}
              value={draft.dayOf ?? 1}
              onChange={(e) =>
                setDraft({ ...draft, dayOf: Number(e.target.value) })
              }
              style={inputStyle}
            />
          </Field>
        )}

        <Field label="Recipients">
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <input
              type="email"
              value={recipientInput}
              onChange={(e) => setRecipientInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addRecipient();
                }
              }}
              placeholder="user@acme.com"
              aria-label="Add recipient"
              style={{ ...inputStyle, flex: 1 }}
            />
            <Button type="button" variant="secondary" onClick={addRecipient}>
              Add
            </Button>
          </div>
          {draft.recipients.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                marginTop: "var(--space-2)",
              }}
            >
              {draft.recipients.map((r) => (
                <span
                  key={r}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "2px 8px",
                    background: "var(--color-bg-subtle)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-full)",
                    fontSize: 11,
                    color: "var(--color-fg)",
                  }}
                >
                  <Mail size={11} style={{ color: "var(--color-fg-subtle)" }} />
                  {r}
                  <button
                    type="button"
                    aria-label={`Remove ${r}`}
                    onClick={() =>
                      setDraft({
                        ...draft,
                        recipients: draft.recipients.filter((x) => x !== r),
                      })
                    }
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--color-fg-subtle)",
                      padding: 0,
                      fontSize: 11,
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </Field>

        <Field label="Format">
          <div
            role="radiogroup"
            style={{ display: "flex", gap: "var(--space-2)" }}
          >
            {(["pdf", "pdf+csv"] as const).map((f) => {
              const active = draft.format === f;
              return (
                <button
                  key={f}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setDraft({ ...draft, format: f })}
                  style={{
                    padding: "4px 10px",
                    border: "1px solid",
                    borderColor: active
                      ? "var(--color-primary)"
                      : "var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    background: active
                      ? "var(--color-bg-elev)"
                      : "var(--color-bg)",
                    color: active ? "var(--color-fg)" : "var(--color-fg-muted)",
                    fontFamily: "inherit",
                    fontSize: "var(--text-sm)",
                    cursor: "pointer",
                  }}
                >
                  {f === "pdf" ? "PDF only" : "PDF + CSV per widget"}
                </button>
              );
            })}
          </div>
        </Field>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "var(--space-2)",
            paddingTop: "var(--space-2)",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          {current && (
            <Button type="button" variant="ghost" onClick={onRemove}>
              Remove schedule
            </Button>
          )}
          <div
            style={{
              display: "flex",
              gap: "var(--space-2)",
              marginLeft: "auto",
            }}
          >
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save schedule
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--color-fg-subtle)",
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 30,
  background: "rgba(10, 14, 23, 0.65)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "var(--space-6)",
};

const dialogStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 520,
  background: "var(--color-bg-elev)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-lg)",
  padding: "var(--space-5)",
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-4)",
  boxShadow: "var(--shadow-lg)",
  maxHeight: "90vh",
  overflow: "auto",
};

const inputStyle: React.CSSProperties = {
  padding: "var(--space-2) var(--space-3)",
  background: "var(--color-bg)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-md)",
  fontFamily: "inherit",
  fontSize: "var(--text-sm)",
  color: "var(--color-fg)",
};
