import Link from "next/link";
import "./style/xxl.css";
import "./style/mobile.css";
import "./style/tablet.css";
import "./style/ipad.css";

export default function BlogsPage() {
  return (
    <main className="dsc-blogs-page">
      <section className="dsc-blogs-header">
        <span>THE DSC JOURNAL</span>
        <h1>Beauty, skin &amp; <em>wellness.</em></h1>
        <p>Ideas and stories from De Skin Culture.</p>
      </section>
      <section className="dsc-blogs-empty" aria-labelledby="dsc-blogs-empty-title">
        <span className="dsc-blogs-empty-mark" aria-hidden="true">DSC</span>
        <div>
          <span className="dsc-blogs-kicker">THE JOURNAL</span>
          <h2 id="dsc-blogs-empty-title">New stories are on their way.</h2>
          <p>There are no published articles to read right now. Please check back soon.</p>
          <Link href="/customer/about">Discover De Skin Culture <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
    </main>
  );
}
