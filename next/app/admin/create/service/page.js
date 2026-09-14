"use client";

import { useState } from "react";
import {
    IoArrowBack,
    IoCloudUploadOutline,
    IoTimeOutline,
    IoLinkOutline,
    IoCheckmarkCircle,
    IoBulbOutline,
    IoChevronDown,
} from "react-icons/io5";

import "./styles/xxl.css";

const MAX_DESCRIPTION_LENGTH = 500;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const categories = [
    "Massage",
    "Facial",
    "Body Treatment",
    "Skin Care",
    "Wellness",
    "Other",
];

export default function AddServicePage() {
    const [form, setForm] = useState({
        name: "",
        description: "",
        price: "",
        duration: "",
        imageUrl: "",
        category: "",
        featured: false,
    });

    const [image, setImage] = useState(null);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    /* --------------------------------
       FORM CHANGE
    -------------------------------- */

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        // Clear field error while typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    /* --------------------------------
       IMAGE UPLOAD
    -------------------------------- */

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        // Validate file type
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            setErrors((prev) => ({
                ...prev,
                image: "Only JPG, PNG, and WebP images are allowed.",
            }));

            return;
        }

        // Validate file size
        if (file.size > MAX_IMAGE_SIZE) {
            setErrors((prev) => ({
                ...prev,
                image: "Image size must not exceed 5MB.",
            }));

            return;
        }

        setImage(file);

        setErrors((prev) => ({
            ...prev,
            image: "",
            imageUrl: "",
        }));
    };

    /* --------------------------------
       VALIDATION
    -------------------------------- */

    const validate = () => {
        const newErrors = {};

        // Service name
        if (!form.name.trim()) {
            newErrors.name = "Service name is required.";
        } else if (form.name.trim().length < 3) {
            newErrors.name = "Service name must be at least 3 characters.";
        } else if (form.name.trim().length > 100) {
            newErrors.name = "Service name cannot exceed 100 characters.";
        }

        // Description
        if (!form.description.trim()) {
            newErrors.description = "Description is required.";
        } else if (form.description.trim().length < 20) {
            newErrors.description =
                "Description must be at least 20 characters.";
        } else if (form.description.length > MAX_DESCRIPTION_LENGTH) {
            newErrors.description =
                `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters.`;
        }

        // Price
        if (!form.price) {
            newErrors.price = "Price is required.";
        } else if (Number(form.price) <= 0) {
            newErrors.price = "Price must be greater than ₦0.";
        }

        // Duration
        if (!form.duration) {
            newErrors.duration = "Duration is required.";
        } else if (Number(form.duration) <= 0) {
            newErrors.duration = "Duration must be greater than 0 minutes.";
        } else if (Number(form.duration) > 1440) {
            newErrors.duration =
                "Duration cannot exceed 1,440 minutes.";
        }

        // Image
        if (!image && !form.imageUrl.trim()) {
            newErrors.image =
                "Please upload an image or provide an image URL.";
        }

        // Image URL
        if (form.imageUrl.trim()) {
            try {
                new URL(form.imageUrl.trim());
            } catch {
                newErrors.imageUrl = "Please enter a valid image URL.";
            }
        }

        // Category
        if (!form.category) {
            newErrors.category = "Please select a category.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    /* --------------------------------
       SUBMIT
    -------------------------------- */

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isValid = validate();

        if (!isValid) {
            return;
        }

        try {
            setIsSubmitting(true);

            const serviceData = {
                name: form.name.trim(),
                description: form.description.trim(),
                price: Number(form.price),
                duration: Number(form.duration),
                category: form.category,
                imageUrl: form.imageUrl.trim() || null,
                featured: form.featured,
            };

            console.log("SERVICE DATA:", serviceData);
            console.log("IMAGE:", image);

            /*
              Your API request goes here.
      
              Example:
      
              const formData = new FormData();
      
              formData.append("name", serviceData.name);
              formData.append("description", serviceData.description);
              formData.append("price", serviceData.price);
              formData.append("duration", serviceData.duration);
              formData.append("category", serviceData.category);
              formData.append("featured", serviceData.featured);
      
              if (image) {
                formData.append("image", image);
              }
      
              await api.post("/admin/services", formData);
            */

            await new Promise((resolve) =>
                setTimeout(resolve, 1000)
            );

            alert("Service created successfully!");
        } catch (error) {
            console.error(error);

            setErrors({
                submit: "Something went wrong. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    /* --------------------------------
       PREVIEW
    -------------------------------- */

    const previewImage =
        image
            ? URL.createObjectURL(image)
            : form.imageUrl ||
            "https://images.pexels.com/photos/3757952/pexels-photo-3757952.jpeg";

    const formattedPrice = form.price
        ? `₦${new Intl.NumberFormat("en-NG").format(
            Number(form.price)
        )}`
        : "₦25,000";

    return (
        // <main className="service-page">


        // </main>

        <>

            {/* */}



            <div className="service-layout">

                {/* LEFT */}

                <section className="left-column">

                    <form
                        id="service-form"
                        className="service-card"
                        onSubmit={handleSubmit}
                    >

                        <div className="section-heading">
                            <h2>Service Information</h2>

                            <p>
                                Fill in the details of your spa service.
                            </p>
                        </div>


                        {/* SERVICE NAME */}

                        <div className="form-group">

                            <label>
                                Service Name <span>*</span>
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="e.g. Swedish Massage"
                                className={errors.name ? "input-error" : ""}
                            />

                            {errors.name && (
                                <p className="error-message">
                                    {errors.name}
                                </p>
                            )}

                        </div>


                        {/* DESCRIPTION */}

                        <div className="form-group">

                            <label>
                                Description <span>*</span>
                            </label>

                            <div className="textarea-wrapper">

                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    maxLength={MAX_DESCRIPTION_LENGTH}
                                    placeholder="Describe the service, its benefits, what customers can expect, etc."
                                    className={
                                        errors.description
                                            ? "input-error"
                                            : ""
                                    }
                                />

                                <span className="character-count">
                                    {form.description.length}/
                                    {MAX_DESCRIPTION_LENGTH}
                                </span>

                            </div>

                            {errors.description && (
                                <p className="error-message">
                                    {errors.description}
                                </p>
                            )}

                        </div>


                        {/* PRICE + DURATION */}

                        <div className="two-column">

                            <div className="form-group">

                                <label>
                                    Price (₦) <span>*</span>
                                </label>

                                <input
                                    type="number"
                                    name="price"
                                    value={form.price}
                                    onChange={handleChange}
                                    min="0"
                                    placeholder="e.g. 25,000"
                                    className={
                                        errors.price ? "input-error" : ""
                                    }
                                />

                                {errors.price && (
                                    <p className="error-message">
                                        {errors.price}
                                    </p>
                                )}

                            </div>


                            <div className="form-group">

                                <label>
                                    Duration (Minutes) <span>*</span>
                                </label>

                                <div className="icon-input">

                                    <input
                                        type="number"
                                        name="duration"
                                        value={form.duration}
                                        onChange={handleChange}
                                        min="1"
                                        max="1440"
                                        placeholder="e.g. 60"
                                        className={
                                            errors.duration
                                                ? "input-error"
                                                : ""
                                        }
                                    />

                                    <IoTimeOutline />

                                </div>

                                {errors.duration && (
                                    <p className="error-message">
                                        {errors.duration}
                                    </p>
                                )}

                            </div>

                        </div>


                        {/* IMAGE */}

                        <div className="form-group image-section">

                            <label>Service Image</label>

                            <p className="field-description">
                                Upload a beautiful image that represents this
                                service.
                            </p>


                            <label className="upload-box">

                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleImageUpload}
                                    hidden
                                />

                                <IoCloudUploadOutline />

                                <strong>
                                    Drag and drop an image here
                                </strong>

                                <span>
                                    or click to browse
                                </span>

                            </label>

                            <div className="upload-footer">

                                <span>
                                    Supports: JPG, PNG, WebP (Max 5MB)
                                </span>

                                <label className="choose-image">

                                    Choose Image

                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleImageUpload}
                                        hidden
                                    />

                                </label>

                            </div>

                            {errors.image && (
                                <p className="error-message">
                                    {errors.image}
                                </p>
                            )}

                        </div>


                        {/* OR */}

                        <div className="or-divider">
                            <span />
                            <p>OR</p>
                            <span />
                        </div>


                        {/* IMAGE URL */}

                        <div className="form-group">

                            <label>Image URL</label>

                            <div className="icon-input">

                                <IoLinkOutline />

                                <input
                                    type="url"
                                    name="imageUrl"
                                    value={form.imageUrl}
                                    onChange={handleChange}
                                    placeholder="https://example.com/image.jpg"
                                    className={
                                        errors.imageUrl
                                            ? "input-error"
                                            : ""
                                    }
                                />

                            </div>

                            <p className="field-description">
                                You can also paste an image URL from the web.
                            </p>

                            {errors.imageUrl && (
                                <p className="error-message">
                                    {errors.imageUrl}
                                </p>
                            )}

                        </div>

                    </form>


                    {/* ADDITIONAL SETTINGS */}

                    <section className="service-card additional-settings">

                        <div className="section-heading">

                            <h2>
                                Additional Settings{" "}
                                <small>(Optional)</small>
                            </h2>

                        </div>


                        <div className="settings-row">

                            {/* CATEGORY */}

                            <div className="form-group category-group">

                                <label>Category</label>

                                <div className="select-wrapper">

                                    <select
                                        name="category"
                                        value={form.category}
                                        onChange={handleChange}
                                        className={
                                            errors.category
                                                ? "input-error"
                                                : ""
                                        }
                                    >

                                        <option value="">
                                            Select a category
                                        </option>

                                        {categories.map((category) => (
                                            <option
                                                value={category}
                                                key={category}
                                            >
                                                {category}
                                            </option>
                                        ))}

                                    </select>

                                    <IoChevronDown />

                                </div>

                                {errors.category && (
                                    <p className="error-message">
                                        {errors.category}
                                    </p>
                                )}

                            </div>


                            {/* FEATURED */}

                            <div className="featured-setting">

                                <label>Featured Service</label>

                                <div className="toggle-row">

                                    <label className="switch">

                                        <input
                                            type="checkbox"
                                            name="featured"
                                            checked={form.featured}
                                            onChange={handleChange}
                                        />

                                        <span className="slider" />

                                    </label>

                                    <span>
                                        Show this service on your homepage
                                    </span>

                                </div>

                            </div>

                        </div>

                    </section>

                </section>


                {/* RIGHT */}

                <section className="right-column">

                    {/* PREVIEW */}

                    {/* <section className="preview-card">

                        <div className="section-heading">

                            <h2>Preview</h2>

                            <p>
                                This is how your service will appear to customers.
                            </p>

                        </div>


                        <div className="service-preview">

                            <img
                                src={previewImage}
                                alt={form.name || "Spa service"}
                            />

                            <div className="preview-content">

                                <div className="preview-title-row">

                                    <h3>
                                        {form.name || "Swedish Massage"}
                                    </h3>

                                    <strong>
                                        {formattedPrice}
                                    </strong>

                                </div>


                                <div className="preview-duration">

                                    <IoTimeOutline />

                                    <span>
                                        {form.duration || 60} mins
                                    </span>

                                </div>


                                <p>
                                    {form.description ||
                                        "A relaxing full-body massage that helps reduce stress, improve circulation, and promote overall wellness..."}
                                </p>


                                <button type="button">
                                    Book Now
                                </button>

                            </div>

                        </div>

                    </section> */}


                    {/* TIPS */}

                    <section className="tips-card">

                        <h3>
                            <IoBulbOutline />
                            Tips for a great service listing
                        </h3>

                        <ul>

                            <li>
                                <IoCheckmarkCircle />
                                Use a clear and attractive image
                            </li>

                            <li>
                                <IoCheckmarkCircle />
                                Write a detailed and engaging description
                            </li>

                            <li>
                                <IoCheckmarkCircle />
                                Set a competitive price
                            </li>

                            <li>
                                <IoCheckmarkCircle />
                                Be specific about the duration
                            </li>

                            <li>
                                <IoCheckmarkCircle />
                                Highlight unique benefits
                            </li>

                            <li>
                                <IoCheckmarkCircle />
                                Keep information up to date
                            </li>

                        </ul>

                    </section>

                    <div className="service-footer">


                        <div className="footer-actions">
                            {/* 
                            <button
                                type="button"
                                className="draft-button"
                                disabled={isSubmitting}
                            >
                                Save as Draft
                            </button> */}

                            <button
                                type="submit"
                                form="service-form"
                                className="publish-button"
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? "Publishing..."
                                    : "Publish Service"}
                            </button>

                        </div>
                    </div>
                </section>

            </div>

            {
                errors.submit && (
                    <div className="submit-error">
                        {errors.submit}
                    </div>
                )
            }

        </>
    );
}