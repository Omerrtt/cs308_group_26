import React, {useState} from 'react'
import { Link, useHistory } from 'react-router-dom'
import { useSelector } from "react-redux";
import Swal from 'sweetalert2';
import firebase from 'firebase/app'
import { auth, db } from '../../firebaseConfig'

const RegisterArea = () => {
    const history = useHistory()
    const [user, setUserName] = useState('')
    const [email, setEmail] = useState('')
    const [pass, setPass] = useState('')
    const [loading, setLoading] = useState(false)

    let status = useSelector((state) => state.user.status);
    let userData = useSelector((state) => state.user.user);

    // Register
    const register = async () => {
        if(status){
            Swal.fire({
                icon: 'question',
                title: 'Sayın ' + userData.name,
                html:
                    'Zaten kayıtlısınız <br />' +
                    '<b>Hesabım</b> sayfasına gidebilir veya <b>Alışveriş</b> yapabilirsiniz',
            }).then((result) => {
                if(result.isConfirmed) {
                  history.push('/my-account')
                }
              });
        }else{
            if(!email || !pass || !user){
                Swal.fire({
                    icon: 'warning',
                    title: 'Eksik Bilgi',
                    text: 'Lütfen tüm alanları doldurun'
                })
                return
            }

            setLoading(true)
            try{
                // Firebase auth kullanıcı oluştur
                const userCredential = await auth.createUserWithEmailAndPassword(email, pass)
                const uid = userCredential.user.uid

                // Display name güncelle
                try {
                    await userCredential.user.updateProfile({ displayName: user })
                } catch(e) {
                    console.warn('Display name update failed:', e)
                }

                // Firestore'a kullanıcı profili kaydet
                try {
                    await db.collection('users').doc(uid).set({
                        name: user,
                        email: email,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        uid: uid
                    })
                } catch(e) {
                    console.warn('Firestore write failed:', e)
                }

                // Firebase Auth'dan çıkış yap - kullanıcı login sayfasına gidip manuel giriş yapmalı
                try {
                    await auth.signOut()
                } catch(e) {
                    console.warn('Firebase signOut failed:', e)
                }

                setLoading(false)
            
            Swal.fire({
                icon: 'success',
                    title: 'Kayıt Başarılı!',
                    text: 'Hesabınız oluşturuldu. Giriş sayfasına yönlendiriliyorsunuz...',
                    timer: 1500,
                    showConfirmButton: false
                })
                
                setTimeout(() => {
                    history.push("/login");
                }, 100)
                
            } catch(error){
                console.error('Registration error:', error)
                setLoading(false)
                
                let errorMessage = 'Bir hata oluştu. Lütfen tekrar deneyin.'
                if(error.code === 'auth/email-already-in-use'){
                    errorMessage = 'Bu email adresi zaten kullanılıyor.'
                } else if(error.code === 'auth/weak-password'){
                    errorMessage = 'Şifre çok zayıf. En az 6 karakter olmalıdır.'
                } else if(error.code === 'auth/invalid-email'){
                    errorMessage = 'Geçersiz email adresi.'
                } else if(error.message){
                    errorMessage = error.message
                }

                Swal.fire({
                    icon: 'error',
                    title: 'Kayıt Başarısız',
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
                                <h3>Kayıt Ol</h3>
                                <form onSubmit={(e)=>{e.preventDefault();register()}}>
                                    <div className="default-form-box">
                                        <label>Kullanıcı Adı<span className="text-danger">*</span></label>
                                        <input type="text" className="form-control" value={user} onChange={e => setUserName(e.currentTarget.value)} required/>
                                    </div>
                                    <div className="default-form-box">
                                        <label>Email<span className="text-danger">*</span></label>
                                        <input type="email" className="form-control" value={email} onChange={e => setEmail(e.currentTarget.value)} required/>
                                    </div>
                                    <div className="default-form-box">
                                        <label>Şifre<span className="text-danger">*</span></label>
                                        <input type="password" className="form-control" value={pass} onChange={e => setPass(e.currentTarget.value)} required minLength="6"/>
                                    </div>
                                    <div className="login_submit">
                                        <button 
                                            className="theme-btn-one btn-black-overlay btn_md" 
                                            type="submit"
                                            disabled={loading}
                                        >
                                            {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
                                        </button>
                                    </div>
                                    <Link to="/login" className="active">Zaten hesabınız var mı? Giriş Yap</Link>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default RegisterArea
