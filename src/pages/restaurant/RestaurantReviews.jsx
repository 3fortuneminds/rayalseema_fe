import { useEffect, useState } from "react";

import Button from "../../components/Button";
import StarRating from "../../components/StarRating";
import { toast } from "../../components/Toast";
import { useMyRestaurant } from "../../context/RestaurantContext";
import { listReviews, respondToReview } from "../../services/reviewApi";

function ReviewRow({ review, onResponded }) {
  const [responding, setResponding] = useState(false);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await respondToReview(review.id, text.trim());
      onResponded(data.data);
      setResponding(false);
    } catch {
      toast.error("Could not submit response");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <li className="review-list-item">
      <div className="review-list-top">
        <strong>{review.user_name || "Customer"}</strong>
        <StarRating value={review.rating} size={14} />
      </div>
      {review.comment && <p>{review.comment}</p>}
      <span className="review-date">{new Date(review.created_at).toLocaleDateString()}</span>

      {review.restaurant_response ? (
        <div className="review-response">
          <strong>Your response</strong>
          <p>{review.restaurant_response}</p>
        </div>
      ) : responding ? (
        <form className="variant-add-row" onSubmit={handleSubmit}>
          <input placeholder="Write a response…" value={text} onChange={(e) => setText(e.target.value)} />
          <Button type="submit" variant="secondary" className="btn-sm" disabled={submitting}>
            {submitting ? "Sending…" : "Reply"}
          </Button>
        </form>
      ) : (
        <button type="button" className="link-inline" onClick={() => setResponding(true)}>
          Respond
        </button>
      )}
    </li>
  );
}

export default function RestaurantReviews() {
  const { restaurant } = useMyRestaurant();
  const [reviews, setReviews] = useState(null);

  useEffect(() => {
    if (!restaurant) return;
    listReviews(restaurant.slug)
      .then(({ data }) => setReviews(data.data))
      .catch(() => toast.error("Could not load reviews"));
  }, [restaurant]);

  const handleResponded = (updated) => {
    setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  return (
    <div className="restaurant-reviews-page">
      <div className="page-header">
        <div>
          <h1>Reviews</h1>
          <p>See what customers are saying and respond</p>
        </div>
      </div>

      <div className="card">
        {reviews === null ? (
          <div className="page-loading">Loading…</div>
        ) : reviews.length === 0 ? (
          <div className="empty-state">No reviews yet.</div>
        ) : (
          <ul className="review-list">
            {reviews.map((r) => (
              <ReviewRow key={r.id} review={r} onResponded={handleResponded} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
