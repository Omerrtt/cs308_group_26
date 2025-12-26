import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { auth, db } from '../../firebaseConfig';
import Header from '../../component/Common/Header';
import Footer from '../../component/Common/Footer';
import Swal from 'sweetalert2';
import { generateInvoicePDF } from '../../utils/invoiceGenerator';

// Sales Manager Email
const SALES_MANAGER_EMAIL = 'mbozyel349@gmail.com';

const SalesManagerPanel = () => {
    const history = useHistory();
    const status = useSelector((state) => state.user.status);
    const user = useSelector((state) => state.user.user);
    const [loading, setLoading] = useState(true);
    const [isSalesManager, setIsSalesManager] = useState(false);
    const [activeTab, setActiveTab] = useState('pricing'); // 'pricing', 'invoices', 'financial', 'wishlist'
    
    // Pricing & Discounts
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [discountRate, setDiscountRate] = useState('');
    const [newPrice, setNewPrice] = useState('');
    const [pricingLoading, setPricingLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 30;
    
    // Invoice Management
    const [invoices, setInvoices] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [invoiceLoading, setInvoiceLoading] = useState(false);
    
    // Financial Reporting
    const [financialData, setFinancialData] = useState(null);
    const [reportStartDate, setReportStartDate] = useState('');
    const [reportEndDate, setReportEndDate] = useState('');
    const [reportLoading, setReportLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            if (!currentUser) {
                Swal.fire({
                    title: 'Yetkisiz Erişim',
                    text: 'Bu sayfaya erişmek için giriş yapmanız gerekiyor.',
                    icon: 'error',
                    confirmButtonText: 'Giriş Yap'
                }).then(() => {
                    history.push('/login');
                });
                setLoading(false);
                return;
            }
            
            if (currentUser.email !== SALES_MANAGER_EMAIL) {
                Swal.fire({
                    title: 'Yetkisiz Erişim',
                    text: 'Bu sayfaya sadece sales manager erişebilir.',
                    icon: 'error',
                    confirmButtonText: 'Ana Sayfaya Dön'
                }).then(() => {
                    history.push('/');
                });
                setLoading(false);
                return;
            }

            setIsSalesManager(true);
            await loadProducts();
            setLoading(false);
        });

        return () => unsubscribe();
    }, [history]);

    // Ürünleri yükle
    const loadProducts = async () => {
        try {
            const productsSnapshot = await db.collection('products').get();
            const productsList = [];
            productsSnapshot.forEach((doc) => {
                productsList.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            setProducts(productsList);
        } catch (error) {
            console.error('Ürünler yüklenirken hata:', error);
        }
    };

    // Pagination hesaplamaları
    const totalPages = Math.ceil(products.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = products.slice(startIndex, endIndex);

    // Pricing & Discounts - Ürün seçimi
    const handleProductSelect = (productId) => {
        setSelectedProducts(prev => {
            if (prev.includes(productId)) {
                return prev.filter(id => id !== productId);
            } else {
                return [...prev, productId];
            }
        });
    };

    // Sayfa değiştirme
    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Pricing & Discounts - İndirim uygula
    const handleApplyDiscount = async () => {
        if (selectedProducts.length === 0) {
            Swal.fire({
                title: 'Hata',
                text: 'Lütfen en az bir ürün seçin.',
                icon: 'warning'
            });
            return;
        }

        if (!discountRate || parseFloat(discountRate) <= 0 || parseFloat(discountRate) >= 100) {
            Swal.fire({
                title: 'Hata',
                text: 'Lütfen geçerli bir indirim oranı girin (0-100 arası).',
                icon: 'warning'
            });
            return;
        }

        setPricingLoading(true);
        try {
            const discount = parseFloat(discountRate) / 100;
            const batch = db.batch();

            for (const productId of selectedProducts) {
                const product = products.find(p => p.id === productId);
                if (product) {
                    const originalPrice = parseFloat(product.price) || 0;
                    const discountedPrice = originalPrice * (1 - discount);
                    
                    const productRef = db.collection('products').doc(productId);
                    batch.update(productRef, {
                        price: discountedPrice.toFixed(2),
                        originalPrice: originalPrice, // Orijinal fiyatı sakla
                        discountRate: parseFloat(discountRate),
                        discountedAt: new Date().toISOString()
                    });
                }
            }

            await batch.commit();

            Swal.fire({
                title: 'Başarılı',
                text: `${selectedProducts.length} ürüne indirim uygulandı.`,
                icon: 'success'
            });

            // TODO: Wishlist notification - placeholder
            // Burada wishlist'te bu ürünleri olan kullanıcılara bildirim gönderilecek
            console.log('Wishlist notification placeholder - seçili ürünler:', selectedProducts);

            setSelectedProducts([]);
            setDiscountRate('');
            await loadProducts();
        } catch (error) {
            console.error('İndirim uygulanırken hata:', error);
            Swal.fire({
                title: 'Hata',
                text: 'İndirim uygulanırken bir hata oluştu.',
                icon: 'error'
            });
        } finally {
            setPricingLoading(false);
        }
    };

    // Pricing & Discounts - Manuel fiyat güncelleme
    const handleUpdatePrice = async (productId, price) => {
        if (!price || parseFloat(price) <= 0) {
            Swal.fire({
                title: 'Hata',
                text: 'Lütfen geçerli bir fiyat girin.',
                icon: 'warning'
            });
            return;
        }

        try {
            const productRef = db.collection('products').doc(productId);
            await productRef.update({
                price: parseFloat(price).toFixed(2),
                updatedAt: new Date().toISOString()
            });

            Swal.fire({
                title: 'Başarılı',
                text: 'Fiyat güncellendi.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });

            await loadProducts();
        } catch (error) {
            console.error('Fiyat güncellenirken hata:', error);
            Swal.fire({
                title: 'Hata',
                text: 'Fiyat güncellenirken bir hata oluştu.',
                icon: 'error'
            });
        }
    };

    // Invoice Management - Faturaları yükle
    const loadInvoices = async () => {
        if (!startDate || !endDate) {
            Swal.fire({
                title: 'Hata',
                text: 'Lütfen başlangıç ve bitiş tarihlerini seçin.',
                icon: 'warning'
            });
            return;
        }

        setInvoiceLoading(true);
        try {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            const allInvoices = [];
            
            // Tüm kullanıcıların invoice'larını çek
            const usersSnapshot = await db.collection('users').get();
            for (const userDoc of usersSnapshot.docs) {
                const userData = userDoc.data();
                const userInvoices = userData.invoices || [];
                
                for (const invoice of userInvoices) {
                    const invoiceDate = new Date(invoice.createdAt || invoice.invoiceDate);
                    if (invoiceDate >= start && invoiceDate <= end) {
                        allInvoices.push({
                            ...invoice,
                            userId: userDoc.id,
                            userName: userData.name || 'Bilinmeyen'
                        });
                    }
                }
            }

            // Tarihe göre sırala (en yeni önce)
            allInvoices.sort((a, b) => {
                const dateA = new Date(a.createdAt || a.invoiceDate);
                const dateB = new Date(b.createdAt || b.invoiceDate);
                return dateB - dateA;
            });

            setInvoices(allInvoices);
        } catch (error) {
            console.error('Faturalar yüklenirken hata:', error);
            Swal.fire({
                title: 'Hata',
                text: 'Faturalar yüklenirken bir hata oluştu.',
                icon: 'error'
            });
        } finally {
            setInvoiceLoading(false);
        }
    };

    // Invoice Management - PDF indir
    const handleDownloadInvoice = (invoice) => {
        try {
            const invoicePDFBlob = generateInvoicePDF(invoice);
            const pdfUrl = URL.createObjectURL(invoicePDFBlob);
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = `Fatura_${invoice.invoiceNumber || invoice.invoiceId || 'N/A'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setTimeout(() => {
                URL.revokeObjectURL(pdfUrl);
            }, 100);
        } catch (error) {
            console.error('Fatura indirilirken hata:', error);
            Swal.fire({
                title: 'Hata',
                text: 'Fatura indirilirken bir hata oluştu.',
                icon: 'error'
            });
        }
    };

    // Invoice Management - Yazdır
    const handlePrintInvoice = (invoice) => {
        try {
            const invoicePDFBlob = generateInvoicePDF(invoice);
            const pdfUrl = URL.createObjectURL(invoicePDFBlob);
            const printWindow = window.open(pdfUrl, '_blank');
            if (printWindow) {
                printWindow.onload = () => {
                    printWindow.print();
                };
            }
        } catch (error) {
            console.error('Fatura yazdırılırken hata:', error);
            Swal.fire({
                title: 'Hata',
                text: 'Fatura yazdırılırken bir hata oluştu.',
                icon: 'error'
            });
        }
    };

    // Financial Reporting - Rapor oluştur
    const generateFinancialReport = async () => {
        if (!reportStartDate || !reportEndDate) {
            Swal.fire({
                title: 'Hata',
                text: 'Lütfen başlangıç ve bitiş tarihlerini seçin.',
                icon: 'warning'
            });
            return;
        }

        setReportLoading(true);
        try {
            const start = new Date(reportStartDate);
            const end = new Date(reportEndDate);
            end.setHours(23, 59, 59, 999);

            let totalRevenue = 0;
            let totalCost = 0;
            const dailyData = {};

            // Tüm siparişleri çek (client-side filtreleme yapacağız)
            const ordersSnapshot = await db.collection('orders').get();

            ordersSnapshot.forEach((doc) => {
                const order = doc.data();
                const orderTimestamp = order.orderDateTimestamp || 0;
                
                // Tarih aralığı kontrolü
                if (orderTimestamp < start.getTime() || orderTimestamp > end.getTime()) {
                    return; // Bu siparişi atla
                }
                
                const revenue = parseFloat(order.total) || 0;
                totalRevenue += revenue;

                // Her ürün için cost hesapla (default: %50 of sale price)
                let orderCost = 0;
                if (order.items && Array.isArray(order.items)) {
                    order.items.forEach(item => {
                        const itemPrice = parseFloat(item.price) || 0;
                        const quantity = item.quantity || 1;
                        // Product cost varsa kullan, yoksa %50 varsay
                        const productCost = item.cost || (itemPrice * 0.5);
                        orderCost += productCost * quantity;
                    });
                }
                totalCost += orderCost;

                // Günlük veri topla
                const orderDate = new Date(order.orderDateTimestamp);
                const dateKey = orderDate.toISOString().split('T')[0];
                if (!dailyData[dateKey]) {
                    dailyData[dateKey] = { revenue: 0, cost: 0 };
                }
                dailyData[dateKey].revenue += revenue;
                dailyData[dateKey].cost += orderCost;
            });

            const profit = totalRevenue - totalCost;
            const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

            setFinancialData({
                totalRevenue,
                totalCost,
                profit,
                profitMargin,
                dailyData: Object.entries(dailyData)
                    .map(([date, data]) => ({
                        date,
                        revenue: data.revenue,
                        cost: data.cost,
                        profit: data.revenue - data.cost
                    }))
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
            });
        } catch (error) {
            console.error('Finansal rapor oluşturulurken hata:', error);
            Swal.fire({
                title: 'Hata',
                text: 'Finansal rapor oluşturulurken bir hata oluştu.',
                icon: 'error'
            });
        } finally {
            setReportLoading(false);
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <section className="ptb-100">
                    <div className="container">
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="sr-only">Yükleniyor...</span>
                            </div>
                            <p className="mt-3">Yükleniyor...</p>
                        </div>
                    </div>
                </section>
                <Footer />
            </>
        );
    }

    if (!isSalesManager) {
        return null;
    }

    return (
        <>
            <Header />
            <section className="ptb-100">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <h1 className="mb-4">Sales Manager Panel</h1>
                            
                            {/* Tabs */}
                            <ul className="nav nav-tabs mb-4">
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === 'pricing' ? 'active' : ''}`}
                                        onClick={() => {
                                            setActiveTab('pricing');
                                            setCurrentPage(1);
                                        }}
                                    >
                                        Fiyatlandırma & İndirimler
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === 'invoices' ? 'active' : ''}`}
                                        onClick={() => {
                                            setActiveTab('invoices');
                                            setCurrentPage(1);
                                        }}
                                    >
                                        Fatura Yönetimi
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === 'financial' ? 'active' : ''}`}
                                        onClick={() => {
                                            setActiveTab('financial');
                                            setCurrentPage(1);
                                        }}
                                    >
                                        Finansal Raporlar
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === 'wishlist' ? 'active' : ''}`}
                                        onClick={() => {
                                            setActiveTab('wishlist');
                                            setCurrentPage(1);
                                        }}
                                    >
                                        Wishlist Bildirimleri
                                    </button>
                                </li>
                            </ul>

                            {/* Pricing & Discounts Tab */}
                            {activeTab === 'pricing' && (
                                <div className="card shadow-sm">
                                    <div className="card-body">
                                        <h3 className="mb-4">Ürün Fiyatlandırma ve İndirimler</h3>
                                        
                                        <div className="row mb-4">
                                            <div className="col-md-6">
                                                <label className="form-label">İndirim Oranı (%)</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={discountRate}
                                                    onChange={(e) => setDiscountRate(e.target.value)}
                                                    placeholder="Örn: 20"
                                                    min="0"
                                                    max="100"
                                                />
                                            </div>
                                            <div className="col-md-6 d-flex align-items-end">
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={handleApplyDiscount}
                                                    disabled={pricingLoading}
                                                >
                                                    {pricingLoading ? 'Uygulanıyor...' : 'İndirim Uygula'}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="table-responsive">
                                            <table className="table table-striped" style={{ marginBottom: '0' }}>
                                                <thead>
                                                    <tr style={{ lineHeight: '1.2' }}>
                                                        <th style={{ padding: '8px' }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={paginatedProducts.length > 0 && paginatedProducts.every(p => selectedProducts.includes(p.id))}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        const pageProductIds = paginatedProducts.map(p => p.id);
                                                                        setSelectedProducts(prev => [...new Set([...prev, ...pageProductIds])]);
                                                                    } else {
                                                                        const pageProductIds = paginatedProducts.map(p => p.id);
                                                                        setSelectedProducts(prev => prev.filter(id => !pageProductIds.includes(id)));
                                                                    }
                                                                }}
                                                            />
                                                        </th>
                                                        <th style={{ padding: '8px' }}>Ürün Adı</th>
                                                        <th style={{ padding: '8px' }}>Mevcut Fiyat</th>
                                                        <th style={{ padding: '8px' }}>Yeni Fiyat</th>
                                                        <th style={{ padding: '8px' }}>İşlemler</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {paginatedProducts.map((product) => (
                                                        <tr key={product.id} style={{ lineHeight: '1.2' }}>
                                                            <td style={{ padding: '6px 8px', verticalAlign: 'middle' }}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedProducts.includes(product.id)}
                                                                    onChange={() => handleProductSelect(product.id)}
                                                                />
                                                            </td>
                                                            <td style={{ padding: '6px 8px', verticalAlign: 'middle' }}>{product.title || product.name}</td>
                                                            <td style={{ padding: '6px 8px', verticalAlign: 'middle' }}>{parseFloat(product.price || 0).toFixed(2)} ₺</td>
                                                            <td style={{ padding: '6px 8px', verticalAlign: 'middle' }}>
                                                                <input
                                                                    type="number"
                                                                    className="form-control form-control-sm"
                                                                    defaultValue={product.price}
                                                                    onBlur={(e) => handleUpdatePrice(product.id, e.target.value)}
                                                                    style={{ width: '120px', padding: '4px 8px', fontSize: '13px' }}
                                                                />
                                                            </td>
                                                            <td style={{ padding: '6px 8px', verticalAlign: 'middle' }}>
                                                                {product.discountRate && (
                                                                    <span className="badge bg-warning" style={{ fontSize: '11px', padding: '3px 6px' }}>
                                                                        %{product.discountRate} İndirim
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination */}
                                        {totalPages > 1 && (
                                            <div className="d-flex justify-content-between align-items-center mt-4">
                                                <div>
                                                    <p className="mb-0 text-muted">
                                                        Toplam {products.length} ürün - Sayfa {currentPage} / {totalPages}
                                                        <br />
                                                        <small>Gösterilen: {startIndex + 1} - {Math.min(endIndex, products.length)}</small>
                                                    </p>
                                                </div>
                                                <nav>
                                                    <ul className="pagination mb-0">
                                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                            <button
                                                                className="page-link"
                                                                onClick={() => handlePageChange(currentPage - 1)}
                                                                disabled={currentPage === 1}
                                                                style={{ padding: '6px 12px' }}
                                                            >
                                                                <i className="fa fa-chevron-left"></i>
                                                            </button>
                                                        </li>
                                                        {[...Array(totalPages)].map((_, index) => {
                                                            const page = index + 1;
                                                            // İlk 3, son 3 ve mevcut sayfa etrafındaki sayfaları göster
                                                            if (
                                                                page === 1 ||
                                                                page === totalPages ||
                                                                (page >= currentPage - 2 && page <= currentPage + 2)
                                                            ) {
                                                                return (
                                                                    <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                                                                        <button
                                                                            className="page-link"
                                                                            onClick={() => handlePageChange(page)}
                                                                            style={{ padding: '6px 12px' }}
                                                                        >
                                                                            {page}
                                                                        </button>
                                                                    </li>
                                                                );
                                                            } else if (
                                                                page === currentPage - 3 ||
                                                                page === currentPage + 3
                                                            ) {
                                                                return (
                                                                    <li key={page} className="page-item disabled">
                                                                        <span className="page-link" style={{ padding: '6px 12px' }}>...</span>
                                                                    </li>
                                                                );
                                                            }
                                                            return null;
                                                        })}
                                                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                            <button
                                                                className="page-link"
                                                                onClick={() => handlePageChange(currentPage + 1)}
                                                                disabled={currentPage === totalPages}
                                                                style={{ padding: '6px 12px' }}
                                                            >
                                                                <i className="fa fa-chevron-right"></i>
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </nav>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Invoice Management Tab */}
                            {activeTab === 'invoices' && (
                                <div className="card shadow-sm">
                                    <div className="card-body">
                                        <h3 className="mb-4">Fatura Yönetimi</h3>
                                        
                                        <div className="row mb-4">
                                            <div className="col-md-4">
                                                <label className="form-label">Başlangıç Tarihi</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label">Bitiş Tarihi</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={endDate}
                                                    onChange={(e) => setEndDate(e.target.value)}
                                                />
                                            </div>
                                            <div className="col-md-4 d-flex align-items-end">
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={loadInvoices}
                                                    disabled={invoiceLoading}
                                                >
                                                    {invoiceLoading ? 'Yükleniyor...' : 'Faturaları Yükle'}
                                                </button>
                                            </div>
                                        </div>

                                        {invoices.length > 0 && (
                                            <div className="table-responsive">
                                                <table className="table table-striped">
                                                    <thead>
                                                        <tr>
                                                            <th>Fatura No</th>
                                                            <th>Sipariş No</th>
                                                            <th>Müşteri</th>
                                                            <th>Tarih</th>
                                                            <th>Tutar</th>
                                                            <th>İşlemler</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {invoices.map((invoice, index) => (
                                                            <tr key={index}>
                                                                <td>{invoice.invoiceNumber || invoice.invoiceId}</td>
                                                                <td>{invoice.orderId}</td>
                                                                <td>{invoice.userName}</td>
                                                                <td>
                                                                    {new Date(invoice.createdAt || invoice.invoiceDate).toLocaleDateString('tr-TR')}
                                                                </td>
                                                                <td>{parseFloat(invoice.total || 0).toFixed(2)} ₺</td>
                                                                <td>
                                                                    <button
                                                                        className="btn btn-sm btn-primary me-2"
                                                                        onClick={() => handleDownloadInvoice(invoice)}
                                                                    >
                                                                        PDF İndir
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-sm btn-secondary"
                                                                        onClick={() => handlePrintInvoice(invoice)}
                                                                    >
                                                                        Yazdır
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Financial Reporting Tab */}
                            {activeTab === 'financial' && (
                                <div className="card shadow-sm">
                                    <div className="card-body">
                                        <h3 className="mb-4">Finansal Raporlar</h3>
                                        
                                        <div className="row mb-4">
                                            <div className="col-md-4">
                                                <label className="form-label">Başlangıç Tarihi</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={reportStartDate}
                                                    onChange={(e) => setReportStartDate(e.target.value)}
                                                />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label">Bitiş Tarihi</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={reportEndDate}
                                                    onChange={(e) => setReportEndDate(e.target.value)}
                                                />
                                            </div>
                                            <div className="col-md-4 d-flex align-items-end">
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={generateFinancialReport}
                                                    disabled={reportLoading}
                                                >
                                                    {reportLoading ? 'Hesaplanıyor...' : 'Rapor Oluştur'}
                                                </button>
                                            </div>
                                        </div>

                                        {financialData && (
                                            <div>
                                                <div className="row mb-4">
                                                    <div className="col-md-3">
                                                        <div className="card bg-success text-white">
                                                            <div className="card-body">
                                                                <h5>Toplam Gelir</h5>
                                                                <h3>{financialData.totalRevenue.toFixed(2)} ₺</h3>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="card bg-danger text-white">
                                                            <div className="card-body">
                                                                <h5>Toplam Maliyet</h5>
                                                                <h3>{financialData.totalCost.toFixed(2)} ₺</h3>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="card bg-primary text-white">
                                                            <div className="card-body">
                                                                <h5>Kar/Zarar</h5>
                                                                <h3 className={financialData.profit >= 0 ? 'text-white' : 'text-warning'}>
                                                                    {financialData.profit.toFixed(2)} ₺
                                                                </h3>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="card bg-info text-white">
                                                            <div className="card-body">
                                                                <h5>Kar Marjı</h5>
                                                                <h3>{financialData.profitMargin.toFixed(2)}%</h3>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Simple Chart - Günlük veriler */}
                                                <div className="card">
                                                    <div className="card-body">
                                                        <h5>Günlük Gelir ve Kar Grafiği</h5>
                                                        <div style={{ height: '300px', position: 'relative' }}>
                                                            <canvas id="financialChart"></canvas>
                                                            <div className="mt-3">
                                                                <table className="table table-sm">
                                                                    <thead>
                                                                        <tr>
                                                                            <th>Tarih</th>
                                                                            <th>Gelir</th>
                                                                            <th>Maliyet</th>
                                                                            <th>Kar</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {financialData.dailyData.map((day, index) => (
                                                                            <tr key={index}>
                                                                                <td>{new Date(day.date).toLocaleDateString('tr-TR')}</td>
                                                                                <td>{day.revenue.toFixed(2)} ₺</td>
                                                                                <td>{day.cost.toFixed(2)} ₺</td>
                                                                                <td className={day.profit >= 0 ? 'text-success' : 'text-danger'}>
                                                                                    {day.profit.toFixed(2)} ₺
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Wishlist Notifications Tab - Placeholder */}
                            {activeTab === 'wishlist' && (
                                <div className="card shadow-sm">
                                    <div className="card-body">
                                        <h3 className="mb-4">Wishlist Bildirimleri</h3>
                                        <div className="alert alert-info">
                                            <h5>Placeholder</h5>
                                            <p>Bu özellik yakında eklenecek. İndirim uygulandığında wishlist'te bu ürünleri olan kullanıcılara bildirim gönderilecek.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </>
    );
};

export default SalesManagerPanel;

