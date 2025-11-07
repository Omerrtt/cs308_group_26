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
            try{
                // create firebase auth user
                const userCredential = await createUserWithEmailAndPassword(auth, email, pass)
                const uid = userCredential.user.uid

                // optional: update displayName in auth profile
                try{
                    await updateProfile(userCredential.user, { displayName: user })
                } catch(e) {
                    // non-fatal
                }

                // store user profile in Firestore
                await setDoc(doc(db, 'users', uid), {
                    name: user,
                    email: email,
                    createdAt: serverTimestamp(),
                    uid: uid
                })

                // update redux state (use aliased action to avoid name collision)
                dispatch(setUser({ user: user, email: email, pass: pass }))

                Swal.fire({
                    icon: 'success',
                    title: 'Registration Successful',
                    text: 'Register başarılı, şimdi login yapın'
                }).then(() => {
                    history.push("/login");
                });
            } catch(error){
                Swal.fire({
                    icon: 'error',
                    title: 'Registration Failed',
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
                                        <button className="theme-btn-one btn-black-overlay btn_md" type="submit">Register</button>
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