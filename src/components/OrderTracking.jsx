import { ORDER_STAGES, statusLabel, trackingStages } from "../utils/orders";

export default function OrderTracking({ status }) {
  if (!ORDER_STAGES.includes(status)) return <p role="status" className="mt-5 rounded-xl bg-stone-100 p-4 text-sm font-semibold text-stone-700">{statusLabel(status)}{status === "cancelled" ? " — delivery will not continue." : status === "failed" ? " — this order has not completed delivery." : " — refresh for the latest order information."}</p>;
  return <ol aria-label={`Order tracking: ${statusLabel(status)}`} className="my-6 grid gap-2 sm:grid-cols-5">
    {trackingStages(status).map((step) => <li key={step.stage} aria-current={step.current ? "step" : undefined} className={`rounded-xl border p-3 text-center text-xs ${step.complete ? "border-[#8b5e3c] bg-[#f4eadb] text-[#70472c]" : "border-stone-200 text-stone-500"}`}>
      <span className="block font-semibold">{statusLabel(step.stage)}</span><span className="mt-1 block">{step.current ? "Current stage" : step.complete ? "Completed" : "Upcoming"}</span>
    </li>)}
  </ol>;
}
