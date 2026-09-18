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
import uuidV4 from "uuid-v4";
import { api, baseApi } from "../../../api/config";

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

    const [image, setImage] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [productId, setProductId] = useState("");

    useEffect(() => {
        setProductId(uuidV4());
    }, []);

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

        setSubService("");

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

    const handleImageUpload = async (e) => {
        if(image.length === 1) {
            alert("You can upload only one image!");
            return;
        };
        const files = Array.from(e.target.files || []);

        if (!files.length) {
            return;
        }

        try {
            setIsSubmitting(true);

            setErrors((prev) => ({
                ...prev,
                image: "",
                images: "",
            }));

            /*
             * Validate ALL selected files before uploading
             * any of them.
             */

            for (const file of files) {
                if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                    throw new Error(
                        `${file.name}: Only JPEG, PNG, or WebP images are allowed.`
                    );
                }

                if (file.size > MAX_IMAGE_SIZE) {
                    throw new Error(
                        `${file.name}: Image must not exceed 5MB.`
                    );
                }
            }

            /*
             * Upload each image individually.
             *
             * Each uploaded image is appended to the
             * existing image array.
             */

            for (const file of files) {
                const formData = new FormData();

                formData.append("file", file);

                formData.append(
                    "product_id",
                    productId
                );

                const {
                    data,
                    status,
                } = await baseApi.post(
                    "upload",
                    formData,
                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data",
                        },
                    }
                );

                if (
                    status !== 200 ||
                    !data?.url
                ) {
                    throw new Error(
                        data?.error ||
                        `Failed to upload ${file.name}`
                    );
                }

                /*
                 * Store the Cloudinary URL,
                 * public ID and original file name.
                 */

                const uploadedImage = {
                    url: data.url,
                    publicId:
                        data.publicId ||
                        extractPublicId(data.url),
                    name: file.name,
                };

                /*
                 * IMPORTANT:
                 *
                 * Do NOT replace the previous images.
                 * Append the new image to the existing array.
                 */

                setImage((prev) => [
                    ...prev,
                    uploadedImage,
                ]);
            }
        } catch (error) {
            console.error(
                "Image upload error:",
                error
            );

            setErrors((prev) => ({
                ...prev,
                image:
                    error?.message ||
                    "Image upload failed.",
            }));
        } finally {
            setIsSubmitting(false);

            /*
             * Allows the user to select the same
             * image again if necessary.
             */

            e.target.value = "";
        }
    };

    /*
    |--------------------------------------------------------------------------
    | EXTRACT CLOUDINARY PUBLIC ID
    |--------------------------------------------------------------------------
    */

    const extractPublicId = (url) => {
        try {
            const pathname =
                new URL(url).pathname;

            const uploadIndex =
                pathname.indexOf("/upload/");

            if (uploadIndex === -1) {
                return null;
            }

            let publicId =
                pathname.substring(
                    uploadIndex +
                        "/upload/".length
                );

            /*
             * Remove Cloudinary version.
             *
             * v123456789/
             */

            publicId =
                publicId.replace(
                    /^v\d+\//,
                    ""
                );

            /*
             * Remove file extension.
             */

            publicId =
                publicId.replace(
                    /\.[^/.]+$/,
                    ""
                );

            return publicId;
        } catch (error) {
            return null;
        }
    };

    /*
    |--------------------------------------------------------------------------
    | DELETE IMAGE FROM CLOUDINARY
    |--------------------------------------------------------------------------
    */

    const deleteImage = async (publicId) => {
        if (!publicId) {
            throw new Error(
                "Image public ID is required."
            );
        }

        const {
            data,
            status,
        } = await baseApi.delete(
            "delete",
            {
                data: {
                    publicId,
                },
            }
        );

        if (
            status !== 200 ||
            !data?.success
        ) {
            throw new Error(
                data?.error ||
                    "Failed to delete image."
            );
        }

        return data;
    };

    /*
    |--------------------------------------------------------------------------
    | DELETE INDIVIDUAL IMAGE
    |--------------------------------------------------------------------------
    */

    const handleDeleteImage = async (index) => {
        const selectedImage = image[index];

        if (!selectedImage) {
            return;
        }

        const publicId =
            typeof selectedImage === "string"
                ? extractPublicId(selectedImage)
                : selectedImage.publicId;

        try {
            setIsSubmitting(true);

            setErrors((prev) => ({
                ...prev,
                image: "",
                images: "",
            }));

            /*
             * Delete from Cloudinary first.
             *
             * If the public ID exists.
             */

            if (publicId) {
                await deleteImage(publicId);
            }

            /*
             * Remove the image from local state.
             */

            setImage((prev) =>
                prev.filter(
                    (_, i) => i !== index
                )
            );
        } catch (error) {
            console.error(
                "Delete image error:",
                error
            );

            setErrors((prev) => ({
                ...prev,
                image:
                    error?.message ||
                    "Failed to delete image.",
            }));
        } finally {
            setIsSubmitting(false);
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
                    borderColor:
                        state.selectProps.hasError
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

                backgroundColor:
                    state.isSelected
                        ? "#278A3D"
                        : state.isFocused
                            ? "#E8F5EB"
                            : "#ffffff",

                cursor: "pointer",

                transition:
                    "background-color 0.15s ease",

                "&:active": {
                    backgroundColor: "#278A3D",
                    color: "#ffffff",
                },
            }),

            indicatorSeparator: () => ({
                display: "none",
            }),

            dropdownIndicator: (
                base,
                state
            ) => ({
                ...base,

                color: state.isFocused
                    ? "#278A3D"
                    : "#829087",

                paddingRight: "12px",

                transition:
                    "transform 0.2s ease, color 0.2s ease",

                transform:
                    state.selectProps.menuIsOpen
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

        const description =
            form.description.trim();

        const price = Number(form.price);

        const duration =
            Number(form.duration);

        const imageUrl =
            form.imageUrl.trim();

        /*
        |--------------------------------------------------------------------------
        | DESCRIPTION
        |--------------------------------------------------------------------------
        */

        if (!description) {
            newErrors.description =
                "Description is required.";
        } else if (description.length < 20) {
            newErrors.description =
                "Description must be at least 20 characters.";
        } else if (
            description.length >
            MAX_DESCRIPTION_LENGTH
        ) {
            newErrors.description =
                `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters.`;
        }

        /*
        |--------------------------------------------------------------------------
        | PRICE
        |--------------------------------------------------------------------------
        */

        if (form.price === "") {
            newErrors.price =
                "Price is required.";
        } else if (!Number.isFinite(price)) {
            newErrors.price =
                "Please enter a valid price.";
        } else if (price <= 0) {
            newErrors.price =
                "Price must be greater than ₦0.";
        } else if (price > 100000000) {
            newErrors.price =
                "Price cannot exceed ₦100,000,000.";
        }

        /*
        |--------------------------------------------------------------------------
        | DURATION
        |--------------------------------------------------------------------------
        */

        if (form.duration === "") {
            newErrors.duration =
                "Duration is required.";
        } else if (
            !Number.isFinite(duration)
        ) {
            newErrors.duration =
                "Please enter a valid duration.";
        } else if (
            !Number.isInteger(duration)
        ) {
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
        |--------------------------------------------------------------------------
        | IMAGE
        |--------------------------------------------------------------------------
        */

        if (image.length === 0) {
            newErrors.image =
                "Please upload at least one image.";
        }

        /*
        |--------------------------------------------------------------------------
        | IMAGE URL
        |--------------------------------------------------------------------------
        */

        if (imageUrl) {
            try {
                const url =
                    new URL(imageUrl);

                if (
                    ![
                        "http:",
                        "https:",
                    ].includes(
                        url.protocol
                    )
                ) {
                    newErrors.imageUrl =
                        "Image URL must use HTTP or HTTPS.";
                }
            } catch {
                newErrors.imageUrl =
                    "Please enter a valid image URL.";
            }
        }

        /*
        |--------------------------------------------------------------------------
        | SERVICE CATEGORY
        |--------------------------------------------------------------------------
        */

        if (!service) {
            newErrors.service =
                "Please select a service category.";
        }

        /*
        |--------------------------------------------------------------------------
        | SUB-SERVICE
        |--------------------------------------------------------------------------
        */

        if (
            service &&
            !subService
        ) {
            newErrors.subService =
                "Please select a sub-category.";
        }

        setErrors(newErrors);

        return (
            Object.keys(newErrors)
                .length === 0
        );
    };

    /*
    |--------------------------------------------------------------------------
    | SELECT HANDLERS
    |--------------------------------------------------------------------------
    */

    const handleServiceChange = (
        selected
    ) => {
        const value =
            selected?.value || "";

        setService(value);

        if (errors.service) {
            setErrors((prev) => ({
                ...prev,
                service: "",
            }));
        }
    };

    const handleSubServiceChange = (
        selected
    ) => {
        const value =
            selected?.value || "";

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
                description:
                    form.description.trim(),

                price:
                    Number(form.price),

                duration_minutes:
                    Number(form.duration),

                service,

                sub_service:
                    subService,
                specifications: ({
                    hash: productId
                }),
                /*
                 * All uploaded images.
                 */

                image_url: image[0].url,
            };

            const { data } =
                await api.post(
                    "services/add",
                    serviceData
                );

            if (!data?.success) {
                throw new Error(
                    data?.message ||
                        "Failed to create service."
                );
            }

            alert(
                "Service created successfully!"
            );

            window.location.href =
                "/admin/catalog";
        } catch (error) {
            console.error(
                "CREATE SERVICE ERROR:",
                error
            );

            setErrors((prev) => ({
                ...prev,

                submit:
                    error?.response
                        ?.data?.message ||
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

    const previewImage =
        image.length > 0
            ? image[0]?.url
            : form.imageUrl ||
              DEFAULT_PREVIEW_IMAGE;

    const formattedPrice =
        form.price
            ? `₦${new Intl.NumberFormat(
                "en-NG"
            ).format(
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
            (option) =>
                option.value ===
                service
        ) || null;

    const selectedSubServiceOption =
        serviceSubList.find(
            (option) =>
                option.value ===
                subService
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
                        onSubmit={
                            handleSubmit
                        }
                        noValidate
                    >

                        {/* SERVICE INFORMATION */}

                        <div className="section-heading">

                            <h2>
                                Service Information
                            </h2>

                            <p>
                                Add the details
                                customers need to
                                understand and book
                                this service.
                            </p>

                        </div>

                        {/* CATEGORY + SUB-CATEGORY */}

                        <div className="form-group">

                            <div className="settings-row">

                                {/* CATEGORY */}

                                <div className="form-group category-group">

                                    <label>
                                        Category{" "}
                                        <span>*</span>
                                    </label>

                                    <Select
                                        options={
                                            serviceList
                                        }
                                        isSearchable
                                        isClearable
                                        value={
                                            selectedServiceOption
                                        }
                                        onChange={
                                            handleServiceChange
                                        }
                                        placeholder="Select a category..."
                                        styles={
                                            selectStyles
                                        }
                                        hasError={Boolean(
                                            errors.service
                                        )}
                                        noOptionsMessage={() =>
                                            "No categories found"
                                        }
                                    />

                                    {errors.service && (
                                        <p className="error-message">
                                            {
                                                errors.service
                                            }
                                        </p>
                                    )}

                                </div>

                                {/* SUB-CATEGORY */}

                                <div className="form-group category-group">

                                    <label>
                                        Sub-Category{" "}
                                        <span>*</span>
                                    </label>

                                    <Select
                                        options={
                                            serviceSubList
                                        }
                                        isSearchable
                                        isClearable
                                        isDisabled={
                                            !service
                                        }
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
                                        styles={
                                            selectStyles
                                        }
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
                                            {
                                                errors.subService
                                            }
                                        </p>
                                    )}

                                </div>

                            </div>

                        </div>

                        {/* DESCRIPTION */}

                        <div className="form-group">

                            <label htmlFor="service-description">
                                Description{" "}
                                <span>*</span>
                            </label>

                            <div className="textarea-wrapper">

                                <textarea
                                    id="service-description"
                                    name="description"
                                    value={
                                        form.description
                                    }
                                    onChange={
                                        handleChange
                                    }
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

                                    {
                                        form
                                            .description
                                            .length
                                    }
                                    /
                                    {
                                        MAX_DESCRIPTION_LENGTH
                                    }

                                </span>

                            </div>

                            {errors.description && (
                                <p className="error-message">
                                    {
                                        errors.description
                                    }
                                </p>
                            )}

                        </div>

                        {/* PRICE + DURATION */}

                        <div className="two-column">

                            {/* PRICE */}

                            <div className="form-group">

                                <label htmlFor="service-price">
                                    Price (₦){" "}
                                    <span>*</span>
                                </label>

                                <input
                                    id="service-price"
                                    type="number"
                                    name="price"
                                    value={
                                        form.price
                                    }
                                    onChange={
                                        handleChange
                                    }
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
                                        {
                                            errors.price
                                        }
                                    </p>
                                )}

                            </div>

                            {/* DURATION */}

                            <div className="form-group">

                                <label htmlFor="service-duration">
                                    Duration
                                    (Minutes){" "}
                                    <span>*</span>
                                </label>

                                <div className="icon-input">

                                    <input
                                        id="service-duration"
                                        type="number"
                                        name="duration"
                                        value={
                                            form.duration
                                        }
                                        onChange={
                                            handleChange
                                        }
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
                                        {
                                            errors.duration
                                        }
                                    </p>
                                )}

                            </div>

                        </div>

                        {/* IMAGE */}

                        <div className="form-group image-section">

                            <label>
                                Service Images{" "}
                                <span>*</span>
                            </label>

                            <p className="field-description">
                                Upload one or more
                                clear images that
                                represent this
                                treatment or service.
                            </p>

                            {/* UPLOAD BOX */}

                            <label className="upload-box">

                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    multiple
                                    onChange={
                                        handleImageUpload
                                    }
                                    hidden
                                />

                                <IoCloudUploadOutline />

                                <strong>
                                    Upload service
                                    images
                                </strong>

                                <span>
                                    Click to browse
                                    your device
                                </span>

                            </label>

                            {/* UPLOAD FOOTER */}

                            <div className="upload-footer">

                                <span>
                                    JPG, PNG or WebP ·
                                    Maximum 5MB per
                                    image
                                </span>

                                <label className="choose-image">

                                    Choose Images

                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        multiple
                                        onChange={
                                            handleImageUpload
                                        }
                                        hidden
                                    />

                                </label>

                            </div>

                            {/* =================================================
                                IMAGE PREVIEWS
                            ================================================= */}

                            {image.length > 0 && (
                                <div
                                    className="image-preview-grid"
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns:
                                            "repeat(auto-fill, minmax(140px, 1fr))",
                                        gap: "12px",
                                        marginTop: "16px",
                                    }}
                                >

                                    {image.map(
                                        (
                                            item,
                                            index
                                        ) => (
                                            <div
                                                key={
                                                    item.publicId ||
                                                    item.url ||
                                                    index
                                                }
                                                style={{
                                                    position:
                                                        "relative",
                                                    width:
                                                        "100%",
                                                    aspectRatio:
                                                        "1 / 1",
                                                    borderRadius:
                                                        "12px",
                                                    overflow:
                                                        "hidden",
                                                    border:
                                                        "1px solid #d9e1db",
                                                    background:
                                                        "#f5f8f5",
                                                }}
                                            >

                                                {/* IMAGE */}

                                                <img
                                                    src={
                                                        item.url
                                                    }
                                                    alt={
                                                        item.name ||
                                                        `Service image ${index + 1}`
                                                    }
                                                    style={{
                                                        width:
                                                            "100%",
                                                        height:
                                                            "100%",
                                                        objectFit:
                                                            "cover",
                                                        display:
                                                            "block",
                                                    }}
                                                />

                                                {/* IMAGE OVERLAY */}

                                                <div
                                                    style={{
                                                        position:
                                                            "absolute",
                                                        left:
                                                            0,
                                                        right:
                                                            0,
                                                        bottom:
                                                            0,
                                                        padding:
                                                            "8px",
                                                        display:
                                                            "flex",
                                                        alignItems:
                                                            "center",
                                                        justifyContent:
                                                            "space-between",
                                                        gap:
                                                            "8px",
                                                        background:
                                                            "linear-gradient(transparent, rgba(0,0,0,0.75))",
                                                        paddingTop:
                                                            "30px",
                                                    }}
                                                >

                                                    <span
                                                        style={{
                                                            color:
                                                                "#ffffff",
                                                            fontSize:
                                                                "12px",
                                                            fontWeight:
                                                                500,
                                                            overflow:
                                                                "hidden",
                                                            textOverflow:
                                                                "ellipsis",
                                                            whiteSpace:
                                                                "nowrap",
                                                            flex:
                                                                1,
                                                        }}
                                                    >
                                                        {
                                                            item.name ||
                                                            `Image ${index + 1}`
                                                        }
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeleteImage(
                                                                index
                                                            )
                                                        }
                                                        disabled={
                                                            isSubmitting
                                                        }
                                                        aria-label={`Delete image ${index + 1}`}
                                                        style={{
                                                            width:
                                                                "28px",
                                                            height:
                                                                "28px",
                                                            minWidth:
                                                                "28px",
                                                            border:
                                                                "none",
                                                            borderRadius:
                                                                "50%",
                                                            background:
                                                                "rgba(255,255,255,0.95)",
                                                            color:
                                                                "#dc2626",
                                                            fontSize:
                                                                "20px",
                                                            lineHeight:
                                                                "1",
                                                            cursor:
                                                                isSubmitting
                                                                    ? "not-allowed"
                                                                    : "pointer",
                                                            display:
                                                                "flex",
                                                            alignItems:
                                                                "center",
                                                            justifyContent:
                                                                "center",
                                                            padding:
                                                                0,
                                                        }}
                                                    >
                                                        ×
                                                    </button>

                                                </div>

                                            </div>
                                        )
                                    )}

                                </div>
                            )}

                            {/* IMAGE COUNT */}

                            {image.length > 0 && (
                                <div
                                    style={{
                                        marginTop:
                                            "10px",
                                        fontSize:
                                            "13px",
                                        color:
                                            "#68756c",
                                    }}
                                >
                                    {image.length}{" "}
                                    {image.length === 1
                                        ? "image"
                                        : "images"}{" "}
                                    uploaded
                                </div>
                            )}

                            {/* IMAGE ERROR */}

                            {(errors.image ||
                                errors.images) && (
                                <p className="error-message">
                                    {
                                        errors.image ||
                                        errors.images
                                    }
                                </p>
                            )}

                        </div>

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

                            Tips for a great
                            service listing

                        </h3>

                        <ul>

                            <li>
                                <IoCheckmarkCircle />

                                Use a clear,
                                professional image

                            </li>

                            <li>
                                <IoCheckmarkCircle />

                                Explain the
                                treatment clearly

                            </li>

                            <li>
                                <IoCheckmarkCircle />

                                Set the correct
                                service price

                            </li>

                            <li>
                                <IoCheckmarkCircle />

                                Specify the
                                treatment duration

                            </li>

                            <li>
                                <IoCheckmarkCircle />

                                Highlight
                                important benefits

                            </li>

                            <li>
                                <IoCheckmarkCircle />

                                Keep service
                                information updated

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
                                disabled={
                                    isSubmitting
                                }
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