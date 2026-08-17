import { useState } from "react";
import { Star, Check, X, Trash2 } from "lucide-react";
import { useListReviewsForModerationQuery, useUpdateReviewStatusMutation, useDeleteReviewMutation } from "../../features/reviews/reviewsApi";

const TABS = ["pending", "approved", "rejected"];

export default function Reviews() {
  const [tab, setTab] = useState("pending");
  const { data, isLoading } = useListReviewsForModerationQuery(tab);
  const reviews = data?.data?.reviews ?? [];
  const [updateStatus] = useUpdateReviewStatusMutation();
  const [deleteReview] = useDeleteReviewMutation();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="label text-accent">Moderation</span>
        <h1 className="font-heading text-4xl">Reviews</h1>
      </div>

      <div className="flex gap-6 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`label pb-4 capitalize ${tab === t ? "border-b border-ink text-ink" : "text-muted"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="h-40 animate-pulse bg-line" />
      ) : reviews.length === 0 ? (
        <p className="text-sm text-muted">No {tab} reviews.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-line border-y border-line">
          {reviews.map((review) => (
            <li key={review._id} className="flex flex-col gap-3 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex text-accent" aria-hidden="true">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={1.25} />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{review.product?.name}</span>
                </div>
                <span className="text-xs text-muted">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              {review.title && <h4 className="font-heading text-lg">{review.title}</h4>}
              <p className="text-sm text-muted">{review.comment}</p>
              <p className="text-xs text-muted">
                {review.user?.name} — {review.user?.email}
              </p>
              <div className="flex gap-4">
                {tab !== "approved" && (
                  <button type="button" onClick={() => updateStatus({ id: review._id, status: "approved" })} className="label flex items-center gap-1 text-ink">
                    <Check size={13} /> Approve
                  </button>
                )}
                {tab !== "rejected" && (
                  <button type="button" onClick={() => updateStatus({ id: review._id, status: "rejected" })} className="label flex items-center gap-1 text-muted hover:text-ink">
                    <X size={13} /> Reject
                  </button>
                )}
                <button type="button" onClick={() => deleteReview(review._id)} className="label flex items-center gap-1 text-muted hover:text-accent">
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
