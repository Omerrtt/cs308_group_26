import React, { useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { useSelector } from "react-redux"
import Swal from 'sweetalert2'
import firebase from 'firebase/app'
import 'firebase/firestore' // serverTimestamp için garanti
import { auth, db } from './../../firebaseConfig'

const RegisterArea = () => {
  const history = useHistory()
  const [user, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [loading, setLoading] = useState(false)

  const status = useSelector((state) => state.user.status)
  const userData = useSelector((state) => state.user.user)

  const getFriendlyErrorMessage = (error) => {
    if (!error) return 'Bir hata oluştu. Lütfen tekrar deneyin.'

    if (error.code === 'auth/email-already-in-use') return 'Bu email adresi zaten kullanılıyor.'
    if (error.code === 'auth/weak-password') return 'Şifre çok zayıf. En az 6 karakter olmalıdır.'
    if (error.code === 'auth/invalid-email') return 'Geçersiz email adresi.'
    if (error.code === 'auth/operation-not-allowed') return 'Email/şifre ile kayıt şu an kapalı.'

    return error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.'
  }

  // ENTER ile submit (double submit korumalı)
  const handleEnter = (e) => {
    if (loading) return
    if (e.key === 'Enter') {
      e.preventDefault()
      register()
    }
  }

  const register = async () => {
    if (loading) return

    // Zaten login ise
    if (status) {
      const res = await Swal.fire({
        icon: 'question',
        title: 'Sayın ' + (userData?.name || 'Kullanıcı'),
        html:
          'Zaten kayıtlısınız <br />' +
          '<b>Hesabım</b> sayfasına gidebilir veya <b>Alışveriş</b> yapabilirsiniz',
        showCancelButton: true,
        confirmButtonText: 'Hesabım',
        cancelButtonText: 'Kapat'
      })

      if (res.isConfirmed) history.push('/my-account')
      return
    }

    // Basit validation
    const trimmedName = user.trim()
    const trimmedEmail = email.trim().toLowerCase()
    const trimmedPass = pass

    if (!trimmedName || !trimmedEmail || !trimmedPass) {
      Swal.fire({
        icon: 'warning',
        title: 'Eksik Bilgi',
        text: 'Lütfen tüm alanları doldurun'
      })
      return
    }

    if (trimmedPass.length < 6) {
      Swal.fire({
        icon: 'warning',
        title: 'Şifre Zayıf',
        text: 'Şifre en az 6 karakter olmalıdır.'
      })
      return
    }

    setLoading(true)

    try {
      const userCredential = await auth.createUserWithEmailAndPassword(trimmedEmail, trimmedPass)
      const uid = userCredential.user.uid

      // displayName (fail etse bile kayıt devam etsin)
      try {
        await userCredential.user.updateProfile({ displayName: trimmedName })
      } catch (e) {
        console.warn('Display name update failed:', e)
      }

      // Firestore user doc (fail etse bile kayıt devam etsin)
      try {
        await db.collection('users').doc(uid).set({
          name: trimmedName,
          email: trimmedEmail,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          uid,
          orders: [],
          cart: [],
          addresses: [],
          invoices: []
        })
      } catch (e) {
        console.warn('Firestore write failed:', e)
      }

      // Temiz akış için signOut
      try {
        await auth.signOut()
      } catch (e) {
        console.warn('Firebase signOut failed:', e)
      }

      await Swal.fire({
        icon: 'success',
        title: 'Kayıt Başarılı!',
        text: 'Hesabınız oluşturuldu. Giriş sayfasına yönlendiriliyorsunuz...',
        timer: 1400,
        showConfirmButton: false
      })

      history.push("/login")
    } catch (error) {
      console.error('Registration error:', error)
      Swal.fire({
        icon: 'error',
        title: 'Kayıt Başarısız',
        text: getFriendlyErrorMessage(error)
      })
    } finally {
      setLoading(false)
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

                <form onSubmit={(e) => { e.preventDefault(); register() }}>
                  <div className="default-form-box">
                    <label>Kullanıcı Adı<span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      value={user}
                      onChange={e => setUserName(e.currentTarget.value)}
                      onKeyDown={handleEnter}
                      disabled={loading}
                      required
                      placeholder="Örn: cagdas"
                    />
                  </div>

                  <div className="default-form-box">
                    <label>Email<span className="text-danger">*</span></label>
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={e => setEmail(e.currentTarget.value)}
                      onKeyDown={handleEnter}
                      disabled={loading}
                      required
                      placeholder="ornek@mail.com"
                    />
                  </div>

                  <div className="default-form-box">
                    <label>Şifre<span className="text-danger">*</span></label>
                    <input
                      type="password"
                      className="form-control"
                      value={pass}
                      onChange={e => setPass(e.currentTarget.value)}
                      onKeyDown={handleEnter}
                      disabled={loading}
                      required
                      minLength={6}
                      placeholder="••••••"
                    />
                    <small style={{ opacity: 0.75 }}>En az 6 karakter</small>
                  </div>

                  <div className="login_submit">
                    <button
                      className="theme-btn-one btn-black-overlay btn_md"
                      type="submit"
                      disabled={loading}
                      aria-busy={loading}
                    >
                      {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
                    </button>
                  </div>

                  <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '14px' }}>
                    <span style={{ marginRight: '4px' }}>Zaten hesabınız var mı?</span>
                    <Link to="/login" className="active">
                      Giriş Yap
                    </Link>
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