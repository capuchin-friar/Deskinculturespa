import { useCallback } from "react";
import {
    IoPeopleOutline,
    IoCartOutline,
    IoTrendingUpOutline,
    IoEyeOutline,
    IoBagHandleOutline,
    IoSparklesOutline,
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
                        { title: "Order Breakdown", jsx: <OrderBreakdown /> },
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
            <div>
                <div style={{ width: "50%", height: 300 }}>
                    <ResponsiveContainer width="70%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={120}
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

                <div style={{ width: "55%", height: 200 }}>
                    <div className="headline">
                        {`Recent ${''}`}
                    </div>

                    {/* {
                        renderOrdersCards([...products, ...services, ...appointments])
                    } */}
                </div>
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