import Link from "next/link";
import styles from "./demo.module.css";
import SequenceDiagram, { type Step } from "./SequenceDiagram";

const PARTICIPANTS = ["ユーザー", "onClick / action", "React", "画面（Suspense）"];

const SEQ_WITH: Step[] = [
  { from: 0, to: 1, label: "クリック（0ms）" },
  { from: 1, to: 2, label: "startTransition(async)" },
  { from: 2, to: 3, label: "isPending = true" },
  { note: 1, label: "await sleep(1000)" },
  { from: 1, to: 2, label: "startTransition(setTab)" },
  { note: 2, label: "TransitionLane で描画" },
  { note: 2, label: "use() で suspend" },
  { note: 2, label: "shouldRemain… = true", kind: "ok" },
  { from: 2, to: 3, label: "コミットしない（Home のまま）", dashed: true, kind: "ok" },
  { note: 2, label: "Promise 解決（~2500ms）" },
  { from: 2, to: 3, label: "About + isPending=false", kind: "ok" },
];

const SEQ_WITHOUT: Step[] = [
  { from: 0, to: 1, label: "クリック（0ms）" },
  { from: 1, to: 2, label: "startTransition(async)" },
  { from: 2, to: 3, label: "isPending = true" },
  { note: 1, label: "await sleep(1000)" },
  { from: 1, to: 2, label: "setTab（素の呼び出し）", kind: "warn" },
  { note: 2, label: "DefaultLane で描画", kind: "warn" },
  { note: 2, label: "use() で suspend" },
  { note: 2, label: "shouldRemain… = false", kind: "warn" },
  { from: 2, to: 3, label: "フォールバックをコミット", kind: "warn" },
  { from: 2, to: 3, label: "isPending = false（~1010ms）" },
  { note: 2, label: "Promise 解決（~2500ms）" },
  { from: 2, to: 3, label: "About をコミット", kind: "ok" },
];

type Row = { t: number; msg: string; kind?: "warn" | "ok" };

const WITH: Row[] = [
  { t: 0, msg: "クリック: About" },
  { t: 2, msg: "isPending = true" },
  { t: 1001, msg: "await 完了 → setState" },
  { t: 2513, msg: "✅ コンテンツ表示: About", kind: "ok" },
  { t: 2513, msg: "isPending = false" },
];

const WITHOUT: Row[] = [
  { t: 0, msg: "クリック: About" },
  { t: 1, msg: "isPending = true" },
  { t: 1000, msg: "await 完了 → setState" },
  { t: 1007, msg: "⚠️ Suspense フォールバック表示（前の画面が消えた）", kind: "warn" },
  { t: 1010, msg: "isPending = false" },
  { t: 2507, msg: "✅ コンテンツ表示: About", kind: "ok" },
  { t: 2507, msg: "✅ コンテンツ表示: About", kind: "ok" },
];

function Timeline({ rows }: { rows: Row[] }) {
  return (
    <ol className={styles.log}>
      {rows.map((r, i) => (
        <li key={i} className={r.kind === "warn" ? styles.fallback : undefined}>
          <code>{String(r.t).padStart(5)}ms</code> {r.msg}
        </li>
      ))}
    </ol>
  );
}

export default function Page() {
  return (
    <main className={styles.page}>
      <h1>useTransition: await の後の setState</h1>
      <p>2 つのページを見比べてください。</p>
      <div className={styles.links}>
        <Link href="/transition/with">✅ トランジションになる場合</Link>
        <Link href="/transition/without">❌ トランジションにならない場合</Link>
      </div>

      <h2>実測結果（About タブをクリック）</h2>

      <h3>✅ 包む（await の後も startTransition）</h3>
      <Timeline rows={WITH} />
      <p>
        前の画面を残したまま待ち、約 2.5 秒後にコンテンツ表示と isPending = false
        が同時に起きる。フォールバックは一度も出ない。
      </p>

      <h3>❌ 包まない（await の後に素の setState）</h3>
      <Timeline rows={WITHOUT} />
      <p>
        await 完了直後（約 1 秒）に setState が通常の更新として処理され、Suspense
        のフォールバックに切り替わって前の画面が消える。isPending もその時点で false
        に戻るので、実際の読み込みが終わる約 2.5 秒まで「pending ではないのに中身がない」状態になる。
      </p>
      <p>
        ※「コンテンツ表示」が 2 回出ているのは、フォールバックからの復帰でコンポーネントが新しくマウントされ、開発モードの
        StrictMode が effect を 2 回実行するため（挙動の違いとは無関係）。
      </p>

      <h2>シーケンス図</h2>
      <h3>✅ 包む</h3>
      <SequenceDiagram title="包む場合のシーケンス" participants={PARTICIPANTS} steps={SEQ_WITH} />
      <h3>❌ 包まない</h3>
      <SequenceDiagram title="包まない場合のシーケンス" participants={PARTICIPANTS} steps={SEQ_WITHOUT} />

      <h2>なぜフォールバックが出るのか</h2>
      <p>
        描画中に suspend したとき、フォールバックを出すかどうかは React の{" "}
        <code>shouldRemainOnPreviousScreen()</code>（
        <code>packages/react-reconciler/src/ReactFiberWorkLoop.js</code>
        ）が決めている。「前の画面のまま待つか、すぐフォールバックを出すか」を返す関数で、判定の軸は
        <strong>中断した更新がトランジションかどうか</strong>。
      </p>

      <h3>包まない場合に起きていること</h3>
      <ol className={styles.points}>
        <li>
          <code>await</code> の後の <code>setTab(&apos;About&apos;)</code>{" "}
          はトランジションの外で呼ばれるので、通常の更新（DefaultLane）になる。
        </li>
        <li>
          <code>&lt;Content tab=&quot;About&quot;&gt;</code> の <code>use()</code> の Promise
          が未解決なので、描画が suspend する。
        </li>
        <li>
          近くに <code>&lt;Suspense&gt;</code> があり、更新はトランジションでもないので、
          <code>shouldRemainOnPreviousScreen()</code> は <code>false</code>（すぐフォールバックを出す）を返す。
        </li>
        <li>
          React は Suspense をフォールバック表示に切り替えてコミットする。表示中だった Home は隠れる。
        </li>
        <li>Promise が解決すると再描画され、About が表示される。</li>
      </ol>

      <h3>包む場合は何が違うか</h3>
      <pre>{`if (includesOnlyTransitions(workInProgressRootRenderLanes)) {
  if (getShellBoundary() === null) {
    // すでに見えている中身が消えてしまうので、前の画面のまま待つ
    return true;
  } else {
    // 新しく出てくる中身なら、フォールバックを出してよい
    return false;
  }
}`}</pre>
      <p>
        更新がトランジション（TransitionLane）なのでこの分岐に入る。デモの{" "}
        <code>&lt;Suspense&gt;</code> はすでに Home を表示している境界なので <code>true</code>{" "}
        が返り、React はこの描画をコミットせず保留する。Home を表示したまま裏で Promise を待ち、その間{" "}
        <code>isPending</code> は <code>true</code> のまま。
      </p>

      <h3>なぜ React はこう分けているのか</h3>
      <ul className={styles.points}>
        <li>
          <strong>通常の更新</strong>
          は「すぐ反応を返すべき更新」。待つと UI が固まって見えるので、中身がなくてもすぐフォールバックを出す。
        </li>
        <li>
          <strong>トランジション</strong>
          は「遅れてもいい更新」。見えている中身を消してスピナーを出すより、前の画面を残して待つ方が体験が良い。
        </li>
        <li>
          ただしトランジションでも、前の画面になかった <code>&lt;Suspense&gt;</code>{" "}
          はフォールバックを出す。隠さないのは「すでに見えている中身」だけ。
        </li>
      </ul>

      <h3>タイムラインとの対応</h3>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>時刻</th>
            <th>包む</th>
            <th>包まない</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>~1000ms setTab → suspend</td>
            <td>トランジションなので前の画面のまま待つ</td>
            <td>通常の更新なので、すぐフォールバックをコミット</td>
          </tr>
          <tr>
            <td>~1010ms</td>
            <td>isPending は true のまま</td>
            <td>async action が終わり isPending = false</td>
          </tr>
          <tr>
            <td>~2500ms Promise 解決</td>
            <td>About をコミットし、同時に isPending = false</td>
            <td>フォールバックから About に切り替わる</td>
          </tr>
        </tbody>
      </table>
    </main>
  );
}
