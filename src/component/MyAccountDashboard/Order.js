import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

const Order = () => {
    const orders = useSelector((state) => state.orders.orders)

    const getStatusBadge = (status) => {
        switch(status) {
            case 'Completed':
                return 'badge badge-success'
            case 'Processing':
                return 'badge badge-warning'
            case 'Shipped':
                return 'badge badge-info'
            case 'Cancelled':
                return 'badge badge-danger'
            default:
                return 'badge badge-secondary'
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('tr-TR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })
    }

    return (
        <>
            <div className="myaccount-content">
                <h4 className="title">Siparişlerim</h4>
                
                {orders.length === 0 ? (
                    <div className="alert alert-info">
                        <p>Henüz siparişiniz bulunmamaktadır.</p>
                        <Link to="/shop" className="btn btn-primary mt-2">Alışverişe Başla</Link>
                    </div>
                ) : (
                    <div className="table_page table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Sipariş No</th>
                                    <th>Tarih</th>
                                    <th>Durum</th>
                                    <th>Toplam</th>
                                    <th>Ürün Sayısı</th>
                                    <th>İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id}>
                                        <td>#{order.id}</td>
                                        <td>{formatDate(order.date)}</td>
                                        <td>
                                            <span className={getStatusBadge(order.status)}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td>${order.total.toFixed(2)}</td>
                                        <td>{order.itemCount} ürün</td>
                                        <td>
                                            <Link 
                                                to={`/order-details/${order.id}`} 
                                                className="view"
                                            >
                                                Detaylar
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    )
}

export default Order