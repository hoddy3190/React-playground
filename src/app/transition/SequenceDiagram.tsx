import styles from "./demo.module.css";

export type Step =
  | { from: number; to: number; label: string; dashed?: boolean; kind?: "warn" | "ok" }
  | { note: number; label: string; kind?: "warn" | "ok" };

const COL_X = [90, 270, 450, 650];
const WIDTH = 760;
const HEAD_H = 36;
const TOP = 70;
const ROW = 46;
const NOTE_W = 190;

export default function SequenceDiagram({
  participants,
  steps,
  title,
}: {
  participants: string[];
  steps: Step[];
  title: string;
}) {
  const height = TOP + steps.length * ROW + 30;
  return (
    <div className={styles.seqWrap}>
      <svg
        className={styles.seq}
        viewBox={`0 0 ${WIDTH} ${height}`}
        role="img"
        aria-label={title}
      >
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="#3f3f46" />
          </marker>
        </defs>

        {participants.map((p, i) => (
          <g key={p}>
            <line x1={COL_X[i]} y1={HEAD_H + 8} x2={COL_X[i]} y2={height - 10} stroke="#d4d4d8" strokeDasharray="4 4" />
            <rect x={COL_X[i] - 75} y={8} width={150} height={HEAD_H} rx={6} fill="#f4f4f5" stroke="#a1a1aa" />
            <text x={COL_X[i]} y={8 + HEAD_H / 2 + 5} textAnchor="middle" fontSize="14" fontWeight="600" fill="#18181b">
              {p}
            </text>
          </g>
        ))}

        {steps.map((s, i) => {
          const y = TOP + i * ROW + ROW / 2;
          const color = s.kind === "warn" ? "#b91c1c" : s.kind === "ok" ? "#15803d" : "#18181b";
          if ("note" in s) {
            const fill = s.kind === "warn" ? "#fee2e2" : s.kind === "ok" ? "#dcfce7" : "#fef9c3";
            return (
              <g key={i}>
                <rect x={COL_X[s.note] - NOTE_W / 2} y={y - 15} width={NOTE_W} height={30} rx={4} fill={fill} stroke="#d4d4d8" />
                <text x={COL_X[s.note]} y={y + 5} textAnchor="middle" fontSize="12.5" fill={color}>
                  {s.label}
                </text>
              </g>
            );
          }
          const x1 = COL_X[s.from];
          const x2 = COL_X[s.to];
          return (
            <g key={i}>
              <line
                x1={x1}
                y1={y + 6}
                x2={x2 + (x2 > x1 ? -2 : 2)}
                y2={y + 6}
                stroke="#3f3f46"
                strokeWidth={1.5}
                strokeDasharray={s.dashed ? "5 4" : undefined}
                markerEnd="url(#arrow)"
              />
              <text x={(x1 + x2) / 2} y={y - 2} textAnchor="middle" fontSize="12.5" fill={color}>
                {s.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
