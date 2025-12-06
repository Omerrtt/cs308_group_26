import React, { useState } from "react";

const ProductReviews = () => {
  const [rating, setRating] = useState(0);          // seçili yıldız
  const [hoverRating, setHoverRating] = useState(0); // hover'daki yıldız
  const [comment, setComment] = useState("");        // textarea
  const [reviews, setReviews] = useState([]);        // tüm yorumlar

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!comment.trim() || rating === 0) {
      return; // boş yorum ya da 0 yıldız olmasın
    }

    const newReview = {
      id: Date.now(),
      rating,
      comment: comment.trim(),
      createdAt: new Date().toLocaleString(),
    };

    setReviews([newReview, ...reviews]);
    setComment("");
    setRating(0);
    setHoverRating(0);
  };

  const renderStar = (starValue) => {
    const isActive = (hoverRating || rating) >= starValue;

    return (
      <span
        key={starValue}
        style={{
          cursor: "pointer",
          fontSize: "22px",
          marginRight: "4px",
          color: isActive ? "#fbbf24" : "#d1d5db", // sarı / gri
          transition: "color 0.15s ease-in-out",
        }}
        onClick={() => setRating(starValue)}
        onMouseEnter={() => setHoverRating(starValue)}
        onMouseLeave={() => setHoverRating(0)}
      >
        ★
      </span>
    );
  };

  return (
    <div
      style={{
        borderTop: "1px solid #e5e7eb",
        paddingTop: "24px",
        marginTop: "24px",
      }}
    >
      <h4 style={{ fontWeight: 600, marginBottom: "12px" }}>
        Product comments and rating
      </h4>

      {/* YILDIZ SEÇİMİ + FORM */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <div style={{ marginBottom: "8px" }}>
          { [1, 2, 3, 4, 5].map(renderStar) }
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Yorumunuzu yazın..."
          style={{
            width: "100%",
            minHeight: "80px",
            padding: "8px 10px",
            borderRadius: "6px",
            border: "1px solid #d1d5db",
            resize: "vertical",
            fontSize: "14px",
          }}
        />

        <button
          type="submit"
          style={{
            marginTop: "10px",
            padding: "8px 16px",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "#2563eb",
            color: "white",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Yorumu gönder
        </button>
      </form>

      {/* YORUM LİSTESİ */}
      {reviews.length > 0 && (
        <div>
          <h5 style={{ fontWeight: 600, marginBottom: "8px" }}>Son yorumlar</h5>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {reviews.map((rev) => (
              <li
                key={rev.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  padding: "10px 12px",
                  marginBottom: "8px",
                  backgroundColor: "#f9fafb",
                }}
              >
                <div style={{ marginBottom: "4px" }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: "16px",
                        marginRight: "2px",
                        color: i < rev.rating ? "#fbbf24" : "#d1d5db",
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p style={{ margin: 0, fontSize: "14px" }}>{rev.comment}</p>
                <small style={{ fontSize: "11px", color: "#6b7280" }}>
                  {rev.createdAt}
                </small>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;