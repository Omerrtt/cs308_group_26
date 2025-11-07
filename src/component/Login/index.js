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
            try{
                const userCredential = await signInWithEmailAndPassword(auth, email, pass)
                const uid = userCredential.user.uid

                // try to read profile from Firestore
                let nameToUse = 'Customer'
                try{
                    const docRef = doc(db, 'users', uid)
                    const docSnap = await getDoc(docRef)
                    if(docSnap.exists()){
                        const data = docSnap.data()
                        nameToUse = data.name || nameToUse
                    } else {
                        // fallback: try displayName
                        nameToUse = userCredential.user.displayName || nameToUse
                    }
                } catch(e){
                    // ignore read errors and fallback
                }

                // update redux with logged in user
                dispatch(register({ user: nameToUse, email: email, pass: pass }))

                Swal.fire({
                    icon: 'success',
                    title: 'Login Successful',
                    text: 'Welcome '+ nameToUse
                }).then(() => {
                    history.push("/homepage");
                });
            } catch(error){
                Swal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    text: error.message
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
                                        <button className="theme-btn-one btn-black-overlay btn_md" type="submit">login</button>
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