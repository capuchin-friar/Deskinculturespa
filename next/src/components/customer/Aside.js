import { useCallback } from "react"
import Link from "next/link";
import Select from "react-select";
import { useEffect, useState } from "react";
import { IoFilterOutline } from "react-icons/io5";
import { useDispatch } from "react-redux";
import uuid from "uuid-v4";
import { set_filters } from "@/redux/customer/filter";

export function Aside() {

    let dispatch = useDispatch();
    const MAX_PRICE = 100000000;

    const [priceRange, setPriceRange] = useState({
        min: 0,
        max: MAX_PRICE
    });
    const [category, setCategory] = useState("");
    const [subCategory, setSubCategory] = useState("");

    const [brand, setBrand] = useState("");
    const [subCategoryOptions, setSubCategoryOptions] = useState([]);



    useEffect(() => {
        let data = formatSubCategory(category);
        setSubCategoryOptions(data);
    }, [category])

    const brandOptions =
        brands.map((brand) => ({
            value: brand,
            label: brand
        }));

    return (
        <>
            <aside className="customer-aside">
                <section className="filter-headline">
                    <span>
                        <IoFilterOutline size={25} fontWeight={"bold"} />
                    </span>
                    <span>
                        <p>Filter</p>
                    </span>
                </section>

                <br />
                <section>
                    <label style={{ fontWeight: "500" }} htmlFor="">Price </label>
                    <div className="price-range-filter">

                        <div className="input-filter-cnt">
                            {/* <label htmlFor="">Min</label> */}
                            <input defaultValue={priceRange.min} type="number" name="min-price" onInput={e => setPriceRange((prev) => ({ ...prev, min: e.target.value }))} placeholder="Min" id="" />
                        </div>
                        <div className="input-filter-cnt">
                            {/* <label htmlFor="">Max</label> */}
                            <input defaultValue={priceRange.max} type="number" name="max-price" onInput={e => setPriceRange((prev) => ({ ...prev, max: e.target.value }))} placeholder="Max" id="" />
                        </div>
                    </div>

                    <div className="filter-input-cnt">
                        <label style={{ fontWeight: "500" }} htmlFor="">Category </label>
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

                                // if (
                                //     errors.category
                                // ) {

                                //     setErrors(
                                //         (prev) => ({
                                //             ...prev,
                                //             category: ""
                                //         })
                                //     );

                                // }

                            }}
                            placeholder="Select a category..."
                        />
                    </div>

                    <div className="filter-input-cnt">
                        <label style={{ fontWeight: "500" }} htmlFor="">Sub-Category </label>
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

                                // if (
                                //     errors.subCategory
                                // ) {

                                //     setErrors(
                                //         (prev) => ({
                                //             ...prev,
                                //             subCategory: ""
                                //         })
                                //     );

                                // }

                            }}
                            placeholder="Select a sub-category..."
                        />
                    </div>

                    <div className="filter-input-cnt">
                        <label style={{ fontWeight: "500" }} htmlFor="">Brand </label>
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

                                // if (
                                //     errors.brand
                                // ) {

                                //     setErrors(
                                //         (prev) => ({
                                //             ...prev,
                                //             brand: ""
                                //         })
                                //     );

                                // }

                            }}
                            placeholder="Select a brand..."
                        />
                    </div>
                </section>

                <button className="apply-filter-btn" onClick={e => {
                    dispatch(
                        set_filters(
                            {
                                price: priceRange,
                                category: category,
                                subCategory: subCategory,
                                brand: brand,
                                id: uuid()
                            }
                        )
                    );
                }}>
                    Apply Filter
                </button>

                <br />

                <button className="apply-filter-btn" style={{
                    marginTop: "15px",
                    background: "#efefef",
                    color: "#278A3D"
                }} onClick={e => {

                    setCategory("");
                    setSubCategory("");
                    setBrand("");
                    setPriceRange({
                        min: 0,
                        max: MAX_PRICE
                    });
                    let minPrice = document.querySelector("input[name='min-price']");
                    let maxPrice = document.querySelector("input[name='max-price']");
                    minPrice.value = 0;
                    maxPrice.value = MAX_PRICE
                    dispatch(
                        set_filters(
                            {
                                price: {
                                    min: 0,
                                    max: MAX_PRICE
                                },
                                category: "",
                                subCategory: "",
                                brand: "",
                                id: uuid()
                            }
                        )
                    );
                }}>
                    Reset
                </button>
            </aside>
        </>
    )
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