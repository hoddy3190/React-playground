"use client";

import { Suspense, use, useEffect, useRef, useState, useTransition } from "react";
import styles from "./demo.module.css";

type Mode = "with" | "without";

const TABS = ["Home", "About", "Contact"] as const;
type Tab = (typeof TABS)[number];

const ACTION_DELAY = 1000; // await するアクション（例: POST）の時間
const LOAD_DELAY = 1500; // 遷移先コンテンツの読み込み時間（Suspense する）

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// タブごとのデータ取得 Promise をキャッシュ（use() で Suspense させる）
const cache = new Map<string, Promise<string>>();
function fetchContent(tab: Tab, version: number): Promise<string> {
  const key = `${tab}-${version}`;
  let p = cache.get(key);
  if (!p) {
    p =
      version === 0
        ? Promise.resolve(`${tab} のコンテンツ（初期表示）`)
        : sleep(LOAD_DELAY).then(() => `${tab} のコンテンツ（読み込み #${version}）`);
    cache.set(key, p);
  }
  return p;
}

type OnShow = (msg: string) => void;

function Content({ tab, version, onShow }: { tab: Tab; version: number; onShow: OnShow }) {
  const text = use(fetchContent(tab, version));
  useEffect(() => {
    if (version > 0) onShow(`✅ コンテンツ表示: ${tab}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, version]);
  return <p className={styles.content}>{text}</p>;
}

function Fallback({ onShow }: { onShow: OnShow }) {
  useEffect(() => {
    onShow("⚠️ Suspense フォールバック表示（前の画面が消えた）");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <p className={styles.fallback}>⏳ Suspense フォールバック表示中…</p>;
}

type LogEntry = { t: number; msg: string };

export default function TransitionDemo({ mode }: { mode: Mode }) {
  const [tab, setTab] = useState<Tab>("Home");
  const [version, setVersion] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const startRef = useRef(0);

  const log = (msg: string) => {
    const t = startRef.current ? Math.round(performance.now() - startRef.current) : 0;
    setLogs((prev) => [...prev, { t, msg }]);
  };

  useEffect(() => {
    if (startRef.current) log(`isPending = ${isPending}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending]);

  const onClick = (next: Tab) => {
    startRef.current = performance.now();
    setLogs([{ t: 0, msg: `クリック: ${next}` }]);
    const nextVersion = version + 1;

    startTransition(async () => {
      await sleep(ACTION_DELAY);
      log("await 完了 → setState");
      if (mode === "with") {
        // await の後でもう一度 startTransition で包む
        startTransition(() => {
          setTab(next);
          setVersion(nextVersion);
        });
      } else {
        // await の後の素の setState（トランジション扱いにならない）
        setTab(next);
        setVersion(nextVersion);
      }
    });
  };

  return (
    <div className={styles.demo}>
      <nav className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t}
            className={t === tab ? styles.activeTab : styles.tab}
            onClick={() => onClick(t)}
          >
            {t}
          </button>
        ))}
        <span className={isPending ? styles.pendingOn : styles.pendingOff}>
          isPending: {String(isPending)}
        </span>
      </nav>

      <div className={isPending ? styles.panelPending : styles.panel}>
        <Suspense fallback={<Fallback onShow={log} />}>
          <Content tab={tab} version={version} onShow={log} />
        </Suspense>
      </div>

      <h3>タイムライン</h3>
      <ol className={styles.log}>
        {logs.map((l, i) => (
          <li key={i}>
            <code>{String(l.t).padStart(5)}ms</code> {l.msg}
          </li>
        ))}
      </ol>
    </div>
  );
}
