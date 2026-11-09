"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";

const ScheduleVisit = dynamic(() => import("../../../src/components/customer/ScheduleVisit"), { ssr: false });
import usePackageToggler from "../../../src/hooks/packageToggler";
import "../../booking/styles/xxl.css";
import "../../booking/styles/mobile.css";
import "../../booking/styles/tablet.css";
import "../../booking/styles/ipad.css";

export default function PackageSchedulePage() {
  const { activeBookings, loading, loadError, schedulePackages } = usePackageToggler();
  const items = useMemo(
    () => activeBookings.map((booking) => ({
      ...booking,
      itemName: booking.name || "Package",
      itemPrice: booking.price,
      itemKey: `package:${booking.id}`,
    })),
    [activeBookings],
  );

  return (
    <ScheduleVisit
      kind="package"
      items={items}
      loading={loading}
      loadError={loadError}
      onSchedule={schedulePackages}
    />
  );
}
