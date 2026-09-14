"use client";

import { useEffect, useState } from "react";
import {
    IoSettingsOutline,
    IoTrashBin
} from "react-icons/io5";
import "./styles/xxl.css";
import {
    api,
    baseApi
} from "../../api/config";
import Select from "react-select";
import uuidV4 from "uuid-v4";

const DRAFT_KEY = "deskinculture_create_product_draft";

export default function CreateProductPage() {

    const [productName, setProductName] = useState("");

    const [description, setDescription] = useState("");

    const [discountType, setDiscountType] = useState("");

    const [productId, setProductId] = useState("");

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [price, setPrice] = useState("");
    const [discount, setDiscount] = useState("");

    const [category, setCategory] = useState("");
    const [subCategory, setSubCategory] = useState("");

    const [brand, setBrand] = useState("");
    const [quantity, setQuantity] = useState("");

    /*
     * Images are stored like:
     *
     * [
     *     {
     *         url: "https://res.cloudinary.com/...",
     *         publicId: "Deskinculture/products/xxx/image"
     *     }
     * ]
     */
    const [images, setImages] = useState([]);

    const [selectedImage, setSelectedImage] = useState(0);

    const [subCategoryOptions, setSubCategoryOptions] = useState([]);

    /*
     * This prevents the autosave effect from overwriting
     * an existing localStorage draft with empty initial values.
     */
    const [isDraftLoaded, setIsDraftLoaded] = useState(false);



    useEffect(() => {
        let data = formatSubCategory(category);
        setSubCategoryOptions(data);
    }, [category])


    /*
     * =========================================================
     * RESTORE PRODUCT DRAFT FROM LOCAL STORAGE
     * =========================================================
     *
     * This runs when the page loads/reloads.
     *
     * If a draft exists, all the form fields are restored.
     * If no draft exists, a new product ID is generated.
     */
    useEffect(() => {

        try {

            const savedDraft = localStorage.getItem(DRAFT_KEY);

            if (savedDraft) {

                const draft = JSON.parse(savedDraft);

                /*
                 * Restore product ID.
                 *
                 * This is important because all uploaded images
                 * for this unfinished product should continue using
                 * the same Cloudinary folder.
                 */
                setProductId(
                    draft.productId || uuidV4()
                );

                /*
                 * Restore all form fields.
                 */
                setProductName(
                    draft.productName ?? ""
                );

                setDescription(
                    draft.description ?? ""
                );

                setDiscountType(
                    draft.discountType ?? ""
                );

                setPrice(
                    draft.price ?? ""
                );

                setDiscount(
                    draft.discount ?? ""
                );

                setCategory(
                    draft.category ?? ""
                );

                setSubCategory(
                    draft.subCategory ?? ""
                );

                setBrand(
                    draft.brand ?? ""
                );

                setQuantity(
                    draft.quantity ?? ""
                );

                /*
                 * Restore images.
                 *
                 * New format:
                 *
                 * {
                 *     url,
                 *     publicId
                 * }
                 *
                 * We also support old drafts where images
                 * were stored simply as URLs.
                 */
                if (Array.isArray(draft.images)) {

                    const restoredImages =
                        draft.images
                            .filter(Boolean)
                            .map((image) => {

                                if (typeof image === "string") {

                                    return {
                                        url: image,
                                        publicId:
                                            extractPublicId(image)
                                    };
                                }

                                return image;
                            });

                    setImages(restoredImages);

                    /*
                     * Make sure selectedImage isn't outside
                     * the available image range.
                     */
                    const savedSelectedImage =
                        Number(draft.selectedImage) || 0;

                    setSelectedImage(
                        Math.min(
                            Math.max(savedSelectedImage, 0),
                            Math.max(restoredImages.length - 1, 0)
                        )
                    );

                } else {

                    setImages([]);
                    setSelectedImage(0);

                }

            } else {

                /*
                 * No existing draft.
                 * Generate a new product ID.
                 */
                setProductId(uuidV4());

            }

        } catch (error) {

            console.error(
                "Failed to restore product draft:",
                error
            );

            /*
             * If localStorage is corrupted,
             * start a new product.
             */
            setProductId(uuidV4());

        } finally {

            /*
             * Only after the localStorage restoration is complete
             * do we allow the autosave effect to run.
             */
            setIsDraftLoaded(true);

        }

    }, []);


    /*
     * =========================================================
     * AUTO SAVE PRODUCT DRAFT
     * =========================================================
     *
     * Whenever any field changes, the entire unfinished product
     * is saved to localStorage.
     */
    useEffect(() => {

        /*
         * IMPORTANT:
         *
         * Don't save anything before the restoration effect
         * has finished.
         *
         * Otherwise the initial empty React state could overwrite
         * the existing localStorage draft.
         */
        if (!isDraftLoaded || !productId) {
            return;
        }

        const draft = {

            productId,

            productName,

            description,

            discountType,

            price,

            discount,

            category,

            subCategory,

            brand,

            quantity,

            images,

            selectedImage

        };

        localStorage.setItem(
            DRAFT_KEY,
            JSON.stringify(draft)
        );

    }, [
        isDraftLoaded,
        productId,
        productName,
        description,
        discountType,
        price,
        discount,
        category,
        subCategory,
        brand,
        quantity,
        images,
        selectedImage
    ]);


    /*
     * =========================================================
     * PERSIST DRAFT IMMEDIATELY
     * =========================================================
     *
     * Used specifically after an image upload/delete.
     *
     * This means the image is saved to localStorage immediately
     * instead of waiting for another React render/effect cycle.
     */
    const persistDraft = (nextImages = images) => {

        if (!productId) {
            return;
        }

        const draft = {

            productId,

            productName,

            description,

            discountType,

            price,

            discount,

            category,

            subCategory,

            brand,

            quantity,

            images: nextImages,

            selectedImage

        };

        localStorage.setItem(
            DRAFT_KEY,
            JSON.stringify(draft)
        );

    };


    /*
     * =========================================================
     * IMAGE UPLOAD
     * =========================================================
     *
     * Images are uploaded immediately to Cloudinary.
     *
     * We upload sequentially rather than using Promise.all()
     * because we want each successful image to be persisted
     * immediately.
     *
     * Example:
     *
     * Image 1 -> uploaded -> saved
     * Image 2 -> uploaded -> saved
     * Image 3 -> upload fails
     *
     * Images 1 and 2 are still available after a reload.
     */
    const handleImageUpload = async (e) => {

        const files = Array.from(
            e.target.files || []
        );

        if (!files.length) {
            return;
        }

        try {

            setIsSubmitting(true);

            setErrors((prev) => ({
                ...prev,
                images: ""
            }));

            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/webp"
            ];

            /*
             * Validate all files before uploading.
             */
            for (const file of files) {

                if (!allowedTypes.includes(file.type)) {

                    throw new Error(
                        `${file.name}: Only JPEG, PNG, or WebP images are allowed.`
                    );

                }

                if (file.size > 8 * 1024 * 1024) {

                    throw new Error(
                        `${file.name}: Image must not exceed 8MB.`
                    );

                }

            }


            /*
             * Upload each image individually.
             */
            for (const file of files) {

                const formData = new FormData();

                formData.append(
                    "file",
                    file
                );

                /*
                 * This product ID is used by your backend
                 * to determine the Cloudinary folder.
                 *
                 * Example:
                 *
                 * Deskinculture/products/{productId}
                 */
                formData.append(
                    "product_id",
                    productId
                );


                const {
                    data,
                    status
                } = await baseApi.post(
                    "upload",
                    formData,
                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data"
                        }
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
                 * Keep both the URL and public ID.
                 *
                 * URL = display image
                 *
                 * publicId = delete image from Cloudinary
                 */
                const uploadedImage = {

                    url: data.url,

                    publicId:
                        data.publicId ||
                        extractPublicId(data.url)

                };


                /*
                 * Add the newly uploaded image.
                 */
                setImages((prev) => {

                    const nextImages = [
                        ...prev,
                        uploadedImage
                    ];

                    /*
                     * Immediately persist this image
                     * and the current product draft.
                     */
                    persistDraft(nextImages);

                    return nextImages;

                });

            }

        } catch (error) {

            console.error(
                "Image upload error:",
                error
            );

            setErrors((prev) => ({
                ...prev,
                images:
                    error?.message ||
                    "Image upload failed."
            }));

        } finally {

            setIsSubmitting(false);

            /*
             * Allows the user to select the same file again.
             */
            e.target.value = "";

        }

    };


    /*
     * =========================================================
     * EXTRACT CLOUDINARY PUBLIC ID
     * =========================================================
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
             * Remove version:
             *
             * v123456789/
             */
            publicId =
                publicId.replace(
                    /^v\d+\//,
                    ""
                );

            /*
             * Remove extension.
             *
             * image.jpg
             *
             * becomes:
             *
             * image
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
     * =========================================================
     * DELETE IMAGE FROM CLOUDINARY
     * =========================================================
     */
    const deleteImage = async (publicId) => {

        if (!publicId) {

            throw new Error(
                "Image public ID is required."
            );

        }


        const {
            data,
            status
        } = await baseApi.delete(
            "delete",
            {
                data: {
                    publicId
                }
            }
        );


        if (
            status !== 200 ||
            !data.success
        ) {

            throw new Error(
                data?.error ||
                "Failed to delete image."
            );

        }


        return data;

    };


    /*
     * =========================================================
     * DELETE INDIVIDUAL IMAGE
     * =========================================================
     */
    const handleDeleteImage = async (index) => {

        const image = images[index];

        if (!image) {
            return;
        }


        /*
         * New image structure:
         *
         * {
         *     url,
         *     publicId
         * }
         *
         * But support old URL-only values too.
         */
        const publicId =
            typeof image === "string"
                ? extractPublicId(image)
                : image.publicId;


        if (!publicId) {

            setErrors((prev) => ({
                ...prev,
                images:
                    "Unable to determine the image public ID."
            }));

            return;

        }


        try {

            setIsSubmitting(true);

            setErrors((prev) => ({
                ...prev,
                images: ""
            }));


            /*
             * Delete from Cloudinary first.
             */
            await deleteImage(publicId);


            /*
             * Remove from local state.
             */
            const nextImages =
                images.filter(
                    (_, i) => i !== index
                );

            setImages(nextImages);


            /*
             * Fix selected image index.
             */
            let nextSelectedImage =
                selectedImage;


            if (nextImages.length === 0) {

                nextSelectedImage = 0;

            } else if (
                selectedImage > index
            ) {

                nextSelectedImage =
                    selectedImage - 1;

            } else if (
                selectedImage >=
                nextImages.length
            ) {

                nextSelectedImage =
                    nextImages.length - 1;

            }


            setSelectedImage(
                nextSelectedImage
            );


            /*
             * Immediately persist deletion.
             */
            const draft = {

                productId,

                productName,

                description,

                discountType,

                price,

                discount,

                category,

                subCategory,

                brand,

                quantity,

                images: nextImages,

                selectedImage:
                    nextSelectedImage

            };

            localStorage.setItem(
                DRAFT_KEY,
                JSON.stringify(draft)
            );


        } catch (error) {

            console.error(
                "Delete image error:",
                error
            );

            setErrors((prev) => ({
                ...prev,
                images:
                    error?.message ||
                    "Failed to delete image."
            }));

        } finally {

            setIsSubmitting(false);

        }

    };


    /*
     * =========================================================
     * SUBMIT PRODUCT
     * =========================================================
     */
    const handleSubmit = async (e) => {

        e.preventDefault();

        const newErrors = {};


        /*
         * PRODUCT NAME
         */
        if (!productName.trim()) {

            newErrors.productName =
                "Product name is required.";

        } else if (
            productName.trim().length < 3
        ) {

            newErrors.productName =
                "Product name must be at least 3 characters.";

        }


        /*
         * DESCRIPTION
         */
        if (!description.trim()) {

            newErrors.description =
                "Product description is required.";

        } else if (
            description.trim().length < 10
        ) {

            newErrors.description =
                "Description must be at least 10 characters.";

        }


        /*
         * IMAGES
         */
        if (
            !images ||
            images.length === 0
        ) {

            newErrors.images =
                "At least one product image is required.";

        }


        /*
         * PRICE
         */
        const numericPrice =
            Number(price);


        if (
            !price ||
            Number.isNaN(numericPrice)
        ) {

            newErrors.price =
                "Product price is required.";

        } else if (
            numericPrice <= 0
        ) {

            newErrors.price =
                "Product price must be greater than ₦0.";

        }


        /*
         * DISCOUNT
         */
        const numericDiscount =
            discount === ""
                ? 0
                : Number(discount);


        if (
            discount !== "" &&
            Number.isNaN(numericDiscount)
        ) {

            newErrors.discount =
                "Enter a valid discount.";

        } else if (
            numericDiscount < 0
        ) {

            newErrors.discount =
                "Discount cannot be negative.";

        }


        /*
         * PERCENTAGE DISCOUNT
         */
        if (
            discountType === "percentage" &&
            numericDiscount > 100
        ) {

            newErrors.discount =
                "Percentage discount cannot exceed 100%.";

        }


        /*
         * FIXED DISCOUNT
         */
        if (
            discountType === "fixed" &&
            numericDiscount >= numericPrice
        ) {

            newErrors.discount =
                "Fixed discount must be less than the product price.";

        }


        /*
         * If a discount was entered,
         * discount type should also be selected.
         */
        if (
            discount !== "" &&
            numericDiscount > 0 &&
            !discountType
        ) {

            newErrors.discountType =
                "Please select a discount type.";

        }


        /*
         * QUANTITY
         */
        const numericQuantity =
            Number(quantity);


        if (
            quantity === "" ||
            Number.isNaN(numericQuantity)
        ) {

            newErrors.quantity =
                "Quantity is required.";

        } else if (
            !Number.isInteger(numericQuantity)
        ) {

            newErrors.quantity =
                "Quantity must be a whole number.";

        } else if (
            numericQuantity < 0
        ) {

            newErrors.quantity =
                "Quantity cannot be negative.";

        }


        /*
         * CATEGORY
         */
        if (!category) {

            newErrors.category =
                "Please select a category.";

        }


        /*
         * SUBCATEGORY
         */
        if (!subCategory) {

            newErrors.subCategory =
                "Please select a sub-category.";

        }


        /*
         * BRAND
         */
        if (!brand) {

            newErrors.brand =
                "Please select a brand.";

        }


        /*
         * STOP IF VALIDATION FAILS
         */
        if (
            Object.keys(newErrors).length > 0
        ) {

            setErrors(newErrors);

            return;

        }


        setErrors({});
        setIsSubmitting(true);


        try {

            /*
             * Convert image objects to URLs before sending
             * them to your product API.
             */
            const imageUrls =
                images.map((image) =>
                    typeof image === "string"
                        ? image
                        : image.url
                );


            const productData = {

                name:
                    productName.trim(),

                description:
                    description.trim(),

                price:
                    numericPrice,

                category,

                subcategory:
                    subCategory,

                brand,

                stock:
                    numericQuantity,

                images:
                    imageUrls,

                thumbnail_url:
                    imageUrls[0],

                specifications: {

                    discount: {

                        discountType,

                        discount:
                            numericDiscount

                    },

                    hash:
                        productId

                }

            };


            const {
                data,
                status
            } = await api.post(
                "products/add",
                productData
            );


            if (
                status !== 200 ||
                !data?.success
            ) {

                throw new Error(
                    data?.message ||
                    "Failed to create product."
                );

            }


            /*
             * VERY IMPORTANT:
             *
             * Only clear the draft AFTER the product
             * has successfully been saved to the database.
             */
            localStorage.removeItem(
                DRAFT_KEY
            );


            /*
             * Go back to catalog.
             */
            window.location.href =
                "/admin/catalog";


        } catch (error) {

            console.error(
                "Product creation error:",
                error
            );

            /*
             * IMPORTANT:
             *
             * We DO NOT clear localStorage here.
             *
             * If the request fails because of bad internet,
             * the user's work remains saved.
             */
            setErrors((prev) => ({
                ...prev,
                submit:
                    error?.message ||
                    "Failed to create product."
            }));

        } finally {

            setIsSubmitting(false);

        }

    };


    /*
     * =========================================================
     * BRAND OPTIONS
     * =========================================================
     */
    const brandOptions =
        brands.map((brand) => ({
            value: brand,
            label: brand
        }));


    return (

        <form
            className="product-create-form"
            onSubmit={handleSubmit}
        >

            {/* =================================================
                    LEFT COLUMN
                ================================================= */}

            <div className="product-create-left">


                {/* =================================================
                        GENERAL INFORMATION
                    ================================================= */}

                <section className="product-card">

                    <h2>
                        General Information
                    </h2>


                    {/* PRODUCT NAME */}

                    <div className="form-group">

                        <label>
                            Product Name
                        </label>

                        <input
                            type="text"
                            value={productName}
                            onChange={(e) => {

                                setProductName(
                                    e.target.value
                                );

                                if (
                                    errors.productName
                                ) {

                                    setErrors(
                                        (prev) => ({
                                            ...prev,
                                            productName: ""
                                        })
                                    );

                                }

                            }}
                            placeholder="Enter product name"
                            className={
                                errors.productName
                                    ? "input-error"
                                    : ""
                            }
                        />

                        {errors.productName && (

                            <span className="error-message">
                                {errors.productName}
                            </span>

                        )}

                    </div>


                    {/* DESCRIPTION */}

                    <div className="form-group">

                        <label>
                            Description
                        </label>

                        <textarea
                            value={description}
                            onChange={(e) => {

                                setDescription(
                                    e.target.value
                                );

                                if (
                                    errors.description
                                ) {

                                    setErrors(
                                        (prev) => ({
                                            ...prev,
                                            description: ""
                                        })
                                    );

                                }

                            }}
                            placeholder="Describe your product"
                            className={
                                errors.description
                                    ? "input-error"
                                    : ""
                            }
                        />

                        {errors.description && (

                            <span className="error-message">
                                {errors.description}
                            </span>

                        )}

                    </div>

                </section>


                {/* =================================================
                        PRODUCT MEDIA
                    ================================================= */}

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
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                onChange={
                                    handleImageUpload
                                }
                                disabled={
                                    isSubmitting ||
                                    !isDraftLoaded
                                }
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

                            {images.map(
                                (image, index) => (

                                    <div
                                        className="thumbnail"
                                        key={index}
                                    >

                                        <button
                                            type="button"
                                            className="remove-btn"
                                            onClick={() =>
                                                handleDeleteImage(
                                                    index
                                                )
                                            }
                                            disabled={
                                                isSubmitting
                                            }
                                        >

                                            <IoTrashBin
                                                color="#fff"
                                                size={15}
                                            />

                                        </button>


                                        <img
                                            src={
                                                typeof image ===
                                                "string"
                                                    ? image
                                                    : image.url
                                            }
                                            alt={`Product ${
                                                index + 1
                                            }`}
                                        />

                                    </div>

                                )
                            )}

                        </div>

                    </div>


                    {errors.images && (

                        <span className="error-message">
                            {errors.images}
                        </span>

                    )}

                </section>


                {/* =================================================
                        INVENTORY
                    ================================================= */}

                <section className="product-card inventory-card">

                    <h2>
                        Inventory
                    </h2>


                    <div className="inventory-grid">


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

                                    setQuantity(
                                        e.target.value
                                    );

                                    if (
                                        errors.quantity
                                    ) {

                                        setErrors(
                                            (prev) => ({
                                                ...prev,
                                                quantity: ""
                                            })
                                        );

                                    }

                                }}
                                className={
                                    errors.quantity
                                        ? "input-error"
                                        : ""
                                }
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


            {/* =================================================
                    RIGHT COLUMN
                ================================================= */}

            <div className="product-create-right">


                {/* =================================================
                        PRICING
                    ================================================= */}

                <section className="product-card">

                    <h2>
                        Pricing
                    </h2>


                    {/* BASE PRICE */}

                    <div className="form-group">

                        <label>
                            Base Pricing
                        </label>

                        <div
                            className={
                                `input-prefix ${
                                    errors.price
                                        ? "input-error-wrapper"
                                        : ""
                                }`
                            }
                        >

                            <span>
                                ₦
                            </span>

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={price}
                                onChange={(e) => {

                                    setPrice(
                                        e.target.value
                                    );

                                    if (
                                        errors.price
                                    ) {

                                        setErrors(
                                            (prev) => ({
                                                ...prev,
                                                price: ""
                                            })
                                        );

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


                    {/* DISCOUNT */}

                    <div className="pricing-row">

                        <div className="form-group">

                            <label>
                                Discount
                            </label>

                            <input
                                type="number"
                                min="0"
                                value={discount}
                                onChange={(e) => {

                                    setDiscount(
                                        e.target.value
                                    );

                                    if (
                                        errors.discount
                                    ) {

                                        setErrors(
                                            (prev) => ({
                                                ...prev,
                                                discount: ""
                                            })
                                        );

                                    }

                                }}
                                className={
                                    errors.discount
                                        ? "input-error"
                                        : ""
                                }
                            />

                            {errors.discount && (

                                <span className="error-message">
                                    {errors.discount}
                                </span>

                            )}

                        </div>


                        {/* DISCOUNT TYPE */}

                        <div className="form-group">

                            <label>
                                &nbsp;
                            </label>

                            <select
                                value={discountType}
                                onChange={(e) => {

                                    setDiscountType(
                                        e.target.value
                                    );

                                    if (
                                        errors.discountType
                                    ) {

                                        setErrors(
                                            (prev) => ({
                                                ...prev,
                                                discountType: ""
                                            })
                                        );

                                    }

                                }}
                                className={
                                    errors.discountType
                                        ? "input-error"
                                        : ""
                                }
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

                            {errors.discountType && (

                                <span className="error-message">
                                    {errors.discountType}
                                </span>

                            )}

                        </div>

                    </div>

                </section>


                {/* =================================================
                        CATEGORY
                    ================================================= */}

                <section className="product-card category-card">

                    <h2>
                        Category
                    </h2>


                    {/* CATEGORY */}

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

                                setCategory(
                                    selected?.value || ""
                                );

                                /*
                                 * Changing category should
                                 * reset subcategory.
                                 */
                                setSubCategory("");

                                if (
                                    errors.category
                                ) {

                                    setErrors(
                                        (prev) => ({
                                            ...prev,
                                            category: ""
                                        })
                                    );

                                }

                            }}
                            placeholder="Select a category..."
                            className={
                                errors.category
                                    ? "select-error"
                                    : ""
                            }
                        />

                        {errors.category && (

                            <span className="error-message">
                                {errors.category}
                            </span>

                        )}

                    </div>


                    {/* SUBCATEGORY */}

                    <div className="form-group">

                        <label>
                            Product Sub-Category
                        </label>

                        <Select
                            options={
                                subCategoryOptions
                            }
                            isSearchable
                            value={
                                subCategory
                                    ? {
                                        value:
                                            subCategory,
                                        label:
                                            subCategory
                                    }
                                    : null
                            }
                            onChange={(selected) => {

                                setSubCategory(
                                    selected?.value || ""
                                );

                                if (
                                    errors.subCategory
                                ) {

                                    setErrors(
                                        (prev) => ({
                                            ...prev,
                                            subCategory: ""
                                        })
                                    );

                                }

                            }}
                            placeholder="Select a sub-category..."
                            className={
                                errors.subCategory
                                    ? "select-error"
                                    : ""
                            }
                        />

                        {errors.subCategory && (

                            <span className="error-message">
                                {errors.subCategory}
                            </span>

                        )}

                    </div>


                    {/* BRAND */}

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

                                setBrand(
                                    selected?.value || ""
                                );

                                if (
                                    errors.brand
                                ) {

                                    setErrors(
                                        (prev) => ({
                                            ...prev,
                                            brand: ""
                                        })
                                    );

                                }

                            }}
                            placeholder="Select a brand..."
                            className={
                                errors.brand
                                    ? "select-error"
                                    : ""
                            }
                        />

                        {errors.brand && (

                            <span className="error-message">
                                {errors.brand}
                            </span>

                        )}

                    </div>

                </section>


                {/* =================================================
                        SUBMIT ERROR
                    ================================================= */}

                {errors.submit && (

                    <div className="error-message">
                        {errors.submit}
                    </div>

                )}


                {/* =================================================
                        SAVE BUTTON
                    ================================================= */}

                <div className="product-save-container">

                    <button
                        type="submit"
                        className="save-product-btn"
                        disabled={
                            isSubmitting ||
                            !isDraftLoaded
                        }
                    >

                        {isSubmitting
                            ? "Saving..."
                            : "Save Product"
                        }

                    </button>

                </div>

            </div>

        </form>

    );
}


/*
 * =========================================================
 * FORMAT CATEGORY FOR REACT SELECT
 * =========================================================
 */
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


/*
 * =========================================================
 * FORMAT SUBCATEGORY FOR REACT SELECT
 * =========================================================
 */
function formatSubCategory(
    selectedCategory
) {

    if (!selectedCategory) {
        return [];
    }

    let subCategoryList = [];

    let res = categories.find((c) => {

        return (
            c.category.toLowerCase() ===
            selectedCategory.toLowerCase()
        );

    });


    if (res) {

        res.subcategories.map((_c) => {

            subCategoryList.push({
                value: _c,
                label: _c
            });

        });

    }

    return subCategoryList;
}


/*
 * =========================================================
 * BRANDS
 * =========================================================
 */
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


/*
 * =========================================================
 * CATEGORIES
 * =========================================================
 */
const categories = [

    {
        category: "Face Care",

        subcategories: [

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
        category: "Body Care",

        subcategories: [

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
        category: "Acne & Blemish Care",

        subcategories: [

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
        category: "Hyperpigmentation Care",

        subcategories: [

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
        category: "Sunscreens",

        subcategories: [

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
        category: "Supplements & Wellness",

        subcategories: [

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
        category: "Hair Removal & Ingrown Hair Care",

        subcategories: [

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
        category: "Professional Skincare",

        subcategories: [

            "Chemical Peels",
            "Professional Cleansers",
            "Extraction/Pre-Treatment Products",
            "Microneedling Products",
            "Dermaplaning Products",
            "Post-Treatment Care"

        ]
    },

    {
        category: "Spa Items",

        subcategories: [

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
        category: "Eye Care",

        subcategories: [

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
        category: "Feminine Care",

        subcategories: [

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
        category: "Hand & Feet Care",

        subcategories: [

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