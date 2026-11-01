import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import useReviews from "../hooks/useReviews";
import { submitReview, validateReview } from "../utils/reviews";
import { getApiError } from "../utils/api";
import { formatOrderDate } from "../utils/orders";
import LoadingSpinner from "./LoadingSpinner";

function ReviewForm({ productId, orders, refresh, onSubmitted }) {
  const [fields, setFields] = useState({ orderId: "", rating: "", comment: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const lock = useRef(false);
  const update = ({ target: { name, value } }) => {
    setFields((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };
  const submit = async (event) => {
    event.preventDefault();
    if (lock.current || submitted) return;
    const validation = validateReview(fields);
    setErrors(validation);
    if (Object.keys(validation).length) {
      document.getElementById(`review-${Object.keys(validation)[0]}`)?.focus();
      return;
    }
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const review = await submitReview(productId, fields);
      setSubmitted(true);
      setMessage(review.isVisible === false ? "Review received. It is currently hidden from the public list." : "Your review was submitted successfully.");
      await onSubmitted(review);
    } catch (failure) { setError(getApiError(failure, failure.message)); }
    finally { lock.current = false; setBusy(false); }
  };
  return <form noValidate onSubmit={submit} className="mt-6 rounded-2xl border border-[#eadfd3] bg-[#faf7f2] p-5">
    <h3 className="font-bold text-[#493324]">Review a delivered purchase</h3>
    <p className="mt-2 text-xs leading-6 text-stone-600">One review per product for each delivered order. Reviews may be hidden by moderation.</p>
    {message && <div role="status" className="mt-4 text-sm text-emerald-800"><p>{message}</p><button type="button" onClick={() => refresh()} className="mt-2 underline">Refresh reviews and eligible orders</button></div>}
    {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
    <fieldset disabled={busy || submitted} className="mt-4 space-y-4">
      <legend className="sr-only">Review details</legend>
      <div><label htmlFor="review-orderId" className="mb-2 block text-sm font-semibold">Delivered order</label><select id="review-orderId" name="orderId" value={fields.orderId} onChange={update} aria-invalid={!!errors.orderId} aria-describedby={errors.orderId ? "review-order-error" : undefined} className="w-full rounded-xl border border-stone-300 bg-white p-3 text-sm"><option value="">Select your order</option>{orders.map((order) => <option key={order._id} value={order._id}>{order.orderId} · {formatOrderDate(order.deliveredAt || order.createdAt)}</option>)}</select>{errors.orderId && <p id="review-order-error" className="mt-2 text-xs text-red-700">{errors.orderId}</p>}</div>
      <div><label htmlFor="review-rating" className="mb-2 block text-sm font-semibold">Rating</label><select id="review-rating" name="rating" value={fields.rating} onChange={update} aria-invalid={!!errors.rating} aria-describedby={errors.rating ? "review-rating-error" : undefined} className="w-full rounded-xl border border-stone-300 bg-white p-3 text-sm"><option value="">Select rating</option>{[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} out of 5</option>)}</select>{errors.rating && <p id="review-rating-error" className="mt-2 text-xs text-red-700">{errors.rating}</p>}</div>
      <div><label htmlFor="review-comment" className="mb-2 block text-sm font-semibold">Your review</label><textarea id="review-comment" name="comment" rows={4} maxLength={1000} value={fields.comment} onChange={update} aria-invalid={!!errors.comment} aria-describedby={`review-comment-help${errors.comment ? " review-comment-error" : ""}`} className="w-full rounded-xl border border-stone-300 bg-white p-3 text-sm" /><p id="review-comment-help" className="mt-1 text-xs text-stone-500">5–1,000 characters · {fields.comment.length}/1,000</p>{errors.comment && <p id="review-comment-error" className="mt-2 text-xs text-red-700">{errors.comment}</p>}</div>
      <button type="submit" className="rounded-full bg-[#8b5e3c] px-6 py-3 text-sm font-bold text-white disabled:opacity-50">{busy ? "Submitting review..." : submitted ? "Review submitted" : "Submit review"}</button>
    </fieldset>
    {error && <button type="button" disabled={busy} onClick={() => refresh()} className="mt-4 text-sm underline">Refresh reviews and eligibility</button>}
  </form>;
}

export default function ProductReviews({ productId, onSummary }) {
  const { reviews = [], product, eligible = [], loading, error, eligibilityError, buyer, refresh, token } = useReviews(productId, onSummary);
  const [notice, setNotice] = useState({ token: "", text: "" });
  const onSubmitted = async (review) => {
    setNotice({ token, text: review.isVisible === false ? "Review received. It is currently hidden from the public list." : "Your review was submitted successfully." });
    await refresh();
  };
  return <section id="reviews" aria-busy={loading} className="mt-16 border-t border-stone-200 pt-10">
    <div className="flex items-center justify-between gap-4"><h2 className="text-2xl font-bold text-[#493324]">Customer reviews</h2><button type="button" disabled={loading} onClick={() => refresh()} className="text-sm text-[#8b5e3c] underline disabled:opacity-50">Refresh reviews</button></div>
    {notice.token === token && notice.text && <p role="status" className="mt-4 text-sm text-emerald-800">{notice.text}</p>}
    {loading ? <LoadingSpinner message="Loading reviews..." /> : <>
      {error ? <p role="alert" className="mt-5 text-sm text-red-700">{error}</p> : <>
        <p className="mt-4 text-sm font-semibold text-[#70472c]">{product?.reviewCount ? `${product.averageRating.toFixed(1)} out of 5 · ${product.reviewCount} reviews` : "No published reviews yet"}</p>
        <div className="mt-5 space-y-4">{reviews.map((review) => <article key={review._id} className="rounded-2xl border border-[#eadfd3] bg-white p-5"><div className="flex flex-wrap justify-between gap-2"><h3 className="text-sm font-bold text-[#493324]">{review.buyer?.name || "Buyer"}</h3><span className="text-sm text-[#8b5e3c]" aria-label={`${review.rating} out of 5 stars`}>{review.rating} / 5</span></div><p className="mt-1 text-xs text-stone-500">{formatOrderDate(review.createdAt)}</p><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-stone-600">{review.comment}</p></article>)}</div>
      </>}
      {!token ? <p className="mt-6 text-sm text-stone-600"><Link to="/login" state={{ from: `/products/${productId}#reviews` }} className="text-[#8b5e3c] underline">Sign in</Link> to review a delivered purchase.</p> : !buyer ? <p className="mt-6 text-sm text-stone-600">Product reviews are available to buyers with a delivered purchase.</p> : eligibilityError ? <p role="alert" className="mt-6 text-sm text-red-700">Unable to verify delivered purchases: {eligibilityError}</p> : !error && eligible.length ? <ReviewForm key={`${token}:${productId}`} productId={productId} orders={eligible} refresh={refresh} onSubmitted={onSubmitted} /> : !error && <p className="mt-6 text-sm text-stone-600">You have no unreviewed delivered orders for this product. <Link to="/orders" className="text-[#8b5e3c] underline">View My Orders</Link>.</p>}
    </>}
  </section>;
}
