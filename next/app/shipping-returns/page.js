import "./style/xxl.css";


const policies = [
    {
        number: "01",
        title: "Order Processing",
        text: "Orders are processed after payment confirmation. Processing times may vary depending on product availability and order volume."
    },
    {
        number: "02",
        title: "Delivery",
        text: "Delivery times and charges depend on your destination and the delivery method available for your order."
    },
    {
        number: "03",
        title: "Returns",
        text: "If you receive a damaged, incorrect, or defective product, contact us as soon as possible so we can review the issue."
    },
    {
        number: "04",
        title: "Refunds",
        text: "Approved refunds are processed after the returned item has been reviewed and the return has been accepted."
    }
];

export default function ShippingReturnsPage() {
    return (
        <main className="dsc-shipping-page">

            <section className="dsc-shipping-hero">

                <span>
                    CUSTOMER CARE
                </span>

                <h1>
                    Shipping
                    <br />
                    <em>& Returns</em>
                </h1>

                <p>
                    Everything you need to know about receiving
                    your De Skin Culture order and what happens
                    if something isn't right.
                </p>

            </section>


            <section className="dsc-shipping-policy">

                <div className="dsc-shipping-sidebar">

                    <span>
                        OUR POLICY
                    </span>

                    <h2>
                        Clear,
                        <br />
                        simple,
                        <br />
                        transparent.
                    </h2>

                </div>


                <div className="dsc-shipping-list">

                    {policies.map((policy) => (

                        <article
                            className="dsc-shipping-item"
                            key={policy.number}
                        >

                            <span>
                                {policy.number}
                            </span>

                            <div>

                                <h3>
                                    {policy.title}
                                </h3>

                                <p>
                                    {policy.text}
                                </p>

                            </div>

                        </article>

                    ))}

                </div>

            </section>


            <section className="dsc-shipping-note">

                <div>

                    <span>
                        NEED HELP?
                    </span>

                    <h2>
                        Have a question
                        about your order?
                    </h2>

                </div>

                <a href="/contact">
                    Contact Us →
                </a>

            </section>

        </main>
    );
}