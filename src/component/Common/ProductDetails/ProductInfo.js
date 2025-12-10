import React from 'react'
import { useSelector } from 'react-redux'
import ReviewForm from './ReviewForm'
import user1 from '../../../assets/img/user/user1.png'
import user2 from '../../../assets/img/user/user2.png'
import user3 from '../../../assets/img/user/user3.png'

// Placeholder reviews (limited to 10)
const PlaceholderReviews = [
    {
        img: user1,
        name: "Sara Anela",
        date: "5 days ago",
        rating: 5,
        para: `Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque Praesent sapien massa, convallis a pellentesque nec.`
    },
    {
        img: user2,
        name: "John Doe",
        date: "1 week ago",
        rating: 4,
        para: `Great product! Really satisfied with the quality and performance.`
    },
    {
        img: user3,
        name: "Jane Smith",
        date: "2 weeks ago",
        rating: 5,
        para: `Excellent! Highly recommended to everyone.`
    }
].slice(0, 10) // Limit to max 10

const ProductInfo = ({ productId }) => {
    const userReviews = useSelector((state) => state.reviews.reviews[productId]) || []
    
    // Combine user reviews (at top) + placeholder reviews (limited to 10 total)
    const remainingSlots = Math.max(0, 10 - userReviews.length)
    const placeholdersToShow = PlaceholderReviews.slice(0, remainingSlots)
    const allReviews = [...userReviews, ...placeholdersToShow]
    
    // Calculate average rating
    const calculateAverageRating = () => {
        if (allReviews.length === 0) return 0
        const totalRating = allReviews.reduce((sum, review) => sum + (review.rating || 0), 0)
        return (totalRating / allReviews.length).toFixed(1)
    }
    
    const averageRating = calculateAverageRating()
    
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffTime = Math.abs(now - date)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        if (diffDays === 1) return 'Today'
        if (diffDays === 2) return 'Yesterday'
        if (diffDays < 7) return `${diffDays} days ago`
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
        return date.toLocaleDateString('tr-TR')
    }

    return (
        <>
            <div className="row">
                <div className="col-lg-12">
                    <div className="product_details_tabs">
                        <ul className="nav nav-tabs">
                            <li><a data-toggle="tab" href="#description" className="active">Description</a></li>
                            <li><a data-toggle="tab" href="#additional">Additional Information</a></li>
                            <li><a data-toggle="tab" href="#review">Reviews ({allReviews.length})</a></li>
                        </ul>
                        <div className="tab-content">
                            <div id="description" className="tab-pane fade in show active">
                                <div className="product_description">
                                    <p>Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem. Vestibulum ac
                                        diam sit amet quam vehicula elementum sed sit amet dui.
                                        Sed porttitor lectus nibh. Vivamus magna justo, lacinia eget consectetur sed,
                                        convallis at tellus. Sed porttitor lectus nibh.
                                        Donec sollicitudin molestie malesuada. Vivamus magna justo,
                                        lacinia eget consectetur sed, convallis at tellus. Curabitur arcu erat, accumsan
                                        id imperdiet et, porttitor at sem.</p>
                                    <ul>
                                        <li>Vivamus magna justo, lacinia eget consectetur sed</li>
                                        <li>Curabitur aliquet quam id dui posuere blandit</li>
                                        <li>Mauris blandit aliquet elit, eget tincidunt nibh pulvinar </li>
                                    </ul>
                                    <p>Donec sollicitudin molestie malesuada. Cras ultricies ligula sed magna dictum
                                        porta.
                                        Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a.
                                        Nulla porttitor accumsan tincidunt. Cras ultricies ligula sed magna dictum
                                        porta. Curabitur arcu erat, accumsan id imperdiet et,
                                        Pellentesque in ipsum id orci porta dapibus. Lorem ipsum dolor sit amet,
                                        consectetur adipiscing elit.
                                        porttitor at sem. Quisque velit nisi, pretium ut lacinia in, elementum id enim.
                                    </p>
                                </div>
                            </div>
                            <div id="additional" className="tab-pane fade">
                                <div className="product_additional">
                                    <ul>
                                        <li>Weight: <span>400 g</span></li>
                                        <li>Dimensions: <span>10 x 10 x 15 cm</span></li>
                                        <li>Materials: <span> 60% cotton, 40% polyester</span></li>
                                        <li>Other Info: <span> American heirloom jean shorts pug seitan
                                            letterpress</span></li>
                                    </ul>
                                </div>
                            </div>
                            <div id="review" className="tab-pane fade">
                                {/* Average Rating Display */}
                                <div className="average-rating mb-4 p-3 bg-light">
                                    <h5>Ortalama Puan: {averageRating} / 5.0</h5>
                                    <div>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <i
                                                key={star}
                                                className={`fa fa-star ${
                                                    star <= Math.round(averageRating) 
                                                        ? 'text-warning' 
                                                        : 'text-muted'
                                                }`}
                                                style={{ fontSize: '20px', marginRight: '3px' }}
                                            ></i>
                                        ))}
                                        <span className="ml-2">({allReviews.length} değerlendirme)</span>
                                    </div>
                                </div>

                                {/* Reviews List */}
                                <div className="product_reviews mb-4">
                                    <h5>Kullanıcı Yorumları</h5>
                                    <ul>
                                        {allReviews.map((review, index) => (
                                            <li className="media" key={index}>
                                                <div className="media-img">
                                                    <img src={review.img || user1} alt="user" />
                                                </div>
                                                <div className="media-body">
                                                    <div className="media-header">
                                                        <div className="media-name">
                                                            <h4>
                                                                {review.userName || review.name}
                                                                {review.isUserReview && (
                                                                    <span className="badge badge-success ml-2">Doğrulanmış</span>
                                                                )}
                                                            </h4>
                                                            <p>{review.isUserReview ? formatDate(review.date) : review.date}</p>
                                                        </div>
                                                    </div>
                                                    <div className="media-pragraph">
                                                        <div className="product_review_strat mb-2">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <span key={star}>
                                                                    <i 
                                                                        className={`fa fa-star ${
                                                                            star <= review.rating 
                                                                                ? 'text-warning' 
                                                                                : 'text-muted'
                                                                        }`}
                                                                    ></i>
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <p>{review.comment || review.para}</p>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Review Form */}
                                <ReviewForm productId={productId} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ProductInfo