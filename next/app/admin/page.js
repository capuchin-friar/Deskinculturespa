"use client"
import "./styles/mobile.css";
import "./styles/tablet.css";
import "./styles/laptop.css";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLoader from "@/src/components/admin/AdminLoader";
import {
    IoPeopleOutline,
    IoCartOutline,
    IoTrendingUpOutline,
    IoEyeOutline,
    IoBagHandleOutline,
    IoSparklesOutline,
    IoCalendarOutline,
    IoCheckmarkCircle,
    IoLocationOutline,
    IoPersonOutline,
    IoArrowForward,
    IoBriefcaseOutline,
} from "react-icons/io5";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Legend,
    Tooltip
} from "recharts";




const renderOrdersCards = ((orders) => {

    return (
        <>
            {
                orders.map(({ name, value, svg, type }, index) =>
                    <div key={index}>
                        {
                            <OrderCard name={name} svg={svg} value={value} />
                        }
                    </div>
                )
            }

        </>
    )
});

const renderOverviewCards = ((overview) => {

    return (
        <>
            <div className="overview-cnt">
                {
                    overview.map(({ name, value, svg }, index) =>
                        <MetricCard key={index} name={name} svg={svg} value={value} />
                    )
                }
            </div>

        </>
    )
});



function toCount(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}

function formatNaira(value) {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(toCount(value));
}

function formatActivityDate(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function formatActivityTime(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export default function page() {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let mounted = true;
        fetch("/api/admin/dashboard", { credentials: "include" })
            .then(async (response) => {
                const result = await response.json();
                if (!response.ok || !result.success) {
                    throw new Error(result.data || result.message || "Could not load dashboard.");
                }
                if (mounted) setMetrics(result.data);
            })
            .catch((err) => {
                if (mounted) setError(err.message || "Could not load dashboard.");
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });
        return () => {
            mounted = false;
        };
    }, []);

    const overview = [
        {
            name: "Total customers",
            value: toCount(metrics?.overview?.customers),
            svg: IoPeopleOutline,
        },
        {
            name: "Total orders",
            value: toCount(metrics?.overview?.orders),
            svg: IoCartOutline,
        },
        {
            name: "Revenue",
            value: formatNaira(metrics?.overview?.revenue),
            svg: IoTrendingUpOutline,
        }
    ];

    const catalog = [
        {
            name: "Products listed",
            value: toCount(metrics?.catalogue?.products),
            svg: IoBagHandleOutline,
        },
        {
            name: "Services offered",
            value: toCount(metrics?.catalogue?.services),
            svg: IoSparklesOutline,
        },
        {
            name: "Appointments",
            value: toCount(metrics?.catalogue?.appoinment_offerings),
            svg: IoCalendarOutline,
        }
    ];

    if (loading) {
        return <AdminLoader label="Loading dashboard" />;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <>
            {
                [
                    { title: "Bussiness Overview", jsx: renderOverviewCards([...overview, ...catalog]) },
                    { title: "Business Summary", jsx: <OrderBreakdown metrics={metrics} /> },
                ].map((content, i) =>
                    <div key={i}>
                        <Headline title={`${i + 1}. ${content.title}`} />

                        <div>{content.jsx}</div>
                    </div>
                )
            }
        </>
    )
}

function MetricCard({
    name,
    value,
    svg: Icon
}) {
    return (
        <div className="admin-metric-card">
            <span className="shadow-md">
                <Icon size={22} />
            </span>

            <span>
                <p>{name}</p>
                <h3>{value}</h3>
            </span>
        </div>
    );
}

function OrderBreakdown({
    metrics
}) {
    const router = useRouter();
    const [activityKind, setActivityKind] = useState("products");

    const orderData = [
        {
            name: "Products",
            value: toCount(metrics?.orderBreakdown?.products)
        },
        {
            name: "Services",
            value: toCount(metrics?.bookingBreakdown?.paid_bookings)
        },
        {
            name: "Appointments",
            value: toCount(metrics?.appointmentBreakdown?.paid_appointments)
        }
    ];

    const revenueData = [
        {
            name: "Products",
            value: toCount(metrics?.overview?.revenue)
        },
        {
            name: "Services",
            value: toCount(metrics?.bookingBreakdown?.paid_revenue)
        },
        {
            name: "Appointments",
            value: toCount(metrics?.appointmentBreakdown?.paid_revenue)
        }
    ];

    const activities = useMemo(() => {
        const rows = Array.isArray(metrics?.recentActivity) ? metrics.recentActivity : [];
        if (activityKind === "all") return rows;
        const match = {
            products: "product",
            services: "service",
            appointment: "appointment",
            appointments: "appointment",
            packages: "package",
            package: "package",
        }[activityKind];
        if (!match) return rows;
        return rows.filter((row) => row.kind === match);
    }, [metrics?.recentActivity, activityKind]);

    const data = orderData;

    const COLORS = [
        "#278a3d", // brand-green
        "#0b3b1a", // brand-dark
        "#63d94f", // brand-light
    ];


    const totalOrders = data.reduce(
        (total, item) => total + item.value,
        0
    );

    return (
        <>
            <div className="summary-cnt">
                <section className="chart-cnt">
                    <div style={{ width: "100%", height: 200, background: '#fff' }}>
                        <div style={{ margin: "15px 0px 0px 15px" }}>
                            <Headline title={"Order Breakdown"} />
                        </div>
                        <ResponsiveContainer width="90%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={35}
                                    outerRadius={55}
                                    paddingAngle={0}
                                    stroke="none"
                                >
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend
                                    verticalAlign="middle"
                                    align="right"
                                    layout="vertical"
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center text */}
                        <div>
                            {/* <span>{totalOrders}</span> */}
                            {/* <span>Total Orders</span> */}
                        </div>
                    </div>
                    <div style={{ width: "100%", height: 200, background: '#fff' }}>
                        <div style={{ margin: "15px 0px 0px 15px" }}>
                            <Headline title={"Revenue Breakdown"} />
                        </div>
                        <ResponsiveContainer width="90%" height="100%">
                            <PieChart>
                                <Pie
                                    data={revenueData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={35}
                                    outerRadius={55}
                                    paddingAngle={0}
                                    stroke="none"
                                >
                                    {revenueData.map((entry, index) => (
                                        <Cell
                                            key={`rev-cell-${index}`}
                                            fill={COLORS[index]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => formatNaira(value)} />
                                <Legend
                                    verticalAlign="middle"
                                    align="right"
                                    layout="vertical"
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center text */}
                        <div>
                            {/* <span>{totalOrders}</span> */}
                            {/* <span>Total Orders</span> */}
                        </div>
                    </div>
                </section>
                <section className="activity-cnt">
                    <div className="activity-headline">
                        <div className="input-cnt">
                            <label htmlFor="activity-kind">Paid Orders</label>
                            <select id="activity-kind" value={activityKind} onChange={(event) => setActivityKind(event.target.value)}>
                                <option value="products">Products</option>
                                <option value="services">Services</option>
                                <option value="appointments">Appointments</option>
                                <option value="packages">Packages</option>
                            </select>
                        </div>
                        <button className="view-all" type="button" onClick={() => router.push("/admin/orders")}>
                            <span>View all {""}</span>
                            &nbsp;
                            &nbsp;
                            <span>
                                <IoArrowForward fontWeight={"bold"} />
                            </span>
                        </button>
                    </div>

                    <div className="activity-card-cnt">
                        {activities.length === 0 ? (
                            <p>No activity recorded yet.</p>
                        ) : activities.map((a) => (
                            <PaidItemCard
                                key={`${a.kind}-${a.id}`}
                                type={a.kind}
                                title={a.title}
                                image={a.image_url}
                                price={formatNaira(a.amount)}
                                date={formatActivityDate(a.scheduled_at || a.created_at)}
                                time={formatActivityTime(a.scheduled_at || a.created_at)}
                                quantity={a.kind === "product" ? null : null}
                                provider={a.customer}
                                location=""
                                status={a.status}
                                onClick={() => router.push(`/admin/orders/${a.id}?kind=${encodeURIComponent(a.kind)}`)}
                            />
                        ))}
                    </div>
                </section>
            </div>

        </>
    )
}


function OrderCard({
    name,
    value,
    svg: Icon
}) {
    return (
        <>
            <div>
                <span>
                    <Icon size={35} />
                </span>
                <span>
                    <p>{name}</p>
                    <h3>{value}</h3>
                </span>
            </div>
        </>
    )
}

function Headline({
    title
}) {
    return (
        <p className="admin-section-title">{title}</p>
    )
}

const PaidItemCard = ({
    type = "appointment",
    title,
    image,
    price,
    date,
    time,
    quantity,
    provider,
    location,
    status = "Paid",
    onClick,
}) => {
    const isAppointment = type === "appointment";
    const isProduct = type === "product";
    const isService = type === "service";
    const isPackage = type === "package";

    const getIcon = () => {
        if (isAppointment) return <IoCalendarOutline />;
        if (isProduct) return <IoBagHandleOutline />;
        if (isPackage) return <IoSparklesOutline />;
        return <IoBriefcaseOutline />;
    };

    const getLabel = () => {
        if (isAppointment) return "Appointment";
        if (isProduct) return "Product";
        if (isPackage) return "Package";
        return "Service";
    };

    return (
        <div className="paid-item-card">
            {/* Image / Icon */}
            <div className="paid-item-image-wrapper">
                {image ? (
                    <img
                        src={image}
                        alt={title}
                        className="paid-item-image"
                    />
                ) : (
                    <div className="paid-item-icon">
                        {getIcon()}
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="paid-item-content">
                <div className="paid-item-top">
                    <div>
                        <span className="paid-item-type">
                            {getIcon()}
                            {getLabel()}
                        </span>

                        <h3 className="paid-item-title">
                            {title}
                        </h3>
                    </div>

                    <div className="paid-status">
                        <IoCheckmarkCircle />
                        {status}
                    </div>
                </div>

                <div className="paid-item-details">
                    {isAppointment && (
                        <>
                            {date && (
                                <div className="paid-detail">
                                    <IoCalendarOutline />
                                    <span>{date}</span>
                                </div>
                            )}

                            {time && (
                                <div className="paid-detail">
                                    <span className="detail-label">Time:</span>
                                    <span>{time}</span>
                                </div>
                            )}

                            {provider && (
                                <div className="paid-detail">
                                    <IoPersonOutline />
                                    <span>{provider}</span>
                                </div>
                            )}

                            {location && (
                                <div className="paid-detail">
                                    <IoLocationOutline />
                                    <span>{location}</span>
                                </div>
                            )}
                        </>
                    )}

                    {isProduct && (
                        <>
                            {quantity && (
                                <div className="paid-detail">
                                    <span className="detail-label">Quantity:</span>
                                    <span>{quantity}</span>
                                </div>
                            )}

                            {provider && (
                                <div className="paid-detail">
                                    <IoPersonOutline />
                                    <span>{provider}</span>
                                </div>
                            )}

                            {location && (
                                <div className="paid-detail">
                                    <IoLocationOutline />
                                    <span>{location}</span>
                                </div>
                            )}
                        </>
                    )}

                    {isService && (
                        <>
                            {provider && (
                                <div className="paid-detail">
                                    <IoPersonOutline />
                                    <span>{provider}</span>
                                </div>
                            )}

                            {location && (
                                <div className="paid-detail">
                                    <IoLocationOutline />
                                    <span>{location}</span>
                                </div>
                            )}

                            {date && (
                                <div className="paid-detail">
                                    <IoCalendarOutline />
                                    <span>{date}</span>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Price + Action */}
            <div className="paid-item-right">
                <div className="paid-item-price">
                    {price}
                </div>

                <button
                    type="button"
                    className="paid-item-action"
                    onClick={onClick}
                >
                    View
                    <IoArrowForward />
                </button>
            </div>
        </div>
    );
};
