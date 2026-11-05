"use client";

import { useMemo } from "react";
import ScheduleVisit from "../../../src/components/customer/ScheduleVisit";
import useConsultationToggler from "../../../src/hooks/consultationToggler";
import "../../booking/styles/xxl.css";
import "../../booking/styles/mobile.css";
import "../../booking/styles/tablet.css";
import "../../booking/styles/ipad.css";

export default function ConsultationSchedulePage() {
  const { activeAppointments, loading, loadError, scheduleAppointments } = useConsultationToggler();
  const items = useMemo(
    () => activeAppointments.map((appointment) => ({
      ...appointment,
      itemName: appointment.consultation_name || "Consultation",
      itemPrice: appointment.amount,
      itemKey: `consultation:${appointment.id}`,
    })),
    [activeAppointments],
  );

  return (
    <ScheduleVisit
      kind="consultation"
      items={items}
      loading={loading}
      loadError={loadError}
      onSchedule={scheduleAppointments}
    />
  );
}
