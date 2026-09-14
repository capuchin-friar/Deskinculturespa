"use client";

import { useEffect, useState } from "react";
import {
    IoSettingsOutline,
    IoTrashBin
} from "react-icons/io5";
import "./styles/xxl.css";
import Select from "react-select";

export default function CreateProductPage() {

    const [productName, setProductName] = useState("");

    const [description, setDescription] = useState("");

    const [discountType, setDiscountType] = useState("");

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [price, setPrice] = useState("");
    const [discount, setDiscount] = useState("");

    const [category, setCategory] = useState("");
    const [subCategory, setSubCategory] = useState("");

    const [brand, setBrand] = useState("");
    const [quantity, setQuantity] = useState("");

    const [images, setImages] = useState([]);

    const [selectedImage, setSelectedImage] = useState(0);

    const [subCategoryOptions, setSubCategoryOptions] = useState([]);


    useEffect(() => {
        let data = formatSubCategory(category);
        setSubCategoryOptions(data);
    }, [category])

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);

        if (!files.length) return;

        const validFiles = files.filter((file) => {
            return file.type.startsWith("image/");
        });

        if (validFiles.length !== files.length) {
            setErrors((prev) => ({
                ...prev,
                images: "Only image files are allowed."
            }));
        }

        const newImages = validFiles.map((file) =>
            URL.createObjectURL(file)
        );

        setImages((prev) => [...prev, ...newImages]);

        if (newImages.length > 0) {
            setErrors((prev) => ({
                ...prev,
                images: ""
            }));
        }
    };

    const removeImage = (index) => {

        setImages((prev) =>
            prev.filter((_, i) => i !== index)
        );

        if (selectedImage >= index && selectedImage > 0) {
            setSelectedImage((prev) => prev - 1);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};

        // Product name
        if (!productName.trim()) {
            newErrors.productName = "Product name is required.";
        } else if (productName.trim().length < 3) {
            newErrors.productName =
                "Product name must be at least 3 characters.";
        }

        // Description
        if (!description.trim()) {
            newErrors.description = "Product description is required.";
        } else if (description.trim().length < 10) {
            newErrors.description =
                "Description must be at least 10 characters.";
        }

        // Images
        if (!images || images.length === 0) {
            newErrors.images = "At least one product image is required.";
        }

        // Price
        const numericPrice = Number(price);

        if (!price || Number.isNaN(numericPrice)) {
            newErrors.price = "Product price is required.";
        } else if (numericPrice <= 0) {
            newErrors.price = "Product price must be greater than ₦0.";
        }

        // Discount
        const numericDiscount = Number(discount);

        if (discount !== "" && Number.isNaN(numericDiscount)) {
            newErrors.discount = "Enter a valid discount.";
        } else if (
            discount !== "" &&
            (numericDiscount < 0 || numericDiscount > 100)
        ) {
            newErrors.discount =
                "Discount must be between 0% and 100%.";
        }

        // Quantity
        const numericQuantity = Number(quantity);

        if (quantity === "" || Number.isNaN(numericQuantity)) {
            newErrors.quantity = "Quantity is required.";
        } else if (!Number.isInteger(numericQuantity)) {
            newErrors.quantity = "Quantity must be a whole number.";
        } else if (numericQuantity < 0) {
            newErrors.quantity = "Quantity cannot be negative.";
        }

        // Category
        if (!category) {
            newErrors.category = "Please select a category.";
        }

        // Subcategory
        if (!subCategory) {
            newErrors.subCategory = "Please select a sub-category.";
        }

        // Brand
        if (!brand) {
            newErrors.brand = "Please select a brand.";
        }

        // Stop submission if there are errors
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setIsSubmitting(true);

        try {
            const productData = {
                productName: productName.trim(),
                description: description.trim(),
                price: numericPrice,
                category,
                subCategory,
                brand,
                quantity: numericQuantity,
                images,
                specialization: {
                    discount: {
                        discountType,
                        discount: numericDiscount
                    }
                }
            };

            console.log(productData);

            // API request here
            // await baseApi.post("/product", productData);

        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
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
                            onChange={(e) => {
                                setProductName(e.target.value);

                                if (errors.productName) {
                                    setErrors((prev) => ({
                                        ...prev,
                                        productName: ""
                                    }));
                                }
                            }}
                            placeholder="Enter product name"
                            className={errors.productName ? "input-error" : ""}
                        />

                        {errors.productName && (
                            <span className="error-message">
                                {errors.productName}
                            </span>
                        )}
                    </div>


                    <div className="form-group">
                        <label>
                            Description
                        </label>

                        <textarea
                            value={description}
                            onChange={(e) => {
                                setDescription(e.target.value);

                                if (errors.description) {
                                    setErrors((prev) => ({
                                        ...prev,
                                        description: ""
                                    }));
                                }
                            }}
                            placeholder="Describe your product"
                            className={errors.description ? "input-error" : ""}
                        />

                        {errors.description && (
                            <span className="error-message">
                                {errors.description}
                            </span>
                        )}
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
                    {errors.images && (
                        <span className="error-message">
                            {errors.images}
                        </span>
                    )}
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
                                step="1"
                                value={quantity}
                                onChange={(e) => {
                                    setQuantity(e.target.value);

                                    if (errors.quantity) {
                                        setErrors((prev) => ({
                                            ...prev,
                                            quantity: ""
                                        }));
                                    }
                                }}
                                className={errors.quantity ? "input-error" : ""}
                            />

                            {errors.quantity && (
                                <span className="error-message">
                                    {errors.quantity}
                                </span>
                            )}
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

                        <div
                            className={`input-prefix ${errors.price ? "input-error-wrapper" : ""
                                }`}
                        >
                            <span>₦</span>

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={price}
                                onChange={(e) => {
                                    setPrice(e.target.value);

                                    if (errors.price) {
                                        setErrors((prev) => ({
                                            ...prev,
                                            price: ""
                                        }));
                                    }
                                }}
                            />
                        </div>

                        {errors.price && (
                            <span className="error-message">
                                {errors.price}
                            </span>
                        )}
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
                                value={discountType}
                                onChange={(e) => setDiscountType(e.target.value)}
                            >
                                <option value="" disabled>
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
                            value={
                                category
                                    ? {
                                        value: category,
                                        label: category
                                    }
                                    : null
                            }
                            onChange={(selected) => {
                                setCategory(selected?.value || "");
                                setSubCategory("");

                                if (errors.category) {
                                    setErrors((prev) => ({
                                        ...prev,
                                        category: ""
                                    }));
                                }
                            }}
                            placeholder="Select a category..."
                            className={errors.category ? "select-error" : ""}
                        />

                        {errors.category && (
                            <span className="error-message">
                                {errors.category}
                            </span>
                        )}

                    </div>


                    <div className="form-group">

                        <label>
                            Product Sub-Category
                        </label>

                        <Select
                            options={subCategoryOptions}
                            isSearchable
                            value={
                                subCategory
                                    ? {
                                        value: subCategory,
                                        label: subCategory
                                    }
                                    : null
                            }
                            onChange={(selected) => {
                                setSubCategory(selected?.value || "");

                                if (errors.subCategory) {
                                    setErrors((prev) => ({
                                        ...prev,
                                        subCategory: ""
                                    }));
                                }
                            }}
                            placeholder="Select a sub-category..."
                            className={errors.subCategory ? "select-error" : ""}
                        />

                        {errors.subCategory && (
                            <span className="error-message">
                                {errors.subCategory}
                            </span>
                        )}

                    </div>

                    <div className="form-group">

                        <label>
                            Product Brand
                        </label>

                        <Select
                            options={brandOptions}
                            isSearchable
                            value={
                                brand
                                    ? {
                                        value: brand,
                                        label: brand
                                    }
                                    : null
                            }
                            onChange={(selected) => {
                                setBrand(selected?.value || "");

                                if (errors.brand) {
                                    setErrors((prev) => ({
                                        ...prev,
                                        brand: ""
                                    }));
                                }
                            }}
                            placeholder="Select a brand..."
                            className={errors.brand ? "select-error" : ""}
                        />

                        {errors.brand && (
                            <span className="error-message">
                                {errors.brand}
                            </span>
                        )}

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