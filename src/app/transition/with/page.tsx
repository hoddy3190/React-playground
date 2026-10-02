import Link from "next/link";
import TransitionDemo from "../TransitionDemo";
import styles from "../demo.module.css";

export default function Page() {
  return (
    <main className={styles.page}>
      <h1>✅ await の後も startTransition で包む</h1>
      <pre>{`startTransition(async () => {
  await sleep(1000);
  startTransition(() => {
    setTab(next);
  });
});`}</pre>
      <p>
        タブを押すと、前のコンテンツが薄く表示されたまま残り、読み込みが終わると一度で切り替わります。
        isPending は表示が切り替わるまで true のままです。
      </p>
      <div className={styles.links}>
        <Link href="/transition/without">→ ならない場合と比べる</Link>
      </div>
      <TransitionDemo mode="with" />
    </main>
  );
}
