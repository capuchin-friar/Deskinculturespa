import { IoArrowForward } from "react-icons/io5";
import Testimonials from "@/src/components/customer/Testimonial"
import "./styles/xxl.css"
import "./styles/testimonial.css"
export default function Home() {

  const products = [
    {
      thumbnail: "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=500",
      title: "Premium Lavender Aromatherapy Body Oil for Deep Relaxation and Nourishing Skin Care",
      price: 12000
    },
    {
      thumbnail: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500",
      title: "Intensive Hydrating Face Cream with Natural Botanical Ingredients for Radiant Healthy Skin",
      price: 8500
    },
    {
      thumbnail: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=500",
      title: "Luxury Aromatherapy Bath Salt for Ultimate Relaxation, Stress Relief and Rejuvenation",
      price: 6500
    },
    {
      thumbnail: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=500",
      title: "Advanced Vitamin C Facial Serum for Brighter, Smoother and More Youthful Looking Skin",
      price: 15000
    }
  ];

  const services = [
    {
      title: "Relaxing Full Body Massage",
      thumbnail: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop",
      description: "A calming full-body massage designed to release tension, improve circulation, and leave you feeling deeply relaxed."
    },
    {
      title: "Luxury Facial Treatment",
      thumbnail: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop",
      description: "A personalized facial treatment that cleanses, hydrates, and rejuvenates your skin for a fresh and radiant appearance."
    },
    {
      title: "Hot Stone Massage",
      thumbnail: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&auto=format&fit=crop",
      description: "Experience deep relaxation with heated stones combined with therapeutic massage techniques to ease muscle tension."
    },
    {
      title: "Aromatherapy Massage",
      thumbnail: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop",
      description: "A soothing massage enhanced with aromatic essential oils to promote relaxation and create a tranquil wellness experience."
    },
    {
      title: "Deep Cleansing Facial",
      thumbnail: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop",
      description: "A thorough facial treatment focused on deep cleansing, exfoliation, and hydration to refresh and revitalize your skin."
    },
    {
      title: "Body Scrub & Exfoliation",
      thumbnail: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&auto=format&fit=crop",
      description: "A luxurious exfoliating treatment that removes dead skin cells, smooths the body, and leaves your skin soft and renewed."
    }
  ];
  return (
    <>
      <div className="customer-hero-section">
        <div className="left">
          <div className="hero-tagline">
            <span>Healthy Skin</span>•
            <span>Confidence</span>•
            <span>You</span>
          </div>
          <div className="hero-slogan">
            <h1>
              Expert Care,
              <br />
              Visible Results
            </h1>
          </div>
          <div className="hero-writeup">
            <p>Transform your skin, body, and confidence with personalized spa care.</p>
            <p>Explore premium services and treatments designed around your needs.</p>
            <p>Customize your experience and book your perfect appointment.</p>
          </div>

          <div className="hero-btns">
            <button>
              <span>
                Book Appointment
              </span>
              <span>
                <IoArrowForward size={20} />
              </span>
            </button>

            <button>
              <span>
                Explore Services
              </span>
            </button>
          </div>

          <div className="hero-value-prop-bar">
            {
              [
                {},
                {},
                {}
              ].map((v, i) =>
                <div>
                  <span>
                    {/* Icon section */}
                  </span>
                  <span>
                    {v.text ?? "Value proposition"}
                  </span>
                </div>
              )
            }
          </div>
        </div>

        <div className="right">
        </div>
      </div>

      <div className="customer-services-section">
        <p className="customer-service-tag">
          Our Featured Treatments
        </p>
        <div className="customer-service-cnt">
          {
            services.map((s, i) =>
              <div className="customer-service-card shadow-sm">
                <div className="customer-service-thumbnail" style={{
                  backgroundImage: `url(${s.thumbnail})`
                }}>
                  {/* <button className="card-button">
                    Add To Cart
                  </button> */}

                  <div className="customer-service-body">
                    <div className="customer-service-body-wrapper">
                      <p className="customer-service-title">
                        {s.title ?? "Service title"}
                      </p>
                      <div className="customer-service-description">
                        {s.description ?? "Service Description"}
                      </div>

                      <button>
                        <u>Read More</u>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          }
        </div>

        <button className="customer-service-view-btn">
          View All
        </button>

      </div>

      <div className="customer-products-section">
        <p className="customer-product-tag">
          Shop Essentials
        </p>

        <div className="customer-product-cnt">
          {
            products.map((p, i) =>
              <div className="customer-product-card shadow-sm">
                <div className="customer-product-thumbnail" style={{
                  backgroundImage: `url(${p.thumbnail})`
                }}>
                  <button className="card-button">
                    Add To Cart
                  </button>
                  {/* <img src={p.thumbnail ?? ""} style={{height: "100%", width: "100%"}} alt="product-image" /> */}
                </div>

                <div className="customer-product-body">
                  <p className="customer-product-title">
                    {p.title ?? "Product title"}
                  </p>
                  <div className="customer-product-price">
                    {p.price ?? "0.00"}
                  </div>
                </div>


              </div>
            )
          }
        </div>

        <button className="customer-product-view-btn">
          View All
        </button>
      </div>

      <div className="customer-admin-section">
        <div className="left">
          <small className="customer-admin-headline">Meet The Founder</small>

          <h1 className="customer-admin-name"><i>Dr. Chinelo Stella</i></h1>

          <p className="customer-admin-summary">
            Internationally distinguished board-certified dermatologist and clinical skincare expert. Dr. Zenovia is committed to researching and developing innovative methods to treat acne, aging, and other leading skin concerns — using clinical-grade formulations backed by over 20 years of dermatology practice.
          </p>

          <button className="customer-admin-meet-btn">
            Meet Dr. Chinelo Stella
          </button>
        </div>
        <div className="right">
          <img src="" style={{ height: "100%", width: "100%" }} alt="" />
        </div>
      </div>

      <div className="customer-testimonials-section">
        <h1 className="customer-testimonials-headline">Testimonials</h1>
        <Testimonials />

      </div>
    </>
  );
}


