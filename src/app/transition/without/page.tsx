import Link from "next/link";
import TransitionDemo from "../TransitionDemo";
import styles from "../demo.module.css";

export default function Page() {
  return (
    <main className={styles.page}>
      <h1>❌ await の後に素の setState</h1>
      <pre>{`startTransition(async () => {
  await sleep(1000);
  setTab(next); // トランジション扱いにならない
});`}</pre>
      <p>
        タブを押して 1 秒後に isPending が false に戻り、そのあと前のコンテンツが Suspense
        のフォールバックに置き換わります。
      </p>
      <div className={styles.links}>
        <Link href="/transition/with">→ なる場合と比べる</Link>
      </div>
      <TransitionDemo mode="without" />
    </main>
  );
}
