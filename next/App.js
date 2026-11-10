"use client";

import { Provider } from "react-redux";
import store from "./redux/store";
import { usePathname } from "next/navigation";

import Customer from "@/layout/Customer";
import Admin from "@/layout/Admin";
import ProcessBackdrop from "@/src/components/ProcessBackdrop";

export default function App({ children }) {
    const pathname = usePathname();

    const splittedPath = pathname.split("/");
    const currentRoute = splittedPath[1];

    if (currentRoute === "admin") {
        return (
            <Provider store={store}>
                <Admin>
                    {children}
                </Admin>
                <ProcessBackdrop />
            </Provider>
        );
    }

    return (
        <Provider store={store}>
            <Customer>
                {children}
            </Customer>
            <ProcessBackdrop />
        </Provider>
    );
}