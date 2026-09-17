"use client";

import { useEffect, useState } from "react";
import { baseApi } from "../../app/api/config";

export default function useServiceHandler() {

    const [services, setServices] = useState([]);

    useEffect(() => {

        const getServices = async () => {

            try {


                const { data } = await baseApi.get("services");

                if (!data?.success) {
                    throw new Error(
                        data?.message || "Failed to fetch services"
                    );
                }

                setServices(data.data || []);

            } catch (err) {

                console.error("Failed to fetch services:", err);

                setServices([]);

            } finally {

            }
        };

        getServices();

    }, []);

    return {
        services
    };
}