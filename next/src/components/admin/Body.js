import { useCallback } from "react";
import {
    IoPeopleOutline,
    IoCartOutline,
    IoCashOutline,
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
            {
                overview.map(({ name, value, svg }, index) =>
                    <div key={index}>
                        <MetricCard name={name} svg={svg} value={value} />
                    </div>
                )
            }

        </>
    )
});

const renderCatalogCards = ((catalog) => {

    return (
        <>
            {
                catalog.map(({ name, value, svg }, index) =>
                    <div key={index}>
                        <MetricCard name={name} svg={svg} value={value} />
                    </div>
                )
            }

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
            svg: IoCashOutline,
            duration: "",
            conversion: ""
        },
        {
            name: "Views",
            value: 0,
            svg: IoEyeOutline,
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
            name: "Appointments offered",
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
                        { title: "Bussiness Overview", jsx: renderOverviewCards(overview) },
                        { title: "Order Breakdown", jsx: <OrderBreakdown /> },
                        { title: "Catalog / Operations", jsx: renderCatalogCards(catalog) }
                    ].map((content, i) =>
                        <div key={i}>
                            <Headline title={`${i + 1}. ${content.title}`} />

                            {content.jsx}
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
        <div>
            <span>
                <Icon size={35} />
            </span>

            <span>
                <p>{name}</p>
                <h3>{value}</h3>
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
                <div style={{ width: "40%", height: 250 }}>
                    <ResponsiveContainer width="70%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={80}
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
                        <strong>{totalOrders}</strong>
                        <span>Total Orders</span>
                    </div>
                </div>

                <div style={{ width: "55%", height: 200 }}>
                    <div className="headline">
                        {`Recent ${''}`}
                    </div>

                    {
                        renderOrdersCards([...products, ...services, ...appointments])
                    }
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