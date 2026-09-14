"use client";

import { useEffect, useState } from "react";
import {
    IoSettingsOutline,
    IoTrashBin
} from "react-icons/io5";
import "./styles/xxl.css";
import Select from "react-select";

export default function CreateProductPage() {

    const [productName, setProductName] = useState("Macbook Air");

    const [description, setDescription] = useState(
        "The Apple MacBook Pro 13.3-inch laptop is powered by the new M2 chip. It comes with the same compact design but now it supports up to 20 hours."
    );

    const [price, setPrice] = useState("120.00");
    const [discount, setDiscount] = useState("25");

    const [category, setCategory] = useState("Electronics");
    const [subCategory, setSubCategory] = useState("Electronics");
    const [tag, setTag] = useState("Internet Of Things");

    const [brand, setBrand] = useState("");
    const [quantity, setQuantity] = useState("1");

    const [images, setImages] = useState([
        "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?w=800",
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800"
    ]);

    const [selectedImage, setSelectedImage] = useState(0);

    const [subCategoryOptions, setSubCategoryOptions] = useState([]);


    useEffect(() => {
        let data = formatSubCategory(category);
        console.log(data)
        setSubCategoryOptions(data);
    }, [category])

    const handleImageUpload = (e) => {

        const files = Array.from(e.target.files);

        if (!files.length) return;

        const newImages = files.map((file) =>
            URL.createObjectURL(file)
        );

        setImages((prev) => [...prev, ...newImages]);
    };

    const removeImage = (index) => {

        setImages((prev) =>
            prev.filter((_, i) => i !== index)
        );

        if (selectedImage >= index && selectedImage > 0) {
            setSelectedImage((prev) => prev - 1);
        }
    };

    const handleSubmit = (e) => {

        e.preventDefault();

        const productData = {
            productName,
            description,
            price,
            discount,
            category,
            tag,
            brand,
            quantity,
            images
        };

        console.log(productData);
    };

    const brandOptions = brands.map((brand) => ({
        value: brand,
        label: brand
    }));


    return (

        <form
            className="product-create-form"
            onSubmit={handleSubmit}
        >

            {/* =========================
                    LEFT COLUMN
                ========================= */}

            <div className="product-create-left">


                {/* GENERAL INFORMATION */}

                <section className="product-card">

                    <h2>
                        General Information
                    </h2>


                    <div className="form-group">

                        <label>
                            Product Name
                        </label>

                        <input
                            type="text"
                            value={productName}
                            onChange={(e) =>
                                setProductName(e.target.value)
                            }
                            placeholder="Enter product name"
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Description
                        </label>

                        <textarea
                            value={description}
                            onChange={(e) =>
                                setDescription(e.target.value)
                            }
                            placeholder="Describe your product"
                        />

                    </div>

                </section>



                {/* PRODUCT MEDIA */}

                <section className="product-card media-card">

                    <h2>
                        Product Media
                    </h2>

                    <label className="media-label">
                        Product Image
                    </label>


                    <div className="media-container">

                        {/* UPLOAD */}

                        <label className="upload-box">

                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                            />

                            <div className="upload-icon">
                                ⊞
                            </div>

                            <strong>
                                Click to upload
                            </strong>

                            <span>
                                or
                            </span>

                            <span>
                                drag and drop
                            </span>

                        </label>

                        {/* THUMBNAILS */}

                        <div className="thumbnail-list">

                            {images.map((image, index) => (

                                <div
                                    className={`thumbnail ${selectedImage === index
                                        ? "active"
                                        : ""
                                        }`}
                                    key={index}
                                    onClick={() =>
                                        setSelectedImage(index)
                                    }
                                >

                                    <button
                                        className="remove-btn"
                                        onClick={() =>
                                            removeImage(selectedImage)
                                        }
                                    >
                                        <IoTrashBin color="#fff" size={15} />
                                    </button>
                                    <img
                                        src={image}
                                        alt={`Product ${index + 1}`}
                                    />

                                </div>

                            ))}

                        </div>

                    </div>


                    {/* <div className="media-actions">

                            <button
                                type="button"
                                className="add-product-btn"
                                onClick={() =>
                                    document
                                        .querySelector(
                                            ".upload-box input"
                                        )
                                        ?.click()
                                }
                            >
                                <span>⊞</span>
                                Add Image
                            </button>

                        </div> */}

                </section>



                {/* INVENTORY */}

                <section className="product-card inventory-card">

                    <h2>
                        Inventory
                    </h2>


                    <div className="inventory-grid">

                        {/* <div className="form-group">

                                <label>
                                    SKU
                                </label>

                                <input
                                    type="text"
                                    value={sku}
                                    onChange={(e) =>
                                        setSku(e.target.value)
                                    }
                                />

                            </div>


                            <div className="form-group">

                                <label>
                                    Barcode
                                </label>

                                <input
                                    type="text"
                                    value={barcode}
                                    onChange={(e) =>
                                        setBarcode(e.target.value)
                                    }
                                />

                            </div> */}


                        <div className="form-group">

                            <label>
                                Quantity
                            </label>

                            <input
                                type="number"
                                min="0"
                                value={quantity}
                                onChange={(e) =>
                                    setQuantity(e.target.value)
                                }
                            />

                        </div>

                    </div>

                </section>

            </div>



            {/* =========================
                    RIGHT COLUMN
                ========================= */}

            <div className="product-create-right">


                {/* PRICING */}

                <section className="product-card">

                    <h2>
                        Pricing
                    </h2>


                    <div className="form-group">

                        <label>
                            Base Pricing
                        </label>

                        <div className="input-prefix">

                            <span>
                                ₦
                            </span>

                            <input
                                type="number"
                                value={price}
                                onChange={(e) =>
                                    setPrice(e.target.value)
                                }
                            />

                        </div>

                    </div>


                    <div className="pricing-row">

                        <div className="form-group">

                            <label>
                                Discount Percentage (%)
                            </label>

                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={discount}
                                onChange={(e) =>
                                    setDiscount(e.target.value)
                                }
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                &nbsp;
                            </label>

                            <select
                                defaultValue=""
                            >

                                <option
                                    value=""
                                    disabled
                                >
                                    Select a discount type
                                </option>

                                <option value="percentage">
                                    Percentage
                                </option>

                                <option value="fixed">
                                    Fixed Amount
                                </option>

                            </select>

                        </div>

                    </div>

                </section>



                {/* CATEGORY */}

                <section className="product-card category-card">

                    <h2>
                        Category
                    </h2>


                    <div className="form-group">

                        <label>
                            Product Category
                        </label>

                        <Select
                            options={formatCategory()}
                            isSearchable
                            onChange={(selected) => setCategory(selected?.value || "")}

                            placeholder="Select a brand..."
                            styles={{
                                control: (base, state) => ({
                                    ...base,
                                    minHeight: "56px",
                                    borderRadius: "8px",
                                    borderColor: state.isFocused
                                        ? "#bfc1c8"
                                        : "#e8e9ed",
                                    backgroundColor: "#f8f9fa",
                                    boxShadow: state.isFocused
                                        ? "0 0 0 3px rgba(0, 0, 0, 0.025)"
                                        : "none",
                                    "&:hover": {
                                        borderColor: "#bfc1c8"
                                    }
                                }),

                                menu: (base) => ({
                                    ...base,
                                    borderRadius: "8px",
                                    overflow: "hidden",
                                    zIndex: 100
                                }),

                                option: (base, state) => ({
                                    ...base,
                                    backgroundColor: state.isSelected
                                        ? "#278A3D"
                                        : state.isFocused
                                            ? "#E8F5EB"
                                            : "#fff",
                                    color: state.isSelected
                                        ? "#fff"
                                        : "#222",
                                    cursor: "pointer"
                                })
                            }}
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Product Sub-Category
                        </label>

                        <Select
                            options={subCategoryOptions}
                            isSearchable
                            onChange={(selected) => setSubCategory(selected?.value || "")}

                            placeholder="Select a brand..."
                            styles={{
                                control: (base, state) => ({
                                    ...base,
                                    minHeight: "56px",
                                    borderRadius: "8px",
                                    borderColor: state.isFocused
                                        ? "#bfc1c8"
                                        : "#e8e9ed",
                                    backgroundColor: "#f8f9fa",
                                    boxShadow: state.isFocused
                                        ? "0 0 0 3px rgba(0, 0, 0, 0.025)"
                                        : "none",
                                    "&:hover": {
                                        borderColor: "#bfc1c8"
                                    }
                                }),

                                menu: (base) => ({
                                    ...base,
                                    borderRadius: "8px",
                                    overflow: "hidden",
                                    zIndex: 100
                                }),

                                option: (base, state) => ({
                                    ...base,
                                    backgroundColor: state.isSelected
                                        ? "#278A3D"
                                        : state.isFocused
                                            ? "#E8F5EB"
                                            : "#fff",
                                    color: state.isSelected
                                        ? "#fff"
                                        : "#222",
                                    cursor: "pointer"
                                })
                            }}
                        />

                    </div>

                    <div className="form-group">

                        <label>
                            Product Brand
                        </label>

                        <Select
                            options={brandOptions}
                            isSearchable
                            onChange={(selected) => setBrand(selected?.value || "")}
                            placeholder="Select a brand..."
                            styles={{
                                control: (base, state) => ({
                                    ...base,
                                    minHeight: "56px",
                                    borderRadius: "8px",
                                    borderColor: state.isFocused
                                        ? "#bfc1c8"
                                        : "#e8e9ed",
                                    backgroundColor: "#f8f9fa",
                                    boxShadow: state.isFocused
                                        ? "0 0 0 3px rgba(0, 0, 0, 0.025)"
                                        : "none",
                                    "&:hover": {
                                        borderColor: "#bfc1c8"
                                    }
                                }),

                                menu: (base) => ({
                                    ...base,
                                    borderRadius: "8px",
                                    overflow: "hidden",
                                    zIndex: 100
                                }),

                                option: (base, state) => ({
                                    ...base,
                                    backgroundColor: state.isSelected
                                        ? "#278A3D"
                                        : state.isFocused
                                            ? "#E8F5EB"
                                            : "#fff",
                                    color: state.isSelected
                                        ? "#fff"
                                        : "#222",
                                    cursor: "pointer"
                                })
                            }}
                        />

                    </div>

                </section>



                {/* SAVE BUTTON */}

                <div className="product-save-container">

                    <button
                        type="submit"
                        className="save-product-btn"
                    >
                        Save Product
                    </button>

                </div>

            </div>

        </form>
        // <main className="product-create-page">


        // </main>
    );
}

function formatCategory() {
    let categoryList = [];
    categories.map((c) => {
        categoryList.push({
            value: c.category,
            label: c.category
        });
    });
    return categoryList;
}

function formatSubCategory(selectedCategory) {
    let subCategoryList = [];
    let res = categories.find((c) => {
        return c.category.toLowerCase() == selectedCategory.toLowerCase()
    })
    console.log("res: ", res);
    if (res) {
        res.subcategories.map((_c) => {
            subCategoryList.push({
                value: _c,
                label: _c
            });
        });
        return subCategoryList;
    }
}

const brands = [
    "Acwell",
    "Active Caviar",
    "Advance Clinical",
    "Advance Korea",
    "Alpha Arbutin",
    "Anua",
    "Aqua Rich",
    "Awuarich",
    "Axis-Y",

    "Balance",
    "Black Girl Magic",
    "Bondi Sands",

    "CeraVe",
    "Code Baha",
    "Cosmo",
    "COSRX",
    "Creighton",

    "Disaar",
    "Dr. Althea",
    "Dr. Meiner",
    "Dr. Teal's",
    "Dr. Rashel",
    "Duchess Glow",
    "Dove",

    "E45",
    "EOS",
    "Estelin",

    "Face Facts",
    "Feah",

    "Garnier",
    "Good Molecules",

    "Jumiso",

    "Koji White",

    "La Roche-Posay",

    "Medicube",
    "Mary & May",

    "Nineless",
    "Nivea",
    "Neutrogena",
    "Numbuzin",

    "Olay",

    "Pacci Cristi",
    "Palmer's",
    "Pixi",
    "Prolab",

    "Revox",

    "Simple",
    "SKIN1004",
    "Skin by Zaron",
    "Skin Point",
    "Soft",
    "St. Ives",
    "Seoul",

    "The Ordinary",
    "Tiam",

    "Vaseline",

    "Zapzyt"
];

const categories = [
    {
        "category": "Face Care",
        "subcategories": [
            "Facial Cleansers",
            "Face Toners",
            "Face Serums",
            "Moisturizers",
            "Face Cream",
            "Face Masks",
            "Exfoliators",
            "Retinol & Retinoids",
            "Lip Care",
            "Facial Tools"
        ]
    },
    {
        "category": "Body Care",
        "subcategories": [
            "Body Wash",
            "Body Lotions",
            "Body Creams",
            "Body Oils",
            "Body Scrubs",
            "Body Exfoliators",
            "Body Serums",
            "Stretch Mark Care",
            "Underarm Care"
        ]
    },
    {
        "category": "Acne & Blemish Care",
        "subcategories": [
            "Acne Cleansers",
            "Acne Serums",
            "Acne Treatments",
            "Benzoyl Peroxide",
            "Salicylic Acid",
            "Adapalene & Retinoids",
            "Pimple/Spot Treatments",
            "Blackhead & Comedone Care",
            "Post-Acne Mark Care",
            "Acne Body Care"
        ]
    },
    {
        "category": "Hyperpigmentation Care",
        "subcategories": [
            "Dark Spot Serums",
            "Brightening Creams",
            "Brightening Toners",
            "Dark Knuckle Care",
            "Dark Elbow & Knee Care",
            "Underarm Brightening",
            "Hyperpigmentation Body Care"
        ]
    },
    {
        "category": "Sunscreens",
        "subcategories": [
            "Face Sunscreens",
            "Body Sunscreens",
            "Mineral Sunscreens",
            "Chemical Sunscreens",
            "Tinted Sunscreens",
            "Sunscreen Sticks",
            "Sunscreen Sprays",
            "SPF Lip Care"
        ]
    },
    {
        "category": "Supplements & Wellness",
        "subcategories": [
            "Marine Collagen",
            "Zinc Supplements",
            "Spearmint Tea",
            "Evening Primrose",
            "Beauty Supplements",
            "Skin & Hair Supplements",
            "General Wellness Supplements"
        ]
    },
    {
        "category": "Hair Removal & Ingrown Hair Care",
        "subcategories": [
            "Waxing Products",
            "Ingrown Hair Treatments",
            "Ingrown Hair Exfoliators",
            "PFB/Beard Bump Care",
            "Post-Wax Care",
            "Hair Removal Aftercare",
            "Bikini Area Care"
        ]
    },
    {
        "category": "Professional Skincare",
        "subcategories": [
            "Chemical Peels",
            "Professional Cleansers",
            "Extraction/Pre-Treatment Products",
            "Microneedling Products",
            "Dermaplaning Products",
            "Post-Treatment Care"
        ]
    },
    {
        "category": "Spa Items",
        "subcategories": [
            "Facial Headbands",
            "Facial Bowls",
            "Extraction Tools",
            "Spatulas",
            "Facial Brushes",
            "Treatment Towels",
            "Waxing Accessories",
            "Disposable Spa Items",
            "Microblading Supplies",
            "Lash Supplies",
            "Facial/Body Treatment Accessories",
            "Aftercare Supplies"
        ]
    },
    {
        "category": "Eye Care",
        "subcategories": [
            "Eye Creams",
            "Eye Serums",
            "Under-Eye Treatments",
            "Dark Circle Care",
            "Eye Patches",
            "Puffy Eye Care",
            "Eyelash Serums",
            "Eye Masks"
        ]
    },
    {
        "category": "Feminine Care",
        "subcategories": [
            "Feminine Wash",
            "Intimate Moisturizers",
            "Feminine Wipes",
            "Menstrual Care",
            "Intimate Skin Care",
            "Bikini Area Care",
            "Feminine Deodorants",
            "Post-Wax Intimate Care"
        ]
    },
    {
        "category": "Hand & Feet Care",
        "subcategories": [
            "Hand Creams",
            "Hand Scrubs",
            "Cuticle Care",
            "Nail Care",
            "Foot Creams",
            "Foot Scrubs",
            "Heel Repair",
            "Callus Care",
            "Hand & Foot Masks",
            "Nail Treatment Products"
        ]
    }
];