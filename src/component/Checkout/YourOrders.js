import React from 'react'
import { useSelector } from 'react-redux'

const YourOrders = () => {
    const carts = useSelector((state) => state.products.carts)

    // Calculate totals
    const subtotal = carts.reduce((sum, item) => {
        const price = parseFloat(item.price) || 0
        const quantity = item.quantity || 1
        return sum + (price * quantity)
    }, 0)
    const shipping = 0 // Free shipping
    const total = subtotal + shipping

    return (
        <>
            <div className="order_review box-shadow bg-white">
                <div className="check-heading">
                    <h3>Siparişiniz</h3>
                </div>
                <div className="table-responsive order_table">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Ürün</th>
                                <th>Toplam</th>
                            </tr>
                        </thead>
                        <tbody>
                            {carts.length === 0 ? (
                                <tr>
                                    <td colSpan="2" className="text-center">
                                        <p>Sepetiniz boş</p>
                                    </td>
                                </tr>
                            ) : (
                                carts.map((item) => {
                                    const itemPrice = parseFloat(item.price) || 0
                                    const itemQuantity = item.quantity || 1
                                    const itemTotal = itemPrice * itemQuantity
                                    return (
                                        <tr key={item.id}>
                                            <td>
                                                {item.title} 
                                                <span className="product-qty"> x {itemQuantity}</span>
                                            </td>
                                            <td>{itemTotal.toFixed(2)} ₺</td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                        <tfoot>
                            <tr>
                                <th>Ara Toplam</th>
                                <td className="product-subtotal">{subtotal.toFixed(2)} ₺</td>
                            </tr>
                            <tr>
                                <th>Kargo</th>
                                <td>Ücretsiz</td>
                            </tr>
                            <tr>
                                <th>Toplam</th>
                                <td className="product-subtotal"><strong>{total.toFixed(2)} ₺</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </>
    )
}

export default YourOrders
