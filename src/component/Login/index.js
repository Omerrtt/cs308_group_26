import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from "react-redux";
import Swal from 'sweetalert2';
import { useHistory } from "react-router-dom"
import { auth, db } from '../../firebaseConfig'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
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
                title: 'Mr. '+storedUser.name,
                html:
                    'You are already loged in <br />' +
                    'You can go to <b>' +
                    'Dashboard</b> ' +
                    'or our <b>Shop</b> page',
            }).then((result) => {
                if(result.isConfirmed) {
                  history.push('/my-account')
                } else {
                  // not clicked
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
            const startTime = performance.now()
            try{
                const authStart = performance.now()
                const userCredential = await signInWithEmailAndPassword(auth, email, pass)
                const authEnd = performance.now()
                console.log(`[PERFORMANCE] Firebase Auth signIn: ${(authEnd - authStart).toFixed(2)}ms`)
                
                const uid = userCredential.user.uid

                // try to read profile from Firestore with timeout
                let nameToUse = 'Customer'
                const firestoreStart = performance.now()
                
                // Firestore read'i timeout ile sınırlandır (max 1 saniye)
                const firestorePromise = (async () => {
                    try {
                        const docRef = doc(db, 'users', uid)
                        const docSnap = await getDoc(docRef)
                        if(docSnap.exists()){
                            const data = docSnap.data()
                            return data.name || 'Customer'
                        } else {
                            // fallback: try displayName
                            return userCredential.user.displayName || 'Customer'
                        }
                    } catch(e) {
                        console.warn('Firestore read failed:', e)
                        return userCredential.user.displayName || 'Customer'
                    }
                })()
                
                // Timeout wrapper
                const timeoutPromise = new Promise((resolve) => {
                    setTimeout(() => {
                        console.warn('[PERFORMANCE] Firestore read timeout (1s), using fallback')
                        resolve('Customer')
                    }, 1000) // 1 saniye timeout
                })
                
                try {
                    // Race: Firestore read veya timeout, hangisi önce biterse onu kullan
                    nameToUse = await Promise.race([firestorePromise, timeoutPromise])
                    const firestoreEnd = performance.now()
                    console.log(`[PERFORMANCE] Firestore read: ${(firestoreEnd - firestoreStart).toFixed(2)}ms`)
                } catch(e) {
                    console.warn('Firestore read error:', e)
                    nameToUse = userCredential.user.displayName || 'Customer'
                }

                // update redux with logged in user
                const reduxStart = performance.now()
                dispatch(register({ user: nameToUse, email: email, pass: pass }))
                const reduxEnd = performance.now()
                console.log(`[PERFORMANCE] Redux dispatch: ${(reduxEnd - reduxStart).toFixed(2)}ms`)

                const totalTime = performance.now() - startTime
                console.log(`[PERFORMANCE] Total Login Time: ${totalTime.toFixed(2)}ms`)
                setLoading(false)

                // Başarı mesajını göster (await etmeden)
                const swalStart = performance.now()
                Swal.fire({
                    icon: 'success',
                    title: 'Giriş Başarılı!',
                    text: 'Hoş geldiniz ' + nameToUse,
                    timer: 1500,
                    showConfirmButton: false
                })
                const swalEnd = performance.now()
                console.log(`[PERFORMANCE] Swal.fire render: ${(swalEnd - swalStart).toFixed(2)}ms`)
                
                // Hemen yönlendir (Swal.fire'ı beklemeyin)
                const redirectStart = performance.now()
                setTimeout(() => {
                    history.push("/homepage");
                    const redirectEnd = performance.now()
                    console.log(`[PERFORMANCE] History.push redirect: ${(redirectEnd - redirectStart).toFixed(2)}ms`)
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
                                <h3>Login</h3>
                                <form onSubmit={(e)=>{e.preventDefault();login()}}>
                                    <div className="default-form-box">
                                        <label>Email<span className="text-danger">*</span></label>
                                        <input type="text" className="form-control" required value={email} onChange={e => setEmail(e.currentTarget.value)} />
                                    </div>
                                    <div className="default-form-box">
                                        <label>Password<span className="text-danger">*</span></label>
                                        <input type="password" className="form-control" required value={pass} onChange={e => setPass(e.currentTarget.value)} minLength="8"/>
                                    </div>
                                    <div className="login_submit">
                                        <button 
                                            className="theme-btn-one btn-black-overlay btn_md" 
                                            type="submit"
                                            disabled={loading}
                                        >
                                            {loading ? 'Giriş yapılıyor...' : 'Login'}
                                        </button>
                                    </div>
                                    <div className="remember_area">
                                        <div className="form-check">
                                            <input type="checkbox" className="form-check-input" id="materialUnchecked"/>
                                            <label className="form-check-label" htmlFor="materialUnchecked">Remember me</label>
                                        </div>
                                    </div>
                                    <Link to="/register" className="active">Create Your Account?</Link>
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