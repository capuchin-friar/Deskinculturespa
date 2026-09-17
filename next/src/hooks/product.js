"use client";

import { useEffect, useState } from "react";
import { baseApi } from "../../app/api/config";

export default function useProductHandler() {

    const [products, setProducts] = useState([]);

    useEffect(() => {

        const getProducts = async () => {

            try {

                const { data } = await baseApi.get("products");

                if (!data?.success) {
                    throw new Error(
                        data?.message || "Failed to fetch products"
                    );
                }

                setProducts(data.data || []);

            } catch (err) {

                console.error("Failed to fetch products:", err);

                setProducts([]);

            } finally {

            }
        };

        getProducts();

    }, []);

    return {
        products
    };
}