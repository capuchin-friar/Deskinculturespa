"use client";

import { useEffect, useRef, useState } from "react";
import {
    IoArrowBack,
    IoCloudUploadOutline,
    IoLocationOutline,
    IoVideocamOutline,
    IoCallOutline,
    IoTimeOutline,
    IoCheckmarkCircle,
    IoBulbOutline,
} from "react-icons/io5";
import uuidV4 from "uuid-v4";
import { api } from "../../../api/shared/config";
import AdminMediaBackdrop, {
    deleteCloudinaryImage,
    extractCloudinaryPublicId,
} from "@/src/components/admin/AdminMediaBackdrop";
import {
    CREATE_DRAFT_KEYS,
    clearCreateDraft,
    loadCreateDraft,
    saveCreateDraft,
} from "@/src/hooks/useCreateDraft";

const DRAFT_KEY = CREATE_DRAFT_KEYS.appointment;

import "./styles/xxl.css";
import "./styles/mobile.css";
import "./styles/tablet.css";
import "./styles/ipad.css";

const MAX_DESCRIPTION_LENGTH = 500;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const APPOINTMENT_MODES = [
    {
        value: "physical",
        label: "Physical",
        description: "In-person at your spa",
        icon: IoLocationOutline,
    },
    {
        value: "online",
        label: "Online",
        description: "Video call (Google Meet, Zoom, etc.)",
        icon: IoVideocamOutline,
    },
    {
        value: "phone",
        label: "Phone Call",
        description: "Audio call consultation",
        icon: IoCallOutline,
    },
];

export default function CreateAppointmentPage() {
    const [form, setForm] = useState({
        title: "",
        description: "",
        mode: "online",
        duration: "30",
        price: "",
    });

    const [image, setImage] = useState(null);
    const [uploadId, setUploadId] = useState("");
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mediaBusy, setMediaBusy] = useState(null);
    const [isDraftLoaded, setIsDraftLoaded] = useState(false);
    const skipDraftSaveRef = useRef(false);

    useEffect(() => {
        const draft = loadCreateDraft(DRAFT_KEY);
        if (draft) {
            setForm({
                title: draft.form?.title ?? "",
                description: draft.form?.description ?? "",
                mode: draft.form?.mode || "online",
                duration: draft.form?.duration ?? "30",
                price: draft.form?.price ?? "",
            });
            setImage(draft.image?.url ? draft.image : null);
            setUploadId(draft.uploadId || uuidV4());
        } else {
            setUploadId(uuidV4());
        }
        setIsDraftLoaded(true);
    }, []);

    useEffect(() => {
        if (!isDraftLoaded || !uploadId || skipDraftSaveRef.current) return;
        saveCreateDraft(DRAFT_KEY, {
            uploadId,
            form,
            image,
        });
    }, [isDraftLoaded, uploadId, form, image]);

    /* ============================
       HANDLE INPUT
    ============================ */

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Remove error once user starts correcting field
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    /* ============================
       HANDLE MODE
    ============================ */

    const handleModeChange = (mode) => {
        setForm((prev) => ({
            ...prev,
            mode,
        }));

        setErrors((prev) => ({
            ...prev,
            mode: "",
        }));
    };

    /* ============================
       IMAGE UPLOAD
    ============================ */

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            setErrors((prev) => ({
                ...prev,
                image:
                    "Only JPG, PNG, and WebP images are allowed.",
            }));
            e.target.value = "";
            return;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            setErrors((prev) => ({
                ...prev,
                image: "Image size must not exceed 5MB.",
            }));
            e.target.value = "";
            return;
        }

        try {
            setMediaBusy("upload");
            setErrors((prev) => ({ ...prev, image: "" }));

            const previousPublicId =
                image?.publicId || extractCloudinaryPublicId(image?.url);

            const formData = new FormData();
            formData.append("file", file);
            formData.append("product_id", uploadId || uuidV4());

            const { data, status } = await api.post("upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (status !== 200 || !data?.url) {
                throw new Error(data?.error || "Failed to upload image.");
            }

            setImage({
                url: data.url,
                publicId: data.publicId || extractCloudinaryPublicId(data.url),
                name: file.name,
            });

            if (previousPublicId) {
                try {
                    await deleteCloudinaryImage(previousPublicId);
                } catch {
                    /* keep the new image even if the old Cloudinary asset cannot be removed */
                }
            }
        } catch (error) {
            setErrors((prev) => ({
                ...prev,
                image: error?.message || "Image upload failed.",
            }));
        } finally {
            setMediaBusy(null);
            e.target.value = "";
        }
    };

    const handleRemoveImage = async () => {
        if (!image) return;
        const publicId = image.publicId || extractCloudinaryPublicId(image.url);
        try {
            setMediaBusy("delete");
            setErrors((prev) => ({ ...prev, image: "" }));
            if (publicId) {
                await deleteCloudinaryImage(publicId);
            }
            setImage(null);
        } catch (error) {
            setErrors((prev) => ({
                ...prev,
                image: error?.message || "Failed to delete image.",
            }));
        } finally {
            setMediaBusy(null);
        }
    };

    /* ============================
       VALIDATION
    ============================ */

    const validate = () => {
        const newErrors = {};

        // Title
        if (!form.title.trim()) {
            newErrors.title = "Appointment title is required.";
        } else if (form.title.trim().length < 3) {
            newErrors.title =
                "Appointment title must be at least 3 characters.";
        } else if (form.title.trim().length > 100) {
            newErrors.title =
                "Appointment title cannot exceed 100 characters.";
        }

        // Description
        if (!form.description.trim()) {
            newErrors.description =
                "Appointment description is required.";
        } else if (form.description.trim().length < 20) {
            newErrors.description =
                "Description must be at least 20 characters.";
        } else if (
            form.description.length > MAX_DESCRIPTION_LENGTH
        ) {
            newErrors.description =
                `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters.`;
        }

        // Mode
        if (!form.mode) {
            newErrors.mode =
                "Please select an appointment mode.";
        }

        // Duration
        if (!form.duration) {
            newErrors.duration =
                "Appointment duration is required.";
        } else if (Number(form.duration) <= 0) {
            newErrors.duration =
                "Duration must be greater than 0 minutes.";
        } else if (Number(form.duration) > 1440) {
            newErrors.duration =
                "Duration cannot exceed 1,440 minutes.";
        }

        // Price
        if (!form.price) {
            newErrors.price =
                "Appointment price is required.";
        } else if (Number(form.price) < 0) {
            newErrors.price =
                "Price cannot be negative.";
        }

        // Image
        if (!image?.url) {
            newErrors.image =
                "Please upload an appointment image.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    /* ============================
       SUBMIT
    ============================ */

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        try {
            setIsSubmitting(true);

            const { data } = await api.post("appointment_offerings/add", {
                title: form.title.trim(),
                description: form.description.trim(),
                mode: form.mode,
                duration_minutes: Number(form.duration),
                price: Number(form.price),
                thumbnail_url: image.url,
            });

            if (!data?.success) {
                throw new Error(data?.message || data?.data || "Failed to create appointment.");
            }

            skipDraftSaveRef.current = true;
            clearCreateDraft(DRAFT_KEY);
            window.location.href = "/admin/catalog";
        } catch (error) {
            setErrors({
                submit:
                    error?.response?.data?.message ||
                    error?.response?.data?.data ||
                    error?.message ||
                    "Something went wrong. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ============================
       PREVIEW
    ============================ */

    return (
        // <main className="appointment-page">


        // </main>

        <>
            <AdminMediaBackdrop mode={mediaBusy} />

            <div className="appointment-layout">

                <section className="left-column">

                    <form
                        id="appointment-form"
                        className="appointment-card"
                        onSubmit={handleSubmit}
                    >

                        <div className="section-heading">

                            <h2>Appointment Details</h2>

                        </div>


                        {/* TITLE */}

                        <div className="form-group">

                            <label>
                                Title <span>*</span>
                            </label>

                            <input
                                type="text"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="e.g. Skincare Consultation"
                                className={
                                    errors.title
                                        ? "input-error"
                                        : ""
                                }
                            />

                            {errors.title && (
                                <p className="error-message">
                                    {errors.title}
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
                                    placeholder="Describe what this appointment is about, what clients can expect, and any preparation needed."
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


                        {/* MODE */}

                        <div className="form-group">

                            <label>
                                Mode <span>*</span>
                            </label>

                            <div className="mode-grid">

                                {APPOINTMENT_MODES.map(
                                    (appointmentMode) => {

                                        const Icon =
                                            appointmentMode.icon;

                                        const isSelected =
                                            form.mode ===
                                            appointmentMode.value;

                                        return (
                                            <button
                                                type="button"
                                                key={appointmentMode.value}
                                                className={`mode-card ${isSelected
                                                    ? "selected"
                                                    : ""
                                                    }`}
                                                onClick={() =>
                                                    handleModeChange(
                                                        appointmentMode.value
                                                    )
                                                }
                                            >

                                                <Icon />

                                                <strong>
                                                    {appointmentMode.label}
                                                </strong>

                                                <span>
                                                    {appointmentMode.description}
                                                </span>

                                            </button>
                                        );
                                    }
                                )}

                            </div>

                            {errors.mode && (
                                <p className="error-message">
                                    {errors.mode}
                                </p>
                            )}

                        </div>


                        {/* DURATION + PRICE */}

                        <div className="two-column">

                            {/* DURATION */}

                            <div className="form-group">

                                <label>
                                    Duration (Minutes) <span>*</span>
                                </label>

                                <div className="select-input-wrapper">

                                    <select
                                        name="duration"
                                        value={form.duration}
                                        onChange={handleChange}
                                        className={
                                            errors.duration
                                                ? "input-error"
                                                : ""
                                        }
                                    >
                                        <option value="15">
                                            15 minutes
                                        </option>

                                        <option value="20">
                                            20 minutes
                                        </option>

                                        <option value="30">
                                            30 minutes
                                        </option>

                                        <option value="45">
                                            45 minutes
                                        </option>

                                        <option value="60">
                                            60 minutes
                                        </option>

                                        <option value="90">
                                            90 minutes
                                        </option>

                                        <option value="120">
                                            120 minutes
                                        </option>
                                    </select>

                                    <IoTimeOutline />

                                </div>

                                {errors.duration && (
                                    <p className="error-message">
                                        {errors.duration}
                                    </p>
                                )}

                            </div>


                            {/* PRICE */}

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
                                    placeholder="e.g. 10,000"
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

                        </div>


                        {/* IMAGE */}

                        <div className="form-group image-section">

                            <label>
                                Image <span>*</span>
                            </label>

                            <label className="upload-container">

                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    hidden
                                    disabled={Boolean(mediaBusy) || isSubmitting}
                                    onChange={handleImageUpload}
                                />

                                <IoCloudUploadOutline />

                                <strong>
                                    Drag and drop an image here
                                </strong>

                                <span>
                                    or click to browse
                                </span>

                            </label>


                            <div className="upload-bottom">

                                <span>
                                    Supports: JPG, PNG, WebP (Max 5MB)
                                </span>

                                <label className="choose-button">

                                    Choose Image

                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        hidden
                                        disabled={Boolean(mediaBusy) || isSubmitting}
                                        onChange={handleImageUpload}
                                    />

                                </label>

                            </div>

                            {image?.url ? (
                                <div className="package-image-preview">
                                    <img src={image.url} alt={image.name || "Appointment image"} />
                                    <button
                                        type="button"
                                        className="package-image-remove"
                                        onClick={handleRemoveImage}
                                        disabled={Boolean(mediaBusy)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : null}

                            {errors.image && (
                                <p className="error-message">
                                    {errors.image}
                                </p>
                            )}

                        </div>

                    </form>

                </section>




                <section className="right-column">

                    {/* TIPS */}

                    <section className="tips-card">

                        <h3>

                            <IoBulbOutline />

                            Tips for a great appointment

                        </h3>


                        <ul>

                            <li>

                                <IoCheckmarkCircle />

                                Be clear about what the consultation covers

                            </li>

                            <li>

                                <IoCheckmarkCircle />

                                Set a fair and transparent price

                            </li>

                            <li>

                                <IoCheckmarkCircle />

                                Choose the right mode (physical, online, or phone)

                            </li>

                            <li>

                                <IoCheckmarkCircle />

                                Keep the duration realistic

                            </li>

                            <li>

                                <IoCheckmarkCircle />

                                Use a professional and welcoming image

                            </li>

                        </ul>

                    </section>


                    <div className="appointment-header">

                        <div className="header-actions">

                            <button
                                type="submit"
                                form="appointment-form"
                                className="publish-button"
                                disabled={isSubmitting || Boolean(mediaBusy)}
                            >
                                {isSubmitting
                                    ? "Publishing..."
                                    : "Publish Appointment"}
                            </button>

                        </div>

                    </div>

                </section>

            </div>


            {/* SUBMIT ERROR */}

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
