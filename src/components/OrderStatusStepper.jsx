import { Check } from "lucide-react";

import { ORDER_STATUS_STEPS } from "../constants/orderStatus";

export default function OrderStatusStepper({ status }) {
  if (status === "cancelled") {
    return <div className="status-cancelled-banner">This order was cancelled.</div>;
  }

  const currentIndex = ORDER_STATUS_STEPS.findIndex((s) => s.key === status);

  return (
    <ol className="status-stepper">
      {ORDER_STATUS_STEPS.map((step, i) => {
        const done = i < currentIndex;
        const current = i === currentIndex;
        return (
          <li key={step.key} className={done ? "done" : current ? "current" : ""}>
            <span className="status-stepper-dot">{done && <Check size={11} />}</span>
            <span className="status-stepper-label">{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
