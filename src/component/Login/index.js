import React, { useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { useSelector, useDispatch } from "react-redux";
import Swal from 'sweetalert2';
import { auth, db } from '../../firebaseConfig'
import { register } from '../../app/slices/user'

const LoginArea = () => {
    let dispatch = useDispatch();
    const history = useHistory()

    let status = useSelector((state) => state.user.status);
    let storedUser = useSelector((state) => state.user.user);
    const [email, setEmail] = useState('')
    const [pass, setPass] = useState('')
    const [loading, setLoading] = useState(false)

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

                // Firestore'dan kullanıcı bilgilerini al
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

                // Redux store'u güncelle
                dispatch(register({ user: nameToUse, email: email, pass: pass }))
                setLoading(false)

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
                                    <Link to="/register" className="active">Hesabınız yok mu? Kayıt Ol</Link>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default LoginArea
