import { useCallback } from "react";
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



export function Body() {

    const overview = [
        {
            name: "Total customers",
            value: 0,
            svg: IoPeopleOutline,
            duration: "",
            conversion: ""
        },
        {
            name: "Total orders",
            value: 0,
            svg: IoCartOutline,
            duration: "",
            conversion: ""
        },
        {
            name: "Revenue",
            value: 0,
            svg: IoTrendingUpOutline,
            duration: "",
            conversion: ""
        }
    ];

    const orderBreakdown = [

    ];

    const catalog = [
        {
            name: "Products listed",
            value: 0,
            svg: IoBagHandleOutline,
            summary: "Total products in catalog"
        },
        {
            name: "Services offered",
            value: 0,
            svg: IoSparklesOutline,
            summary: "Total services in catalog"
        },
        {
            name: "Appointments",
            value: 0,
            svg: IoCalendarOutline,
            summary: "Total appointment offers"
        }
    ];



    return (
        <>
            <main>
                {
                    [
                        { title: "Bussiness Overview", jsx: renderOverviewCards([...overview, ...catalog]) },
                        { title: "Business Summary", jsx: <OrderBreakdown /> },
                    ].map((content, i) =>
                        <div key={i}>
                            <Headline title={`${i + 1}. ${content.title}`} />

                            <div>{content.jsx}</div>
                        </div>
                    )
                }
            </main>
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
            <span>
                <Icon size={35} />
            </span>

            <span>
                <p>{name}</p>
                <h3><b>{value}</b></h3>
            </span>
        </div>
    );
}

function OrderBreakdown({
    products = [],
    services = [],
    appointments = []
}) {

    const data = [
        {
            name: "Products",
            value: 53
        },
        {
            name: "Services",
            value: 41
        },
        {
            name: "Appointments",
            value: 32
        }
    ];

    const COLORS = [
        "#5B21B6",
        "#EC4899",
        "#FBBF24"
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
                </section>
                <section className="activity-cnt">
                    <div className="activity-headline">
                        <div className="input-cnt">
                            <span>Activities: </span>
                            <select name="" id="">
                                <option value="">Select activity</option>
                                <option value="all">All</option>
                                <option value="products">Products</option>
                                <option value="services">Services</option>
                                <option value="appointments">Appointments</option>
                            </select>
                        </div>
                        <button className="view-all">
                            <span>View all {""}</span>
                            &nbsp;
                            &nbsp;
                            <span>
                                <IoArrowForward fontWeight={"bold"} />
                            </span>
                        </button>
                    </div>

                    <div className="activity-card-cnt">
                        {
                            [
                                {
                                    type: "appointment",
                                    title: "Medical Consultation",
                                    image: "/images/appointment.jpg",
                                    price: "₦25,000",
                                    date: "September 5, 2026",
                                    time: "10:30 AM",
                                    provider: "Dr. James Okafor",
                                    location: "Lagos",
                                    status: "paid"
                                },
                                {
                                    type: "product",
                                    title: "iPhone 15 Pro Max",
                                    image: "/images/iphone.jpg",
                                    price: "₦1,250,000",
                                    quantity: 1,
                                    provider: "Fabian Store",
                                    location: "Lagos",
                                    status: "paid"
                                },
                                {
                                    type: "service",
                                    title: "Professional Website Development",
                                    image: "/images/web-development.jpg",
                                    price: "₦350,000",
                                    date: "September 10, 2026",
                                    provider: "ThetaSoft",
                                    location: "Lagos",
                                    status: "paid"
                                }
                            ].map((a, i) => (
                                <PaidItemCard
                                    key={i}
                                    type={a.type}
                                    title={a.title}
                                    image={a.image}
                                    price={a.price}
                                    date={a.date}
                                    time={a.time}
                                    quantity={a.quantity}
                                    provider={a.provider}
                                    location={a.location}
                                    status={a.status}
                                />
                            ))
                        }
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
        <p>{title}</p>
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

    const getIcon = () => {
        if (isAppointment) return <IoCalendarOutline />;
        if (isProduct) return <IoBagHandleOutline />;
        return <IoBriefcaseOutline />;
    };

    const getLabel = () => {
        if (isAppointment) return "Appointment";
        if (isProduct) return "Product";
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
