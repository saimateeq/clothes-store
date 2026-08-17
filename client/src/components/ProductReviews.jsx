import { useState } from "react";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { Star, BadgeCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { selectIsAuthenticated } from "../features/auth/authSlice";
import { useListProductReviewsQuery, useCreateReviewMutation } from "../features/reviews/reviewsApi";

function StarRow({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          className="text-accent"
        >
          <Star size={20} fill={n <= value ? "currentColor" : "none"} strokeWidth={1.25} />
        </button>
      ))}
    </div>
  );
}

export default function ProductReviews({ productId }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { data, isLoading } = useListProductReviewsQuery(productId);
  const reviews = data?.data?.reviews ?? [];

  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [createReview, { isLoading: isSubmitting, isSuccess }] = useCreateReviewMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (values) => {
    if (!rating) return;
    const res = await createReview({ product: productId, rating, ...values }).unwrap().catch(() => null);
    if (res) {
      reset();
      setRating(0);
      setShowForm(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {isSuccess && (
        <p className="border border-line p-4 text-sm text-muted">
          Thank you — your review has been submitted and will appear once approved.
        </p>
      )}

      {isAuthenticated ? (
        <div>
          {!showForm ? (
            <button type="button" onClick={() => setShowForm(true)} className="label border border-ink px-6 py-3 transition-colors hover:bg-ink hover:text-bg">
              Write a Review
            </button>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 border border-line p-6">
              <div>
                <span className="label mb-2 block text-muted">Your Rating</span>
                <StarRow value={rating} onChange={setRating} />
              </div>
              <input
                {...register("title")}
                placeholder="Review title (optional)"
                className="border border-line bg-transparent px-4 py-3 text-sm outline-none focus:border-ink"
              />
              <textarea
                {...register("comment", { required: "Please share your thoughts", minLength: 3 })}
                placeholder="Share your thoughts on this piece…"
                rows={4}
                className="border border-line bg-transparent px-4 py-3 text-sm outline-none focus:border-ink"
              />
              {errors.comment && <span className="text-xs text-accent">{errors.comment.message}</span>}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting || !rating}
                  className="label bg-ink px-6 py-3 text-bg transition-opacity hover:opacity-85 disabled:opacity-40"
                >
                  Submit Review
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="label text-muted hover:text-ink">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted">
          <Link to="/login" className="link-underline text-ink">
            Log in
          </Link>{" "}
          to write a review.
        </p>
      )}

      {isLoading ? (
        <p className="text-sm text-muted">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-muted">No reviews yet — be the first to share your thoughts.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-line">
          {reviews.map((review) => (
            <li key={review._id} className="flex flex-col gap-2 py-5">
              <div className="flex items-center gap-3">
                <div className="flex text-accent" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={1.25} />
                  ))}
                </div>
                {review.isVerifiedPurchase && (
                  <span className="flex items-center gap-1 text-xs text-muted">
                    <BadgeCheck size={13} /> Verified Purchase
                  </span>
                )}
              </div>
              {review.title && <h4 className="font-heading text-lg">{review.title}</h4>}
              <p className="text-sm leading-relaxed text-muted">{review.comment}</p>
              <span className="text-xs text-muted">
                {review.user?.name ?? "Anonymous"} — {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
