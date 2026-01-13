import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addReview } from '../../../app/slices/reviews'
import Swal from 'sweetalert2'

/**
 * Review Form Component
 * Allows users to submit product reviews with rating and comment
 * @param {string} productId - The product ID to review
 */
const ReviewForm = ({ productId }) => {
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState('')
    const [hoveredRating, setHoveredRating] = useState(0)
    
    const dispatch = useDispatch()
    const user = useSelector((state) => state.user.user)
    const userStatus = useSelector((state) => state.user.status)

    /**
     * Handle form submission
     * Validates user authentication and comment length
     * Dispatches review to Redux store
     */
    const handleSubmit = (e) => {
        e.preventDefault()

        if (!userStatus) {
            Swal.fire('Hata', 'Yorum yapmak için giriş yapmalısınız', 'error')
            return
        }

        if (comment.trim().length < 10) {
            Swal.fire('Hata', 'Yorum en az 10 karakter olmalıdır', 'warning')
            return
        }

        dispatch(addReview({
            productId: productId,
            rating: rating,
            comment: comment.trim(),
            userName: user?.name || 'Anonim Kullanıcı'
        }))

        Swal.fire({
            icon: 'success',
            title: 'Yorumunuz Eklendi!',
            text: 'Teşekkür ederiz',
            timer: 2000,
            showConfirmButton: false
        })

        setRating(5)
        setComment('')
    }

    return (
        <div className="review-form mt-4">
            <h4>Ürünü Değerlendir</h4>
            <form onSubmit={handleSubmit}>
                <div className="form-group mb-3">
                    <label className="mb-2">Puanınız:</label>
                    <div className="star-rating-input">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <i
                                key={star}
                                className={`fa fa-star ${
                                    star <= (hoveredRating || rating) 
                                        ? 'text-warning' 
                                        : 'text-muted'
                                }`}
                                style={{
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    marginRight: '5px'
                                }}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                            ></i>
                        ))}
                        <span className="ml-2">({rating}/5)</span>
                    </div>
                </div>

                <div className="form-group mb-3">
                    <label className="mb-2">Yorumunuz:</label>
                    <textarea
                        className="form-control"
                        rows="4"
                        placeholder="Ürün hakkındaki düşüncelerinizi paylaşın... (En az 10 karakter)"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                        minLength={10}
                    ></textarea>
                    <small className="text-muted">{comment.length} karakter</small>
                </div>

                <button type="submit" className="btn btn-primary">
                    Yorum Gönder
                </button>
            </form>
        </div>
    )
}

export default ReviewForm