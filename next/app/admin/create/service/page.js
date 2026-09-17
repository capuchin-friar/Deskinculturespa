"use client";

import { useEffect, useMemo, useState } from "react";
import {
    IoCloudUploadOutline,
    IoTimeOutline,
    IoLinkOutline,
    IoCheckmarkCircle,
    IoBulbOutline,
} from "react-icons/io5";
import Select from "react-select";
import "./styles/xxl.css";
import _SERVICES from "../../../../src/json/services.json";
import { api } from "../../../api/config";
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

const DEFAULT_PREVIEW_IMAGE =
    "https://images.pexels.com/photos/3757952/pexels-photo-3757952.jpeg";

export default function AddServicePage() {
    const [form, setForm] = useState({
        description: "",
        service: "",
        subService: "",
        price: "",
        duration: "",
        imageUrl: "",
        featured: false,
    });

    const [serviceList, setServiceList] = useState([]);
    const [serviceSubList, setServiceSubList] = useState([]);

    const [service, setService] = useState("");
    const [subService, setSubService] = useState("");

    const [image, setImage] = useState(null);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | SERVICE OPTIONS
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const { categories: services = [] } = _SERVICES;

        const servicesList = services.map(({ category }) => ({
            label: category,
            value: category,
        }));

        setServiceList(servicesList);
    }, []);

    /*
    |--------------------------------------------------------------------------
    | SUB-SERVICE OPTIONS
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const { categories: services = [] } = _SERVICES;

        const selectedService = services.find(
            ({ category }) => category === service
        );

        const subservices = selectedService?.subcategories || [];

        const subserviceList = subservices.map(({ name }) => ({
            label: name,
            value: name,
        }));

        setServiceSubList(subserviceList);

        // Reset selected sub-service whenever category changes
        setSubService("");

        // Remove sub-service error
        setErrors((prev) => ({
            ...prev,
            subService: "",
        }));
    }, [service]);

    /*
    |--------------------------------------------------------------------------
    | FORM CHANGE
    |--------------------------------------------------------------------------
    */

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        // Clear field error when user starts correcting it
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    /*
    |--------------------------------------------------------------------------
    | IMAGE UPLOAD
    |--------------------------------------------------------------------------
    */

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        // File type
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            setErrors((prev) => ({
                ...prev,
                image: "Only JPG, PNG, and WebP images are allowed.",
            }));

            e.target.value = "";
            return;
        }

        // File size
        if (file.size > MAX_IMAGE_SIZE) {
            setErrors((prev) => ({
                ...prev,
                image: "Image size must not exceed 5MB.",
            }));

            e.target.value = "";
            return;
        }

        setImage(file);

        setErrors((prev) => ({
            ...prev,
            image: "",
            imageUrl: "",
        }));

        // Clear URL because uploaded image takes priority
        setForm((prev) => ({
            ...prev,
            imageUrl: "",
        }));
    };

    /*
    |--------------------------------------------------------------------------
    | IMAGE URL CHANGE
    |--------------------------------------------------------------------------
    */

    const handleImageUrlChange = (e) => {
        const { value } = e.target;

        setForm((prev) => ({
            ...prev,
            imageUrl: value,
        }));

        // If user enters a URL, remove uploaded file
        if (value.trim()) {
            setImage(null);
        }

        if (errors.imageUrl || errors.image) {
            setErrors((prev) => ({
                ...prev,
                imageUrl: "",
                image: "",
            }));
        }
    };

    /*
    |--------------------------------------------------------------------------
    | SELECT STYLES
    |--------------------------------------------------------------------------
    */

    const selectStyles = useMemo(
        () => ({
            control: (base, state) => ({
                ...base,

                minHeight: "50px",
                height: "50px",

                borderRadius: "10px",

                border: state.selectProps.hasError
                    ? "1px solid #dc2626"
                    : state.isFocused
                        ? "1px solid #278A3D"
                        : "1px solid #d9e1db",

                boxShadow: state.isFocused
                    ? "0 0 0 3px rgba(39, 138, 61, 0.10)"
                    : "none",

                backgroundColor: "#ffffff",

                cursor: "pointer",

                transition:
                    "border-color 0.2s ease, box-shadow 0.2s ease",

                "&:hover": {
                    borderColor: state.selectProps.hasError
                        ? "#dc2626"
                        : "#278A3D",
                },
            }),

            valueContainer: (base) => ({
                ...base,
                padding: "0 14px",
            }),

            singleValue: (base) => ({
                ...base,
                color: "#18301f",
                fontSize: "14px",
                fontWeight: 500,
            }),

            placeholder: (base) => ({
                ...base,
                color: "#98a59c",
                fontSize: "14px",
            }),

            input: (base) => ({
                ...base,
                color: "#18301f",
                fontSize: "14px",
            }),

            menu: (base) => ({
                ...base,

                marginTop: "6px",

                borderRadius: "10px",

                overflow: "hidden",

                border: "1px solid #e3e9e4",

                boxShadow:
                    "0 12px 30px rgba(11, 59, 26, 0.10)",

                zIndex: 100,
            }),

            menuList: (base) => ({
                ...base,
                padding: "6px",
                maxHeight: "250px",
            }),

            option: (base, state) => ({
                ...base,

                padding: "10px 12px",

                borderRadius: "7px",

                marginBottom: "2px",

                fontSize: "14px",

                color: state.isSelected
                    ? "#ffffff"
                    : "#25352a",

                backgroundColor: state.isSelected
                    ? "#278A3D"
                    : state.isFocused
                        ? "#E8F5EB"
                        : "#ffffff",

                cursor: "pointer",

                transition: "background-color 0.15s ease",

                "&:active": {
                    backgroundColor: "#278A3D",
                    color: "#ffffff",
                },
            }),

            indicatorSeparator: () => ({
                display: "none",
            }),

            dropdownIndicator: (base, state) => ({
                ...base,

                color: state.isFocused
                    ? "#278A3D"
                    : "#829087",

                paddingRight: "12px",

                transition: "transform 0.2s ease, color 0.2s ease",

                transform: state.selectProps.menuIsOpen
                    ? "rotate(180deg)"
                    : "rotate(0deg)",

                "&:hover": {
                    color: "#278A3D",
                },
            }),

            clearIndicator: (base) => ({
                ...base,
                color: "#9aa59d",

                "&:hover": {
                    color: "#dc2626",
                },
            }),

            noOptionsMessage: (base) => ({
                ...base,
                color: "#7a867d",
                fontSize: "13px",
            }),

            loadingMessage: (base) => ({
                ...base,
                color: "#7a867d",
                fontSize: "13px",
            }),
        }),
        []
    );

    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    const validate = () => {
        const newErrors = {};

        const description = form.description.trim();
        const price = Number(form.price);
        const duration = Number(form.duration);
        const imageUrl = form.imageUrl.trim();


        /*
        | DESCRIPTION
        */

        if (!description) {
            newErrors.description = "Description is required.";
        } else if (description.length < 20) {
            newErrors.description =
                "Description must be at least 20 characters.";
        } else if (description.length > MAX_DESCRIPTION_LENGTH) {
            newErrors.description =
                `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters.`;
        }

        /*
        | PRICE
        */

        if (form.price === "") {
            newErrors.price = "Price is required.";
        } else if (!Number.isFinite(price)) {
            newErrors.price = "Please enter a valid price.";
        } else if (price <= 0) {
            newErrors.price = "Price must be greater than ₦0.";
        } else if (price > 100000000) {
            newErrors.price =
                "Price cannot exceed ₦100,000,000.";
        }

        /*
        | DURATION
        */

        if (form.duration === "") {
            newErrors.duration = "Duration is required.";
        } else if (!Number.isFinite(duration)) {
            newErrors.duration =
                "Please enter a valid duration.";
        } else if (!Number.isInteger(duration)) {
            newErrors.duration =
                "Duration must be a whole number of minutes.";
        } else if (duration <= 0) {
            newErrors.duration =
                "Duration must be greater than 0 minutes.";
        } else if (duration > 1440) {
            newErrors.duration =
                "Duration cannot exceed 1,440 minutes.";
        }

        /*
        | IMAGE
        */

        // if (!image && !imageUrl) {
        //     newErrors.image =
        //         "Please upload an image or provide an image URL.";
        // }

        /*
        | IMAGE URL
        */

        // if (imageUrl) {
        //     try {
        //         const url = new URL(imageUrl);

        //         if (!["http:", "https:"].includes(url.protocol)) {
        //             newErrors.imageUrl =
        //                 "Image URL must use HTTP or HTTPS.";
        //         }
        //     } catch {
        //         newErrors.imageUrl =
        //             "Please enter a valid image URL.";
        //     }
        // }

        /*
        | SERVICE CATEGORY
        */

        if (!service) {
            newErrors.service =
                "Please select a service category.";
        }

        /*
        | SUB-SERVICE
        */

        if (service && !subService) {
            newErrors.subService =
                "Please select a sub-category.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    /*
    |--------------------------------------------------------------------------
    | SELECT HANDLERS
    |--------------------------------------------------------------------------
    */

    const handleServiceChange = (selected) => {
        const value = selected?.value || "";

        setService(value);

        if (errors.service) {
            setErrors((prev) => ({
                ...prev,
                service: "",
            }));
        }
    };

    const handleSubServiceChange = (selected) => {
        const value = selected?.value || "";

        setSubService(value);

        if (errors.subService) {
            setErrors((prev) => ({
                ...prev,
                subService: "",
            }));
        }
    };

    /*
    |--------------------------------------------------------------------------
    | SUBMIT
    |--------------------------------------------------------------------------
    */

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        try {
            setIsSubmitting(true);

            setErrors((prev) => ({
                ...prev,
                submit: "",
            }));

            const serviceData = {
                description: form.description.trim(),
                price: Number(form.price),
                duration_minutes: Number(form.duration),
                service,
                sub_service: subService,
            };

            const { data } = await api.post(
                "services/add",
                serviceData
            );

            if (!data?.success) {
                throw new Error(
                    data?.message || "Failed to create service."
                );
            }

            alert("Service created successfully!");
            window.location.href ="/admin/catalog";
        } catch (error) {
            console.error("CREATE SERVICE ERROR:", error);

            setErrors((prev) => ({
                ...prev,
                submit:
                    error?.response?.data?.message ||
                    error?.message ||
                    "Something went wrong. Please try again.",
            }));

        } finally {
            setIsSubmitting(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | PREVIEW
    |--------------------------------------------------------------------------
    */

    const previewImage = image
        ? URL.createObjectURL(image)
        : form.imageUrl || DEFAULT_PREVIEW_IMAGE;

    const formattedPrice = form.price
        ? `₦${new Intl.NumberFormat("en-NG").format(
            Number(form.price)
        )}`
        : "₦25,000";

    /*
    |--------------------------------------------------------------------------
    | SELECT VALUES
    |--------------------------------------------------------------------------
    */

    const selectedServiceOption =
        serviceList.find(
            (option) => option.value === service
        ) || null;

    const selectedSubServiceOption =
        serviceSubList.find(
            (option) => option.value === subService
        ) || null;

    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <>
            <div className="service-layout">

                {/* =====================================================
                    LEFT COLUMN
                ===================================================== */}

                <section className="left-column">

                    <form
                        id="service-form"
                        className="service-card"
                        onSubmit={handleSubmit}
                        noValidate
                    >

                        {/* SERVICE INFORMATION */}

                        <div className="section-heading">
                            <h2>Service Information</h2>

                            <p>
                                Add the details customers need to
                                understand and book this service.
                            </p>
                        </div>

                        {/* SERVICE NAME */}

                        <div className="form-group">

                            <div className="settings-row">

                                {/* CATEGORY */}

                                <div className="form-group category-group">

                                    <label>
                                        Category <span>*</span>
                                    </label>

                                    <Select
                                        options={serviceList}
                                        isSearchable
                                        isClearable
                                        value={selectedServiceOption}
                                        onChange={
                                            handleServiceChange
                                        }
                                        placeholder="Select a category..."
                                        styles={selectStyles}
                                        hasError={Boolean(
                                            errors.service
                                        )}
                                        noOptionsMessage={() =>
                                            "No categories found"
                                        }
                                    />

                                    {errors.service && (
                                        <p className="error-message">
                                            {errors.service}
                                        </p>
                                    )}

                                </div>

                                {/* SUB-CATEGORY */}

                                <div className="form-group category-group">

                                    <label>
                                        Sub-Category <span>*</span>
                                    </label>

                                    <Select
                                        options={serviceSubList}
                                        isSearchable
                                        isClearable
                                        isDisabled={!service}
                                        value={
                                            selectedSubServiceOption
                                        }
                                        onChange={
                                            handleSubServiceChange
                                        }
                                        placeholder={
                                            service
                                                ? "Select a sub-category..."
                                                : "Select a category first..."
                                        }
                                        styles={selectStyles}
                                        hasError={Boolean(
                                            errors.subService
                                        )}
                                        noOptionsMessage={() =>
                                            service
                                                ? "No sub-categories found"
                                                : "Select a category first"
                                        }
                                    />

                                    {errors.subService && (
                                        <p className="error-message">
                                            {errors.subService}
                                        </p>
                                    )}

                                </div>

                            </div>


                        </div>

                        {/* DESCRIPTION */}

                        <div className="form-group">

                            <label htmlFor="service-description">
                                Description <span>*</span>
                            </label>

                            <div className="textarea-wrapper">

                                <textarea
                                    id="service-description"
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    maxLength={
                                        MAX_DESCRIPTION_LENGTH
                                    }
                                    placeholder="Describe the service, its benefits, what customers can expect, and who it is suitable for."
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

                            {/* PRICE */}

                            <div className="form-group">

                                <label htmlFor="service-price">
                                    Price (₦) <span>*</span>
                                </label>

                                <input
                                    id="service-price"
                                    type="number"
                                    name="price"
                                    value={form.price}
                                    onChange={handleChange}
                                    min="1"
                                    max="100000000"
                                    step="1"
                                    inputMode="numeric"
                                    placeholder="e.g. 25000"
                                    className={
                                        errors.price
                                            ? "input-error"
                                            : ""
                                    }
                                />

                                {errors.price && (
                                    <p className="error-message">
                                        {errors.price}
                                    </p>
                                )}

                            </div>

                            {/* DURATION */}

                            <div className="form-group">

                                <label htmlFor="service-duration">
                                    Duration (Minutes){" "}
                                    <span>*</span>
                                </label>

                                <div className="icon-input">

                                    <input
                                        id="service-duration"
                                        type="number"
                                        name="duration"
                                        value={form.duration}
                                        onChange={handleChange}
                                        min="1"
                                        max="1440"
                                        step="1"
                                        inputMode="numeric"
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

                        {/* <div className="form-group image-section">

                            <label>
                                Service Image <span>*</span>
                            </label>

                            <p className="field-description">
                                Upload a clear image that represents
                                this treatment or service.
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
                                    Upload service image
                                </strong>

                                <span>
                                    Click to browse your device
                                </span>

                            </label>

                            <div className="upload-footer">

                                <span>
                                    JPG, PNG or WebP · Maximum 5MB
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

                            {image && (
                                <div className="selected-file">
                                    <IoCheckmarkCircle />

                                    <span>
                                        {image.name}
                                    </span>
                                </div>
                            )}

                            {errors.image && (
                                <p className="error-message">
                                    {errors.image}
                                </p> 
                            )}

                        </div> */}

                    </form>

                </section>

                {/* =====================================================
                    RIGHT COLUMN
                ===================================================== */}

                <section className="right-column">

                    {/* TIPS */}

                    <section className="tips-card">

                        <h3>
                            <IoBulbOutline />
                            Tips for a great service listing
                        </h3>

                        <ul>

                            <li>
                                <IoCheckmarkCircle />
                                Use a clear, professional image
                            </li>

                            <li>
                                <IoCheckmarkCircle />
                                Explain the treatment clearly
                            </li>

                            <li>
                                <IoCheckmarkCircle />
                                Set the correct service price
                            </li>

                            <li>
                                <IoCheckmarkCircle />
                                Specify the treatment duration
                            </li>

                            <li>
                                <IoCheckmarkCircle />
                                Highlight important benefits
                            </li>

                            <li>
                                <IoCheckmarkCircle />
                                Keep service information updated
                            </li>

                        </ul>

                    </section>

                    {/* FOOTER */}

                    <div className="service-footer">

                        <div className="footer-actions">

                            <button
                                type="submit"
                                form="service-form"
                                className="publish-button"
                                disabled={isSubmitting}
                            // onClick={handleSubmit}
                            >
                                {isSubmitting
                                    ? "Publishing..."
                                    : "Publish Service"}
                            </button>

                        </div>

                    </div>

                </section>

            </div>

            {errors.submit && (
                <div className="submit-error">
                    {errors.submit}
                </div>
            )}
        </>
    );
}