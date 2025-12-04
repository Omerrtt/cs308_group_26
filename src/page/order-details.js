import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Header from '../component/Common/Header'
import Banner from '../component/Common/Banner'
import Footer from '../component/Common/Footer'

const OrderDetails = () => {
    const { id } = useParams()
    const orders = useSelector((state) => state.orders.orders)
    const order = orders.find(o => o.id === parseInt(id))

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('tr-TR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (!order) {
        return (
            <>
                <Header />
                <Banner title="Sipariş Bulunamadı" />
                <section className="ptb-100">
                    <div className="container">
                        <div className="alert alert-warning text-center">
                            <h4>Sipariş Bulunamadı</h4>
                            <p>Bu sipariş numarası bulunamadı.</p>
                            <Link to="/my-account/customer-order" className="btn btn-primary mt-3">
                                Siparişlerime Dön
                            </Link>
                        </div>
                    </div>
                </section>
                <Footer />
            </>
        )
    }

    return (
        <>
            <Header />
            <Banner title={`Sipariş Detayları #${order.id}`} />
            <section className="ptb-100">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <Link to="/my-account/customer-order" className="btn btn-secondary mb-4">
                                ← Siparişlerime Dön
                            </Link>
                            
                            <div className="card mb-4">
                                <div className="card-header">
                                    <h4>Sipariş Bilgileri</h4>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <p><strong>Sipariş No:</strong> #{order.id}</p>
                                            <p><strong>Tarih:</strong> {formatDate(order.date)}</p>
                                            <p><strong>Durum:</strong> 
                                                <span className={`badge ${
                                                    order.status === 'Completed' ? 'badge-success' :
                                                    order.status === 'Processing' ? 'badge-warning' :
                                                    order.status === 'Shipped' ? 'badge-info' :
                                                    'badge-secondary'
                                                } ml-2`}>
                                                    {order.status}
                                                </span>
                                            </p>
                                        </div>
                                        <div className="col-md-6">
                                            <p><strong>Toplam Tutar:</strong> ${order.total.toFixed(2)}</p>
                                            <p><strong>Ürün Sayısı:</strong> {order.itemCount} ürün</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card">
                                <div className="card-header">
                                    <h4>Sipariş Ürünleri</h4>
                                </div>
                                <div className="card-body">
                                    <div className="table-responsive">
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th>Ürün</th>
                                                    <th>Fiyat</th>
                                                    <th>Adet</th>
                                                    <th>Toplam</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {order.items.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <img 
                                                                    src={item.img} 
                                                                    alt={item.title}
                                                                    style={{width: '50px', height: '50px', objectFit: 'cover', marginRight: '10px'}}
                                                                />
                                                                <span>{item.title}</span>
                                                            </div>
                                                        </td>
                                                        <td>${item.price.toFixed(2)}</td>
                                                        <td>{item.quantity}</td>
                                                        <td>${(item.price * item.quantity).toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <td colspan="3" className="text-right"><strong>Toplam:</strong></td>
                                                    <td><strong>${order.total.toFixed(2)}</strong></td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </>
    )
}

export default OrderDetails