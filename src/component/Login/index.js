import React, { useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { useSelector } from "react-redux";
import Swal from 'sweetalert2';
import { auth, db } from '../../firebaseConfig'

const LoginArea = () => {
    const history = useHistory()

    let status = useSelector((state) => state.user.status);
    let storedUser = useSelector((state) => state.user.user);
    const [email, setEmail] = useState('')
    const [pass, setPass] = useState('')
    const [loading, setLoading] = useState(false)
    const [showForgotPassword, setShowForgotPassword] = useState(false)
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
    const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)

    // Forgot Password
    const handleForgotPassword = async () => {
        if (!forgotPasswordEmail) {
            Swal.fire({
                icon: 'warning',
                title: 'Eksik Bilgi',
                text: 'Lütfen email adresinizi girin'
            })
            return
        }

        setForgotPasswordLoading(true)
        try {
            await auth.sendPasswordResetEmail(forgotPasswordEmail, {
                url: `${window.location.origin}/login`,
                handleCodeInApp: false
            })
            
            Swal.fire({
                icon: 'success',
                title: 'Mail Gönderildi!',
                html: `Şifre sıfırlama linki <b>${forgotPasswordEmail}</b> adresine gönderildi.<br/>Lütfen email kutunuzu kontrol edin.`,
                confirmButtonText: 'Tamam'
            })
            
            setShowForgotPassword(false)
            setForgotPasswordEmail('')
        } catch (error) {
            console.error('Forgot password error:', error)
            let errorMessage = 'Bir hata oluştu. Lütfen tekrar deneyin.'
            
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'Bu email adresi ile kayıtlı kullanıcı bulunamadı.'
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Geçersiz email adresi.'
            } else if (error.message) {
                errorMessage = error.message
            }
            
            Swal.fire({
                icon: 'error',
                title: 'Hata',
                text: errorMessage
            })
        } finally {
            setForgotPasswordLoading(false)
        }
    }

    // Login
    const login = async () => {
        if(status){
            Swal.fire({
                icon: 'question',
                title: 'Sayın ' + storedUser.name,
                html:
                    'Zaten giriş yapmışsınız <br />' +
                    '<b>Hesabım</b> sayfasına gidebilir veya <b>Alışveriş</b> yapabilirsiniz',
            }).then((result) => {
                if(result.isConfirmed) {
                  history.push('/my-account')
                }
              });
        }else{
            if(!email || !pass){
                Swal.fire({
                    icon: 'warning',
                    title: 'Eksik Bilgi',
                    text: 'Lütfen email ve şifre girin'
                })
                return
            }

            setLoading(true)
            try{
                const userCredential = await auth.signInWithEmailAndPassword(email, pass)
                const uid = userCredential.user.uid

                // Firebase auth state listener zaten Redux store'u güncelleyecek
                // Bu yüzden burada dispatch yapmaya gerek yok
                setLoading(false)

                // Kullanıcı adını gösterim için al (sadece mesaj için)
                let nameToUse = 'Müşteri'
                try {
                    const docRef = db.collection('users').doc(uid)
                    const docSnap = await docRef.get()
                    if(docSnap.exists){
                        const data = docSnap.data()
                        nameToUse = data.name || userCredential.user.displayName || 'Müşteri'
                    } else {
                        nameToUse = userCredential.user.displayName || 'Müşteri'
                    }
                } catch(e) {
                    console.warn('Firestore read failed:', e)
                    nameToUse = userCredential.user.displayName || 'Müşteri'
                }

                Swal.fire({
                    icon: 'success',
                    title: 'Giriş Başarılı!',
                    text: 'Hoş geldiniz ' + nameToUse,
                    timer: 1500,
                    showConfirmButton: false
                })
                
                setTimeout(() => {
                    history.push("/");
                }, 100)
            } catch(error){
                setLoading(false)
                console.error('Login error:', error)
                let errorMessage = 'Bir hata oluştu. Lütfen tekrar deneyin.'
                
                if(error.code === 'auth/user-not-found'){
                    errorMessage = 'Bu email adresi ile kayıtlı kullanıcı bulunamadı.'
                } else if(error.code === 'auth/wrong-password'){
                    errorMessage = 'Şifre yanlış.'
                } else if(error.code === 'auth/invalid-email'){
                    errorMessage = 'Geçersiz email adresi.'
                } else if(error.message){
                    errorMessage = error.message
                }

                Swal.fire({
                    icon: 'error',
                    title: 'Giriş Başarısız',
                    text: errorMessage
                })
            }
        }
    }

    return (
        <>
            <section id="login_area" className="ptb-100">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6 offset-lg-3 col-md-12 col-sm-12 col-12">
                            <div className="account_form">
                                <h3>Giriş Yap</h3>
                                <form onSubmit={(e)=>{e.preventDefault();login()}}>
                                    <div className="default-form-box">
                                        <label>Email<span className="text-danger">*</span></label>
                                        <input type="email" className="form-control" required value={email} onChange={e => setEmail(e.currentTarget.value)} />
                                    </div>
                                    <div className="default-form-box">
                                        <label>Şifre<span className="text-danger">*</span></label>
                                        <input type="password" className="form-control" required value={pass} onChange={e => setPass(e.currentTarget.value)} minLength="6"/>
                                    </div>
                                    <div className="login_submit">
                                        <button 
                                            className="theme-btn-one btn-black-overlay btn_md" 
                                            type="submit"
                                            disabled={loading}
                                        >
                                            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                                        </button>
                                    </div>
                                    <div className="remember_area">
                                        <div className="form-check">
                                            <input type="checkbox" className="form-check-input" id="materialUnchecked"/>
                                            <label className="form-check-label" htmlFor="materialUnchecked">Beni Hatırla</label>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mt-3">
                                    <Link to="/register" className="active">Hesabınız yok mu? Kayıt Ol</Link>
                                        <a 
                                            href="#!" 
                                            onClick={(e) => {
                                                e.preventDefault()
                                                setShowForgotPassword(true)
                                            }}
                                            style={{ color: '#ff8a00', textDecoration: 'none' }}
                                        >
                                            Şifremi Unuttum
                                        </a>
                                    </div>
                                </form>
                                
                                {/* Forgot Password Modal */}
                                {showForgotPassword && (
                                    <div className="forgot-password-modal" style={{
                                        position: 'fixed',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        backgroundColor: 'rgba(0,0,0,0.5)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        zIndex: 9999
                                    }}>
                                        <div className="modal-content" style={{
                                            backgroundColor: '#fff',
                                            padding: '30px',
                                            borderRadius: '10px',
                                            maxWidth: '500px',
                                            width: '90%',
                                            position: 'relative'
                                        }}>
                                            <button
                                                onClick={() => {
                                                    setShowForgotPassword(false)
                                                    setForgotPasswordEmail('')
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    top: '10px',
                                                    right: '10px',
                                                    background: 'none',
                                                    border: 'none',
                                                    fontSize: '24px',
                                                    cursor: 'pointer',
                                                    color: '#666'
                                                }}
                                            >
                                                ×
                                            </button>
                                            <h3 className="mb-3">Şifremi Unuttum</h3>
                                            <p className="mb-4" style={{ color: '#666' }}>
                                                Şifre sıfırlama linkini göndermek için email adresinizi girin.
                                            </p>
                                            <form onSubmit={(e) => {
                                                e.preventDefault()
                                                handleForgotPassword()
                                            }}>
                                                <div className="default-form-box mb-3">
                                                    <label>Email Adresi<span className="text-danger">*</span></label>
                                                    <input
                                                        type="email"
                                                        className="form-control"
                                                        required
                                                        value={forgotPasswordEmail}
                                                        onChange={e => setForgotPasswordEmail(e.target.value)}
                                                        placeholder="ornek@email.com"
                                                    />
                                                </div>
                                                <div className="d-flex gap-2">
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary"
                                                        onClick={() => {
                                                            setShowForgotPassword(false)
                                                            setForgotPasswordEmail('')
                                                        }}
                                                        style={{ flex: 1 }}
                                                    >
                                                        İptal
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        className="btn btn-primary"
                                                        disabled={forgotPasswordLoading}
                                                        style={{ 
                                                            flex: 1,
                                                            backgroundColor: '#ff8a00',
                                                            border: 'none'
                                                        }}
                                                    >
                                                        {forgotPasswordLoading ? 'Gönderiliyor...' : 'Gönder'}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default LoginArea
