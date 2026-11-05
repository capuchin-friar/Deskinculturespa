"use client";

import { useMemo } from "react";
import ScheduleVisit from "../../src/components/customer/ScheduleVisit";
import useServiceToggler from "../../src/hooks/serviceToggler";
import "./styles/xxl.css";
import "./styles/mobile.css";
import "./styles/tablet.css";
import "./styles/ipad.css";

export default function BookingPage() {
  const { bookings, loading, loadError, scheduleBookings } = useServiceToggler();
  const items = useMemo(
    () => bookings
      .filter((booking) => ["pending", "confirmed"].includes(booking.status))
      .map((booking) => ({
        ...booking,
        itemName: booking.subcategory || booking.category || "Service",
        itemPrice: booking.price,
        itemKey: `service:${booking.id}`,
      })),
    [bookings],
  );

  return (
    <ScheduleVisit
      kind="service"
      items={items}
      loading={loading}
      loadError={loadError}
      onSchedule={scheduleBookings}
    />
  );
}
