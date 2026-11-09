"use client";

import { useEffect, useRef, useState } from "react";
import {
    IoArrowBack,
    IoCheckmarkCircle,
    IoBulbOutline,
    IoCloudUploadOutline,
    IoTimeOutline,
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

const DRAFT_KEY = CREATE_DRAFT_KEYS.package;
import "../appointment/styles/xxl.css";
import "../appointment/styles/mobile.css";
import "../appointment/styles/tablet.css";
import "../appointment/styles/ipad.css";
import "./styles/xxl.css";
import "./styles/mobile.css";
import "./styles/tablet.css";
import "./styles/ipad.css";

const MAX_DESCRIPTION_LENGTH = 700;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function CreatePackagePage() {
    const [form, setForm] = useState({
        name: "",
        description: "",
        duration_months: "3",
        price: "",
    });
    const [includes, setIncludes] = useState([""]);
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
                name: draft.form?.name ?? "",
                description: draft.form?.description ?? "",
                duration_months: draft.form?.duration_months ?? "3",
                price: draft.form?.price ?? "",
            });
            setIncludes(
                Array.isArray(draft.includes) && draft.includes.length
                    ? draft.includes
                    : [""]
            );
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
            includes,
            image,
        });
    }, [isDraftLoaded, uploadId, form, includes, image]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validate = () => {
        const nextErrors = {};
        if (!form.name.trim()) {
            nextErrors.name = "Package name is required.";
        }
        if (!form.description.trim()) {
            nextErrors.description = "Package description is required.";
        }
        if (!form.duration_months || Number(form.duration_months) <= 0) {
            nextErrors.duration_months = "Duration must be at least 1 month.";
        }
        if (!form.price || Number(form.price) < 0) {
            nextErrors.price = "Package price is required.";
        }
        const cleanedIncludes = includes.map((entry) => entry.trim()).filter(Boolean);
        if (cleanedIncludes.length === 0) {
            nextErrors.includes = "Add at least one included item.";
        }
        if (!image?.url) {
            nextErrors.image = "Please upload a package image.";
        }
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            setErrors((prev) => ({
                ...prev,
                image: "Only JPEG, PNG, or WebP images are allowed.",
            }));
            e.target.value = "";
            return;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            setErrors((prev) => ({
                ...prev,
                image: "Image must not exceed 5MB.",
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setIsSubmitting(true);
            const { data } = await api.post("packages/add", {
                name: form.name.trim(),
                description: form.description.trim(),
                duration_months: Number(form.duration_months),
                price: Number(form.price),
                includes: includes.map((entry) => entry.trim()).filter(Boolean),
                image_url: image.url,
            });
            if (!data?.success) {
                throw new Error(data?.message || "Failed to create package.");
            }
            skipDraftSaveRef.current = true;
            clearCreateDraft(DRAFT_KEY);
            window.location.href = "/admin/catalog";
        } catch (error) {
            setErrors({
                submit:
                    error?.response?.data?.message ||
                    error?.message ||
                    "Something went wrong. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const formattedPrice = form.price
        ? `₦${new Intl.NumberFormat("en-NG").format(Number(form.price))}`
        : "—";

    return (
        <>
            <AdminMediaBackdrop mode={mediaBusy} />
            <div className="appointment-layout">
                <section className="left-column">
                    <form id="package-form" className="appointment-card" onSubmit={handleSubmit}>
                        <div className="section-heading">
                            <h2>Package Details</h2>
                            <p>A timed plan at a set price, with the services and appointments listed in Includes.</p>
                        </div>

                        <div className="form-group">
                            <label>
                                Name <span>*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="e.g. 3-Month Acne Treatment Plan"
                                className={errors.name ? "input-error" : ""}
                            />
                            {errors.name ? <p className="error-message">{errors.name}</p> : null}
                        </div>

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
                                    placeholder="A structured 3-month program for clients dealing with active acne, clogged pores, breakouts and post-acne marks."
                                    className={errors.description ? "input-error" : ""}
                                />
                                <span className="character-count">
                                    {form.description.length}/{MAX_DESCRIPTION_LENGTH}
                                </span>
                            </div>
                            {errors.description ? <p className="error-message">{errors.description}</p> : null}
                        </div>

                        <div className="two-column">
                            <div className="form-group">
                                <label>
                                    Duration (months) <span>*</span>
                                </label>
                                <div className="select-input-wrapper">
                                    <select
                                        name="duration_months"
                                        value={form.duration_months}
                                        onChange={handleChange}
                                        className={errors.duration_months ? "input-error" : ""}
                                    >
                                        {[1, 2, 3, 6, 12].map((months) => (
                                            <option key={months} value={months}>
                                                {months} month{months === 1 ? "" : "s"}
                                            </option>
                                        ))}
                                    </select>
                                    <IoTimeOutline />
                                </div>
                                {errors.duration_months ? <p className="error-message">{errors.duration_months}</p> : null}
                            </div>

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
                                    placeholder="e.g. 90000"
                                    className={errors.price ? "input-error" : ""}
                                />
                                {errors.price ? <p className="error-message">{errors.price}</p> : null}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>
                                Includes <span>*</span>
                            </label>
                            <div className="include-list">
                                {includes.map((entry, index) => (
                                    <div className="include-row" key={index}>
                                        <input
                                            type="text"
                                            value={entry}
                                            placeholder="e.g. Skin consultation and assessment"
                                            onChange={(event) => {
                                                const next = [...includes];
                                                next[index] = event.target.value;
                                                setIncludes(next);
                                                if (errors.includes) {
                                                    setErrors((prev) => ({ ...prev, includes: "" }));
                                                }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className="include-remove"
                                            aria-label="Remove included item"
                                            onClick={() => {
                                                if (includes.length === 1) {
                                                    setIncludes([""]);
                                                    return;
                                                }
                                                setIncludes(includes.filter((_, itemIndex) => itemIndex !== index));
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                className="add-include-btn"
                                onClick={() => setIncludes((prev) => [...prev, ""])}
                            >
                                + Add included item
                            </button>
                            {errors.includes ? <p className="error-message">{errors.includes}</p> : null}
                        </div>

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
                                <strong>Drag and drop an image here</strong>
                                <span>or click to browse</span>
                            </label>
                            <div className="upload-bottom">
                                <span>Supports: JPG, PNG, WebP (Max 5MB)</span>
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
                                    <img src={image.url} alt={image.name || "Package image"} />
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
                            {errors.image ? <p className="error-message">{errors.image}</p> : null}
                        </div>
                    </form>
                </section>

                <section className="right-column">
                    <section className="tips-card">
                        <h3>
                            <IoBulbOutline />
                            Package preview
                        </h3>
                        <ul>
                            <li>
                                <IoCheckmarkCircle />
                                {form.name.trim() || "Untitled package"}
                            </li>
                            <li>
                                <IoCheckmarkCircle />
                                {form.duration_months} month{Number(form.duration_months) === 1 ? "" : "s"} · {formattedPrice}
                            </li>
                            <li>
                                <IoCheckmarkCircle />
                                {includes.filter((entry) => entry.trim()).length} included items
                            </li>
                        </ul>
                    </section>

                    <div className="appointment-header">
                        <div className="header-actions">
                            {/* <button
                                type="button"
                                className="draft-button"
                                onClick={() => {
                                    window.location.href = "/admin/catalog";
                                }}
                            >
                                <IoArrowBack /> Cancel
                            </button> */}
                            <button
                                type="submit"
                                form="package-form"
                                className="publish-button"
                                disabled={isSubmitting || Boolean(mediaBusy)}
                            >
                                {isSubmitting ? "Publishing..." : "Publish Package"}
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            {errors.submit ? <div className="submit-error">{errors.submit}</div> : null}
        </>
    );
}
