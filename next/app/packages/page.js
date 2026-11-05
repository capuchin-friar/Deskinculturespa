"use client";

import { useRouter } from "next/navigation";
import "./styles/xxl.css";
import "./styles/mobile.css";
import "./styles/tablet.css";
import "./styles/ipad.css";
import { useEffect, useState } from "react";
import Formatter from "../../src/utils/formatter";
import { baseApi } from "../api/shared/config";

export default function Packages() {
    const router = useRouter();
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const { data } = await baseApi.get("customers/packages");
                if (!data?.success) {
                    throw new Error(data?.message || "Failed to fetch packages");
                }
                if (!cancelled) {
                    setPackages(Array.isArray(data.data) ? data.data : []);
                }
            } catch (error) {
                console.error("Failed to fetch packages:", error);
                if (!cancelled) setPackages([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    function handleClick(p) {
        router.push(`/packages/${p.id}`);
    }

    function formatPrice(price) {
        if (!price) return "₦0";
        return `₦${Formatter.formatRevenue(price)}`;
    }

    function getDuration(packageItem) {
        if (packageItem.duration) return packageItem.duration;
        if (packageItem.duration_months) {
            const months = Number(packageItem.duration_months);
            return `${months} month${months === 1 ? "" : "s"}`;
        }
        return "";
    }

    function packageImage(packageItem) {
        return packageItem.thumbnail_url || packageItem.image_url || "/spa.png";
    }

    return (
        <div className="customer-store">
            <section className="customer-store-package-card-cnt">
                {loading ? (
                    <div className="customer-store-empty">
                        <h3>Loading packages</h3>
                        <p>Fetching the latest plans from the spa.</p>
                    </div>
                ) : packages.length > 0 ? (
                    packages.map((p) => (
                        <article
                            className="customer-store-package-card"
                            key={p.id}
                            onClick={() => handleClick(p)}
                        >
                            <div
                                className="customer-store-package-thumbnail"
                                style={{
                                    backgroundImage: `url(${packageImage(p)})`,
                                }}
                            >
                                <div className="package-image-overlay" />
                            </div>

                            <div className="customer-store-package-body">
                                <div className="customer-store-package-content">
                                    <h2 className="customer-store-package-title">
                                        {p.name || "Package title"}
                                    </h2>
                                    <p className="customer-store-package-description">
                                        {p.description ||
                                            "A carefully designed spa experience created to support your skin, body and overall wellbeing."}
                                    </p>
                                </div>

                                {getDuration(p) ? (
                                    <div className="customer-store-package-meta">
                                        <div className="package-duration">
                                            <span className="package-meta-icon">◷</span>
                                            <span>{getDuration(p)}</span>
                                        </div>
                                    </div>
                                ) : null}

                                <div className="customer-store-package-footer">
                                    <div className="customer-store-package-price">
                                        {formatPrice(p.price)}
                                    </div>
                                    <button
                                        type="button"
                                        className="package-view-button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleClick(p);
                                        }}
                                    >
                                        View Details
                                        <span>→</span>
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))
                ) : (
                    <div className="customer-store-empty">
                        <div className="customer-store-empty-icon">✦</div>
                        <h3>No packages found</h3>
                        <p>There are no packages listed yet. Check back soon.</p>
                    </div>
                )}
            </section>
        </div>
    );
}
