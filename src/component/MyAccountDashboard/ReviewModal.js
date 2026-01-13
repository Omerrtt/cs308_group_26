import React, { useState } from 'react'
import { auth, db } from '../../firebaseConfig'
import Swal from 'sweetalert2'

/**
 * Review Modal Component
 * Allows users to rate and comment on products from a delivered order
 * @param {Object} order - The order object containing items to review
 * @param {Function} onClose - Callback function when modal is closed
 * @param {Function} onSuccess - Callback function when review is submitted successfully
 */
const ReviewModal = ({ order, onClose, onSuccess }) => {
    // State: { productId: { rating: 0, comment: '' } }
    const [reviews, setReviews] = useState({})
    const [submitting, setSubmitting] = useState(false)

    /**
     * Initialize review state for each product in the order
     * Sets default rating (0) and empty comment for each item
     */
    React.useEffect(() => {
        if (order && order.items) {
            const initialReviews = {}
            order.items.forEach(item => {
                initialReviews[item.id || item.productId] = {
                    rating: 0,
                    comment: ''
                }
            })
            setReviews(initialReviews)
        }
    }, [order])

    /**
     * Handle rating change for a product
     * @param {string} productId - The product ID
     * @param {number} rating - The rating value (1-5)
     */
    const handleRatingChange = (productId, rating) => {
        setReviews(prev => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                rating: rating
            }
        }))
    }

    /**
     * Handle comment change for a product
     * @param {string} productId - The product ID
     * @param {string} comment - The comment text
     */
    const handleCommentChange = (productId, comment) => {
        setReviews(prev => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                comment: comment
            }
        }))
    }

    /**
     * Submit all reviews to Firebase
     * - Updates product ratings and calculates average
     * - Saves comments to pending approval queue
     * - Uses batch operations for better performance
     */
    const handleSubmit = async () => {
        try {
            setSubmitting(true)
            const currentUser = auth.currentUser
            if (!currentUser) {
                Swal.fire({
                    title: 'Hata',
                    text: 'Lütfen giriş yapın.',
                    icon: 'error'
                })
                return
            }

            // Process all reviews using batch operations
            const batch = db.batch()
            const userRef = db.collection('users').doc(currentUser.uid)
            
            // Get user document once (for all comments)
            const userDoc = await userRef.get()
            const userData = userDoc.data() || {}
            let notApprovedComments = [...(userData.notApprovedComments || [])]

            for (const [productId, review] of Object.entries(reviews)) {
                // Process if rating or comment exists (at least one required)
                if (review.rating > 0 || (review.comment && review.comment.trim())) {
                    // Convert product ID to string
                    const productIdStr = productId.toString()
                    
                    // Find Firebase document ID - try different formats
                    let productRef = db.collection('products').doc(productIdStr)
                    let productDoc = await productRef.get()
                    
                    // Try different ID formats if document not found
                    if (!productDoc.exists) {
                        // Add leading zero (e.g., 9142465 -> 09142465)
                        if (!productIdStr.startsWith('0') && productIdStr.length < 9) {
                            const paddedId = '0' + productIdStr
                            productRef = db.collection('products').doc(paddedId)
                            productDoc = await productRef.get()
                        }
                        
                        // Remove leading zeros if still not found (e.g., 09142465 -> 9142465)
                        if (!productDoc.exists && productIdStr.startsWith('0')) {
                            const unpaddedId = productIdStr.replace(/^0+/, '')
                            productRef = db.collection('products').doc(unpaddedId)
                            productDoc = await productRef.get()
                        }
                    }
                    
                    // Show error if product document still not found
                    if (!productDoc.exists) {
                        console.error(`❌ Product document bulunamadı: ${productIdStr}`)
                        Swal.fire({
                            title: 'Hata',
                            text: `Ürün bulunamadı (ID: ${productIdStr}). Lütfen admin ile iletişime geçin.`,
                            icon: 'error'
                        })
                        continue
                    }
                    
                    const productData = productDoc.data() || {}
                    
                    // Update rating if rating > 0
                    if (review.rating > 0) {
                    // Update ratings array
                    const ratings = productData.ratings || []
                    const newRating = {
                        userId: currentUser.uid,
                        orderId: order.orderId,
                        rating: review.rating,
                        createdAt: new Date().toISOString()
                    }
                    
                    // Remove old rating from same user and order
                    const filteredRatings = ratings.filter(r => 
                        !(r.userId === currentUser.uid && r.orderId === order.orderId)
                    )
                    filteredRatings.push(newRating)
                    
                    // Calculate average rating
                    const avgRating = filteredRatings.reduce((sum, r) => sum + r.rating, 0) / filteredRatings.length
                    
                    // Update product with new ratings
                    batch.update(productRef, {
                        ratings: filteredRatings,
                        rating: avgRating,
                        ratingCount: filteredRatings.length,
                        updatedAt: new Date().toISOString()
                    })
                    }

                    // Add comment to pending approval queue (will be saved once at the end)
                    if (review.comment && review.comment.trim()) {
                        const newComment = {
                            id: `comment_${Date.now()}_${productId}_${Math.random().toString(36).substr(2, 9)}`,
                            userId: currentUser.uid,
                            productId: productIdStr,
                            orderId: order.orderId,
                            comment: review.comment.trim(),
                            createdAt: new Date().toISOString(),
                            status: 'pending'
                        }
                        
                        notApprovedComments.push(newComment)
                        console.log(`💬 Comment eklendi (memory): ${newComment.id} - ${productIdStr}`)
                    }
                } else if (review.comment && review.comment.trim()) {
                    // Only comment exists (no rating) - save only comment
                    const productIdStr = productId.toString()
                    
                    const newComment = {
                        id: `comment_${Date.now()}_${productId}_${Math.random().toString(36).substr(2, 9)}`,
                        userId: currentUser.uid,
                        productId: productIdStr,
                        orderId: order.orderId,
                        comment: review.comment.trim(),
                        createdAt: new Date().toISOString(),
                        status: 'pending'
                    }
                    
                    notApprovedComments.push(newComment)
                    console.log(`💬 Sadece comment eklendi (memory): ${newComment.id} - ${productIdStr}`)
                }
            }
            
            // Save all comments at once (if there are new comments)
            if (notApprovedComments.length > (userData.notApprovedComments || []).length) {
                batch.update(userRef, {
                    notApprovedComments: notApprovedComments
                })
                console.log(`✅ ${notApprovedComments.length - (userData.notApprovedComments || []).length} yeni comment kaydedilecek`)
            }

            // Commit all batch operations
            await batch.commit()

            Swal.fire({
                title: 'Başarılı',
                text: 'Değerlendirmeniz kaydedildi. Yorumunuz admin onayından sonra yayınlanacaktır.',
                icon: 'success',
                timer: 3000,
                showConfirmButton: false
            }).then(() => {
                document.body.style.overflow = 'auto'
                if (onSuccess) onSuccess()
                if (onClose) onClose()
            })

        } catch (error) {
            console.error('❌ Review gönderme hatası:', error)
            Swal.fire({
                title: 'Hata',
                text: 'Değerlendirme kaydedilirken bir hata oluştu.',
                icon: 'error'
            }).then(() => {
                document.body.style.overflow = 'auto'
            })
        } finally {
            setSubmitting(false)
        }
    }

    if (!order || !order.items) {
        return null
    }

    return (
        <div 
            style={{ 
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose()
                }
            }}
        >
            <div 
                style={{ 
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    width: '90%',
                    maxWidth: '800px',
                    maxHeight: '90vh',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ padding: '20px', borderBottom: '1px solid #ddd', position: 'relative' }}>
                    <h3 style={{ margin: 0, color: '#333' }}>Ürün Değerlendirme</h3>
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '15px',
                            right: '15px',
                            background: 'none',
                            border: 'none',
                            fontSize: '28px',
                            cursor: 'pointer',
                            color: '#666',
                            lineHeight: '1',
                            padding: '0',
                            width: '30px',
                            height: '30px'
                        }}
                    >
                        ×
                    </button>
                </div>
                <div style={{ maxHeight: 'calc(90vh - 140px)', overflowY: 'auto', padding: '20px' }}>
            <p style={{ marginBottom: '20px', color: '#666' }}>
                Siparişinizdeki ürünleri değerlendirin. Yorumlarınız admin onayından sonra yayınlanacaktır.
            </p>
            
            {order.items.map((item, index) => {
                // Find product ID (priority: originalId > id > productId)
                const productId = item.originalId || item.id || item.productId
                const review = reviews[productId] || { rating: 0, comment: '' }
                
                return (
                    <div 
                        key={productId || index} 
                        style={{ 
                            marginBottom: '30px', 
                            padding: '20px', 
                            border: '1px solid #ddd', 
                            borderRadius: '8px',
                            backgroundColor: '#f9f9f9'
                        }}
                    >
                        <div style={{ marginBottom: '15px' }}>
                            <h4 style={{ marginBottom: '5px', color: '#333' }}>{item.title || item.name}</h4>
                            <p style={{ color: '#666', fontSize: '14px' }}>
                                Miktar: {item.quantity} adet
                            </p>
                        </div>
                        
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                                Puan (1-5 Yıldız) (Opsiyonel)
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ display: 'flex', gap: '5px', cursor: 'pointer' }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <span
                                            key={star}
                                            onClick={() => handleRatingChange(productId, star)}
                                            onMouseEnter={(e) => {
                                                // Hover effect - scale up star
                                                e.currentTarget.style.transform = 'scale(1.2)'
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'scale(1)'
                                            }}
                                            style={{
                                                fontSize: '28px',
                                                color: star <= review.rating ? '#ff8a00' : '#ddd',
                                                transition: 'all 0.2s ease',
                                                cursor: 'pointer',
                                                userSelect: 'none'
                                            }}
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                                <span style={{ color: '#666', fontSize: '14px' }}>
                                    {review.rating > 0 ? `${review.rating}/5` : 'Puan verin'}
                                </span>
                            </div>
                        </div>
                        
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                                Yorum (Opsiyonel)
                            </label>
                            <textarea
                                value={review.comment}
                                onChange={(e) => handleCommentChange(productId, e.target.value)}
                                placeholder="Ürün hakkında yorumunuzu yazın..."
                                rows="4"
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    fontFamily: 'inherit',
                                    resize: 'vertical'
                                }}
                            />
                        </div>
                    </div>
                )
            })}
            
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        style={{
                            padding: '10px 20px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            backgroundColor: '#fff',
                            color: '#333',
                            cursor: submitting ? 'not-allowed' : 'pointer'
                        }}
                    >
                        İptal
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || Object.values(reviews).every(r => r.rating === 0 && !(r.comment && r.comment.trim()))}
                        style={{
                            padding: '10px 20px',
                            border: 'none',
                            borderRadius: '4px',
                            backgroundColor: submitting ? '#ccc' : '#ff8a00',
                            color: '#fff',
                            cursor: submitting || Object.values(reviews).every(r => r.rating === 0 && !(r.comment && r.comment.trim())) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {submitting ? 'Gönderiliyor...' : 'Gönder'}
                    </button>
                </div>
                </div>
            </div>
        </div>
    )
}

export default ReviewModal

