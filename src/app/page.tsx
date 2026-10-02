import Link from "next/link";
import styles from "./home.module.css";

const DEMOS = [
  {
    href: "/transition",
    title: "useTransition: await の後の setState",
    description:
      "startTransition の中で await した後の setState がトランジション扱いになる場合（もう一度 startTransition で包む）とならない場合を比較するデモ。isPending の変化と Suspense フォールバックの出方をタイムラインで確認できる。",
  },
];

export default function Home() {
  return (
    <div className={styles.root}>
      <main className={styles.main}>
        <h1>React Playground</h1>
        <ul className={styles.list}>
          {DEMOS.map((d) => (
            <li key={d.href} className={styles.item}>
              <Link href={d.href} className={styles.link}>
                {d.title}
              </Link>
              <p>{d.description}</p>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
