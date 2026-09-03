import { useCallback } from "react";
import {
    IoPeopleOutline,
    IoCartOutline,
    IoTrendingUpOutline,
    IoEyeOutline,
    IoBagHandleOutline,
    IoSparklesOutline,
    IoArrowForward,
    IoCalendarOutline
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
                    <div style={{ width: "80%", height: 200, background: '#fff' }}>
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
                    <div style={{ width: "80%", height: 200, background: '#fff' }}>
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
                            <select name="" id="">
                                <option value="">Select activity</option>
                                <option value="products">Products</option>
                                <option value="services">Services</option>
                                <option value="appointments">Appointments</option>
                            </select>
                        </div>
                        <button>
                            <span>View {""}</span>
                            <span>
                                <IoArrowForward />
                            </span>
                        </button>
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