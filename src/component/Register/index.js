import React, {useState} from 'react'
import { useSelector, useDispatch } from "react-redux";
import Swal from 'sweetalert2';
import { useHistory } from "react-router-dom"
import { auth, db } from '../../firebaseConfig'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { register as setUser } from '../../app/slices/user'

const RegisterArea = () => {
    let dispatch = useDispatch();
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
                title: 'Mr. '+userData.name,
                html:
                    'You are already Registered <br />' +
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
            if(!email || !pass || !user){
                Swal.fire({
                    icon: 'warning',
                    title: 'Eksik Bilgi',
                    text: 'Lütfen tüm alanları doldurun'
                })
                return
            }

            setLoading(true)
            const startTime = performance.now()
            try{
                // create firebase auth user
                const authStart = performance.now()
                const userCredential = await createUserWithEmailAndPassword(auth, email, pass)
                const authEnd = performance.now()
                console.log(`[PERFORMANCE] Firebase Auth createUser: ${(authEnd - authStart).toFixed(2)}ms`)
                
                const uid = userCredential.user.uid

                // optional: update displayName in auth profile with timeout
                const profileStart = performance.now()
                const profilePromise = updateProfile(userCredential.user, { displayName: user })
                const profileTimeout = new Promise((resolve) => {
                    setTimeout(() => {
                        console.warn('[PERFORMANCE] Update Profile timeout (1s), skipping')
                        resolve(null)
                    }, 1000) // 1 saniye timeout
                })
                
                try {
                    await Promise.race([profilePromise, profileTimeout])
                    const profileEnd = performance.now()
                    console.log(`[PERFORMANCE] Update Profile: ${(profileEnd - profileStart).toFixed(2)}ms`)
                } catch(e) {
                    console.warn('Display name update failed:', e)
                    // non-fatal
                }

                // store user profile in Firestore with timeout
                const firestoreStart = performance.now()
                const firestorePromise = (async () => {
                    try {
                        await setDoc(doc(db, 'users', uid), {
                            name: user,
                            email: email,
                            createdAt: serverTimestamp(),
                            uid: uid
                        })
                        return true
                    } catch(e) {
                        console.warn('Firestore write failed:', e)
                        return false
                    }
                })()
                
                const firestoreTimeout = new Promise((resolve) => {
                    setTimeout(() => {
                        console.warn('[PERFORMANCE] Firestore write timeout (2s), skipping')
                        resolve(false)
                    }, 2000) // 2 saniye timeout
                })
                
                try {
                    const firestoreResult = await Promise.race([firestorePromise, firestoreTimeout])
                    const firestoreEnd = performance.now()
                    if (firestoreResult) {
                        console.log(`[PERFORMANCE] Firestore write: ${(firestoreEnd - firestoreStart).toFixed(2)}ms`)
                    } else {
                        console.log(`[PERFORMANCE] Firestore write: skipped (timeout or error)`)
                    }
                } catch(e) {
                    console.warn('Firestore write error:', e)
                    // non-fatal, user is still created in auth
                }

                // update redux state (use aliased action to avoid name collision)
                const reduxStart = performance.now()
                try {
                    dispatch(setUser({ user: user, email: email, pass: pass }))
                    const reduxEnd = performance.now()
                    console.log(`[PERFORMANCE] Redux dispatch: ${(reduxEnd - reduxStart).toFixed(2)}ms`)
                } catch(e) {
                    console.warn('Redux dispatch failed:', e)
                    // non-fatal
                }

                const totalTime = performance.now() - startTime
                console.log(`[PERFORMANCE] Total Register Time: ${totalTime.toFixed(2)}ms`)
                setLoading(false)
                
                // Başarı mesajını göster (await etmeden)
                const swalStart = performance.now()
                Swal.fire({
                    icon: 'success',
                    title: 'Kayıt Başarılı!',
                    text: 'Hesabınız oluşturuldu. Giriş sayfasına yönlendiriliyorsunuz...',
                    timer: 1500,
                    showConfirmButton: false
                })
                const swalEnd = performance.now()
                console.log(`[PERFORMANCE] Swal.fire render: ${(swalEnd - swalStart).toFixed(2)}ms`)
                
                // Hemen yönlendir (Swal.fire'ı beklemeyin)
                const redirectStart = performance.now()
                setTimeout(() => {
                    history.push("/login");
                    const redirectEnd = performance.now()
                    console.log(`[PERFORMANCE] History.push redirect: ${(redirectEnd - redirectStart).toFixed(2)}ms`)
                }, 100)
                
            } catch(error){
                console.error('Registration error:', error)
                setLoading(false)
                
                try {
                    await Swal.fire({
                        icon: 'error',
                        title: 'Kayıt Başarısız',
                        text: error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.'
                    })
                } catch(e) {
                    console.error('Swal.fire error failed:', e)
                }
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
                                <h3>Register</h3>
                                <form onSubmit={(e)=>{e.preventDefault();register()}}>
                                    <div className="default-form-box">
                                        <label>Username<span className="text-danger">*</span></label>
                                        <input type="text" className="form-control" value={user} onChange={e => setUserName(e.currentTarget.value)} required/>
                                    </div>
                                    <div className="default-form-box">
                                        <label>Email<span className="text-danger">*</span></label>
                                        <input type="email" className="form-control" value={email} onChange={e => setEmail(e.currentTarget.value)} required/>
                                    </div>
                                    <div className="default-form-box">
                                        <label>Password<span className="text-danger">*</span></label>
                                        <input type="password" className="form-control" value={pass} onChange={e => setPass(e.currentTarget.value)} required minLength="8"/>
                                    </div>
                                    <div className="login_submit">
                                        <button 
                                            className="theme-btn-one btn-black-overlay btn_md" 
                                            type="submit"
                                            disabled={loading}
                                        >
                                            {loading ? 'Kaydediliyor...' : 'Register'}
                                        </button>
                                    </div>
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