import React, { useState } from 'react';
import { db } from '../../firebaseConfig';
import firebase from 'firebase/app';
import allProductsData from '../../app/data/allProducts.json';
import Swal from 'sweetalert2';

const UploadProducts = () => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploadedCount, setUploadedCount] = useState(0);
    const [updatingUsers, setUpdatingUsers] = useState(false);

    const handleUpload = async () => {
        const result = await Swal.fire({
            title: 'Ürünleri Firebase\'e Yükle',
            text: `${allProductsData.length} ürün yüklenecek. Devam etmek istiyor musunuz?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Evet, Yükle',
            cancelButtonText: 'İptal',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33'
        });

        if (!result.isConfirmed) return;

        setUploading(true);
        setProgress(0);
        setUploadedCount(0);

        try {
            const totalProducts = allProductsData.length;
            const batchSize = 500;
            let uploaded = 0;

            // Önce mevcut ürünleri sil (opsiyonel)
            const deleteConfirm = await Swal.fire({
                title: 'Mevcut Ürünleri Sil?',
                text: 'Firestore\'daki mevcut ürünler silinecek. Devam etmek istiyor musunuz?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Evet, Sil ve Yükle',
                cancelButtonText: 'Hayır, Sadece Yükle',
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33'
            });

            if (deleteConfirm.isConfirmed) {
                const existingProducts = await db.collection('products').get();
                const deleteBatch = db.batch();
                existingProducts.docs.forEach(doc => {
                    deleteBatch.delete(doc.ref);
                });
                await deleteBatch.commit();
                Swal.fire('Silindi', 'Mevcut ürünler silindi.', 'success');
            }

            // Ürünleri batch'ler halinde yükle
            for (let i = 0; i < totalProducts; i += batchSize) {
                const batch = db.batch();
                const batchProducts = allProductsData.slice(i, i + batchSize);
                
                batchProducts.forEach((product) => {
                    const productRef = db.collection('products').doc(product.id?.toString() || `product_${i}`);
                    batch.set(productRef, {
                        ...product,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                });
                
                await batch.commit();
                uploaded += batchProducts.length;
                setUploadedCount(uploaded);
                setProgress((uploaded / totalProducts) * 100);
            }

            await Swal.fire({
                title: 'Başarılı!',
                text: `${uploaded} ürün başarıyla Firebase'e yüklendi.`,
                icon: 'success',
                confirmButtonText: 'Tamam'
            });

        } catch (error) {
            console.error('Yükleme hatası:', error);
            await Swal.fire({
                title: 'Hata!',
                text: `Yükleme sırasında bir hata oluştu: ${error.message}`,
                icon: 'error',
                confirmButtonText: 'Tamam'
            });
        } finally {
            setUploading(false);
        }
    };

    const handleUpdateUsers = async () => {
        const result = await Swal.fire({
            title: 'Kullanıcıları Güncelle',
            text: 'Tüm kullanıcılara Orders, cart, addresses, invoices field\'ları eklenecek. Devam etmek istiyor musunuz?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Evet, Güncelle',
            cancelButtonText: 'İptal',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33'
        });

        if (!result.isConfirmed) return;

        setUpdatingUsers(true);

        try {
            // Tüm kullanıcıları al
            const usersSnapshot = await db.collection('users').get();
            
            if (usersSnapshot.empty) {
                await Swal.fire({
                    title: 'Bilgi',
                    text: 'Hiç kullanıcı bulunamadı.',
                    icon: 'info'
                });
                return;
            }

            let updatedCount = 0;
            let skippedCount = 0;
            const batchSize = 500;

            // Batch'ler halinde güncelle
            for (let i = 0; i < usersSnapshot.docs.length; i += batchSize) {
                const batch = db.batch();
                const batchDocs = usersSnapshot.docs.slice(i, i + batchSize);
                let batchHasUpdates = false;

                batchDocs.forEach((doc) => {
                    const userData = doc.data();
                    const updates = {};
                    let needsUpdate = false;

                    if (!userData.hasOwnProperty('orders')) {
                        updates.orders = [];
                        needsUpdate = true;
                    }

                    if (!userData.hasOwnProperty('cart')) {
                        updates.cart = [];
                        needsUpdate = true;
                    }

                    if (!userData.hasOwnProperty('addresses')) {
                        updates.addresses = [];
                        needsUpdate = true;
                    }

                    if (!userData.hasOwnProperty('invoices')) {
                        updates.invoices = [];
                        needsUpdate = true;
                    }

                    if (needsUpdate) {
                        const userRef = db.collection('users').doc(doc.id);
                        batch.update(userRef, updates);
                        updatedCount++;
                        batchHasUpdates = true;
                    } else {
                        skippedCount++;
                    }
                });

                // Batch'te güncelleme varsa commit et
                if (batchHasUpdates) {
                    await batch.commit();
                }
            }

            await Swal.fire({
                title: 'Başarılı!',
                html: `
                    <p>Güncelleme tamamlandı!</p>
                    <p><strong>Güncellenen:</strong> ${updatedCount} kullanıcı</p>
                    <p><strong>Atlanan:</strong> ${skippedCount} kullanıcı (zaten güncel)</p>
                `,
                icon: 'success',
                confirmButtonText: 'Tamam'
            });

        } catch (error) {
            console.error('Güncelleme hatası:', error);
            await Swal.fire({
                title: 'Hata!',
                text: `Güncelleme sırasında bir hata oluştu: ${error.message}`,
                icon: 'error',
                confirmButtonText: 'Tamam'
            });
        } finally {
            setUpdatingUsers(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-header">
                            <h3>Firebase Ürün Yükleme</h3>
                        </div>
                        <div className="card-body">
                            <p>Toplam ürün sayısı: <strong>{allProductsData.length}</strong></p>
                            
                            {uploading && (
                                <div className="mb-3">
                                    <div className="progress" style={{ height: '30px' }}>
                                        <div 
                                            className="progress-bar progress-bar-striped progress-bar-animated" 
                                            role="progressbar" 
                                            style={{ width: `${progress}%` }}
                                        >
                                            {uploadedCount} / {allProductsData.length} ({progress.toFixed(1)}%)
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button 
                                className="btn btn-primary btn-lg w-100 mb-3"
                                onClick={handleUpload}
                                disabled={uploading || updatingUsers}
                            >
                                {uploading ? 'Yükleniyor...' : 'Ürünleri Firebase\'e Yükle'}
                            </button>

                            <button 
                                className="btn btn-success btn-lg w-100"
                                onClick={handleUpdateUsers}
                                disabled={uploading || updatingUsers}
                            >
                                {updatingUsers ? 'Güncelleniyor...' : 'Kullanıcıları Güncelle (Orders, Cart, Addresses, Invoices)'}
                            </button>

                            <div className="alert alert-warning mt-3">
                                <strong>⚠️ Önemli:</strong> Kullanıcıları güncellemek için önce Firestore güvenlik kurallarını güncellemeniz gerekiyor.
                                <br />
                                <strong>Firebase Console'dan:</strong>
                                <ol className="mb-0 mt-2">
                                    <li>Firebase Console → Firestore Database → Rules</li>
                                    <li>Aşağıdaki kuralı ekleyin:</li>
                                </ol>
                                <pre className="bg-dark text-light p-2 mt-2 mb-0" style={{fontSize: '12px', borderRadius: '4px'}}>
{`match /users/{userId} {
  allow update: if request.auth != null;
}`}
                                </pre>
                                <small className="text-danger">
                                    <strong>Güvenlik Uyarısı:</strong> Bu kural tüm authenticated kullanıcıların tüm kullanıcı dokümanlarını güncellemesine izin verir. 
                                    İşlem tamamlandıktan sonra bu kuralı kaldırmanız önerilir.
                                </small>
                            </div>

                            <div className="mt-3">
                                <small className="text-muted">
                                    <strong>Not:</strong> Bu işlemler biraz zaman alabilir. 
                                    Lütfen sayfayı kapatmayın.
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadProducts;

