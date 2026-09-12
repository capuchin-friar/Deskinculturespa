"use client";

const reasons = [
    {
        title: "Expert Skin Care",
        description: "Professional treatments designed around your skin.",
        icon: (
            <svg viewBox="0 0 24 24" fill="none">
                <path d="M3 21h18" />
                <path d="M5 21V10l7-6 7 6v11" />
                <path d="M9 21v-6h6v6" />
                <path d="M9 10h.01M15 10h.01M12 7h.01" />
            </svg>
        )
    },
    {
        title: "Personalized Treatment Planning",
        description: "Every treatment is tailored to your individual needs.",
        icon: (
            <svg viewBox="0 0 24 24" fill="none">
                <rect x="5" y="3" width="14" height="18" rx="2" />
                <path d="M9 7h6" />
                <path d="M9 11h6" />
                <path d="M9 15h3" />
                <path d="m15 15 1 1 2-2" />
            </svg>
        )
    },
    {
        title: "Natural-Looking Results",
        description: "Beautiful results that enhance your natural features.",
        icon: (
            <svg viewBox="0 0 24 24" fill="none">
                <path d="M4 20V10" />
                <path d="M10 20V6" />
                <path d="M16 20V12" />
                <path d="M22 20V3" />
                <path d="m4 7 6-3 6 2 6-3" />
            </svg>
        )
    },
    {
        title: "Licensed Clinical Care",
        description: "Professional care delivered by trained specialists.",
        icon: (
            <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 21s8-3.5 8-10V5l-8-3-8 3v6c0 6.5 8 10 8 10Z" />
                <path d="M12 7v6" />
                <path d="M9 10h6" />
            </svg>
        )
    }
];

export default function WhyChooseUs() {
    return (
        <section className="why-choose-us">

            <div className="why-choose-header">
                <h2>Why Patients Choose De Skin Culture</h2>
            </div>

            <div className="why-choose-list">

                {reasons.map((reason, index) => (
                    <div className="why-choose-item" key={index}>

                        <div className="why-choose-icon">
                            {reason.icon}
                        </div>

                        <div className="why-choose-content">
                            <h3>{reason.title}</h3>

                            <p>
                                {reason.description}
                            </p>
                        </div>

                    </div>
                ))}

            </div>

        </section>
    );
}