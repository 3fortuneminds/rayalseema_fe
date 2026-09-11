import { useState } from "react";

import Button from "./Button";
import StarRating from "./StarRating";
import { toast } from "./Toast";
import { createReview } from "../services/reviewApi";

export default function OrderReviewSection({ order, onReviewSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (order.status !== "delivered") return null;

  if (order.review) {
    return (
      <div className="review-section">
        <h3>Your review</h3>
        <StarRating value={order.review.rating} />
        {order.review.comment && <p className="review-comment">{order.review.comment}</p>}
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Pick a star rating");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await createReview({ order_id: order.id, rating, comment });
      onReviewSubmitted(data.data);
      toast.success("Thanks for your review!");
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Could not submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="review-section" onSubmit={handleSubmit}>
      <h3>Rate this order</h3>
      <StarRating value={rating} onChange={setRating} size={24} />
      <textarea
        className="review-textarea"
        placeholder="Tell us about your experience (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
      />
      <Button type="submit" variant="secondary" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit review"}
      </Button>
    </form>
  );
}
