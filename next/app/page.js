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

          <h1 className="customer-admin-name"><i>Dr. Ifeanyi</i></h1>

          <p className="customer-admin-summary">
            Internationally distinguished board-certified dermatologist and clinical skincare expert. Dr. Zenovia is committed to researching and developing innovative methods to treat acne, aging, and other leading skin concerns — using clinical-grade formulations backed by over 20 years of dermatology practice.
          </p>

          <button className="customer-admin-meet-btn">
            Meet Dr. Ifeanyi
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


