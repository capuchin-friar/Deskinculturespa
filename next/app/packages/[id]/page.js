"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "./styles/xxl.css";
import "./styles/mobile.css";
import "./styles/tablet.css";
import "./styles/ipad.css";

import Formatter from "../../../src/utils/formatter";
import { baseApi } from "../../api/shared/config";
import usePackageToggler from "../../../src/hooks/packageToggler";

export default function PackageDetail() {
    const params = useParams();
    const router = useRouter();
    const [packageItem, setPackageItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [bookingBusy, setBookingBusy] = useState(false);
    const [bookingError, setBookingError] = useState("");
    const { activeBookings, isBooked, togglePackage, loading: bookingsLoading } = usePackageToggler();

    useEffect(() => {
        const id = params?.id;
        if (!id) {
            setLoading(false);
            return;
        }

        let cancelled = false;
        (async () => {
            try {
                const { data } = await baseApi.get(`customers/packages/${id}`);
                if (!data?.success) {
                    throw new Error(data?.message || "Failed to fetch package");
                }
                if (!cancelled) setPackageItem(data.data || null);
            } catch (error) {
                console.error("Failed to fetch package:", error);
                if (!cancelled) setPackageItem(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [params?.id]);

    if (loading) {
        return (
            <main className="package-detail-not-found">
                <h1>Loading package</h1>
            </main>
        );
    }

    if (!packageItem) {
        return (
            <main className="package-detail-not-found">
                <h1>Package not found</h1>
                <button onClick={() => router.push("/packages")}>
                    Back to packages
                </button>
            </main>
        );
    }

    const image = packageItem.thumbnail_url || packageItem.image_url || "/spa.png";
    const gallery = [image];
    const includes = Array.isArray(packageItem.includes) ? packageItem.includes : [];
    const duration = packageItem.duration
        || (packageItem.duration_months
            ? `${packageItem.duration_months} month${Number(packageItem.duration_months) === 1 ? "" : "s"}`
            : "");

    function formatPrice(price) {
        return `₦${Formatter.formatRevenue(price)}`;
    }

    const booked = isBooked(packageItem.id);

    async function handleBooking() {
        setBookingError("");
        if (booked) {
            router.push("/packages/schedule");
            return;
        }
        try {
            setBookingBusy(true);
            await togglePackage({ packageId: packageItem.id });
            router.push("/packages/schedule");
        } catch (error) {
            const message = error?.message || "Could not book this package.";
            if (/sign in|authentication required/i.test(message)) {
                router.push(`/login?page=package&data=${packageItem.id}`);
                return;
            }
            setBookingError(message);
        } finally {
            setBookingBusy(false);
        }
    }

    return (
        <main className="package-detail-page">
            <div className="package-detail-container">
                <div className="package-breadcrumb">
                    <button onClick={() => router.push("/packages")}>
                        Packages
                    </button>
                    <span>/</span>
                    <span>{packageItem.name}</span>
                </div>

                <section className="package-detail-hero">
                    <div className={`package-gallery${gallery.length > 1 ? "" : " package-gallery--single"}`}>
                        {gallery.length > 1 ? (
                            <div className="package-gallery-thumbnails">
                                {gallery.map((src, index) => (
                                    <button
                                        key={index}
                                        className={`package-gallery-thumbnail ${
                                            activeImage === index ? "active" : ""
                                        }`}
                                        onClick={() => setActiveImage(index)}
                                    >
                                        <img
                                            src={src}
                                            alt={`${packageItem.name} ${index + 1}`}
                                        />
                                    </button>
                                ))}
                            </div>
                        ) : null}

                        <div className="package-main-image">
                            <img src={gallery[activeImage]} alt={packageItem.name} />
                        </div>
                    </div>

                    <div className="package-detail-information">
                        <h1>{packageItem.name}</h1>

                        <div className="package-detail-price">
                            {formatPrice(packageItem.price)}
                        </div>

                        {duration ? (
                            <div className="package-detail-duration">
                                <span className="duration-icon">◷</span>
                                <div>
                                    <span>Program duration</span>
                                    <strong>{duration}</strong>
                                </div>
                            </div>
                        ) : null}

                        <p className="package-detail-description">
                            {packageItem.description}
                        </p>

                        <div className="package-detail-divider" />

                        <div className="package-detail-actions">
                            <button
                                className="package-book-button"
                                onClick={handleBooking}
                                disabled={bookingBusy || bookingsLoading}
                            >
                                {bookingBusy
                                    ? "Adding package…"
                                    : booked
                                        ? "Arrange package visit"
                                        : "Book This Package"}
                                <span>→</span>
                            </button>
                            {bookingError ? (
                                <p className="package-detail-description" role="alert">{bookingError}</p>
                            ) : null}
                        </div>
                    </div>
                </section>

                <section className="package-overview-section">
                    <div className="package-section-heading">
                        <span>ABOUT THIS PACKAGE</span>
                        <h2>
                            Designed around your
                            <br />
                            skin & wellness goals
                        </h2>
                    </div>
                    <div className="package-overview-content">
                        <p>{packageItem.description}</p>
                    </div>
                </section>

                {includes.length > 0 ? (
                    <section className="package-includes-section">
                        <div className="package-section-heading">
                            <span>WHAT&apos;S INCLUDED</span>
                            <h2>
                                Everything included
                                <br />
                                in your package
                            </h2>
                        </div>
                        <div className="package-includes-grid">
                            {includes.map((item, index) => (
                                <div className="package-include-card" key={index}>
                                    <div className="include-number">
                                        {String(index + 1).padStart(2, "0")}
                                    </div>
                                    &nbsp;&nbsp;&nbsp;
                                    <br />
                                    <div>
                                        <span className="include-check">✓</span>
                                        <p>{item}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ) : null}

                <section className="package-detail-cta">
                    <div>
                        <span>DESKINCULTURESPA</span>
                        <h2>
                            Your skin.
                            <br />
                            Your body.
                            <br />
                            Your moment of self-care.
                        </h2>
                    </div>
                    <button onClick={handleBooking} disabled={bookingBusy || bookingsLoading}>
                        {booked ? "Arrange package visit" : "Book This Package"}
                        <span>→</span>
                    </button>
                </section>
            </div>
        </main>
    );
}
