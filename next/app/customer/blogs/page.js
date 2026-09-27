import Link from "next/link";
import "./style/xxl.css";


const posts = [
    {
        category: "SKINCARE",
        title: "How to Build a Simple Skincare Routine",
        date: "September 12, 2026",
        image: "/images/blog/skincare-routine.jpg"
    },
    {
        category: "WELLNESS",
        title: "Why Consistency Matters More Than Complexity",
        date: "September 05, 2026",
        image: "/images/blog/consistency.jpg"
    },
    {
        category: "SELF CARE",
        title: "Creating a Better Self-Care Ritual",
        date: "August 28, 2026",
        image: "/images/blog/self-care.jpg"
    },
    {
        category: "SKIN HEALTH",
        title: "Understanding Your Skin Barrier",
        date: "August 20, 2026",
        image: "/images/blog/skin-barrier.jpg"
    }
];

export default function BlogsPage() {
    return (
        <main className="dsc-blogs-page">

            <section className="dsc-blogs-header">

                <span>THE DSC JOURNAL</span>

                <h1>
                    Beauty, skin &<br />
                    <em>wellness.</em>
                </h1>

                <p>
                    Practical insights, skincare education,
                    wellness inspiration, and stories from
                    De Skin Culture.
                </p>

            </section>


            <section className="dsc-blogs-featured">

                <div className="dsc-blog-featured-image">
                    <div>
                        FEATURED
                    </div>
                </div>

                <div className="dsc-blog-featured-content">

                    <span>FEATURED ARTICLE</span>

                    <h2>
                        Your skin deserves
                        a thoughtful routine.
                    </h2>

                    <p>
                        Discover how understanding your skin,
                        simplifying your routine, and staying
                        consistent can transform the way you
                        approach skincare.
                    </p>

                    <Link href="#">
                        Read Article →
                    </Link>

                </div>

            </section>


            <section className="dsc-blogs-grid-section">

                <div className="dsc-blogs-section-heading">

                    <span>LATEST STORIES</span>

                    <h2>
                        From our journal
                    </h2>

                </div>

                <div className="dsc-blogs-grid">

                    {posts.map((post, index) => (

                        <article
                            className="dsc-blog-card"
                            key={index}
                        >

                            <div className="dsc-blog-card-image">
                                <span>
                                    {post.category}
                                </span>
                            </div>

                            <div className="dsc-blog-card-content">

                                <small>
                                    {post.date}
                                </small>

                                <h3>
                                    {post.title}
                                </h3>

                                <Link href="#">
                                    Read more →
                                </Link>

                            </div>

                        </article>

                    ))}

                </div>

            </section>

        </main>
    );
}