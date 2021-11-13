import { useState, useEffect } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, signOut } from "firebase/auth";
import authInit from '../Component/Login/firebase/firebase.init';
//import axios from 'axios';



authInit();

const useFirebase = () => {
    const auth = getAuth();
    const [user, setUser] = useState({});
    const [admin, setAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail]= useState('');
    const [password, setPassword]= useState('');
    const [error, setError]= useState('');
    const [isLogin, setIsLogin]= useState(false);


    const googleProvider = new GoogleAuthProvider();



    const signInUsingGoogle = () => {
        setLoading(true)
        return signInWithPopup(auth, googleProvider)
        .then((result) => {
            const user = result.user;
            setUser(user)
            setError('');

        })
        .catch(error =>{
            setError(error.message);
        })
        .finally(() => setLoading(false));
        
    }


    const toggolLogin = e =>{
        setIsLogin(e.target.checked);
    }
    
    const handleNameChange = e => {
        setName(e.target.value);
      }
    
    const handleEmailChange = e =>{
        setEmail(e.target.value);
    }
    
    const handlePasswordChange = e =>{
        setPassword(e.target.value);
    }
    const handleregister = e => {
        e.preventDefault()
        console.log(email, password);
        if(password.length < 6){
            setError('Password must be 6 charecter long')
            return;
        }
           
        isLogin? processLogin(email, password):  createNewUser(email, password);
    }

    const processLogin = (email, password) => {
        signInWithEmailAndPassword(auth, email, password)
        .then(result=>{
            const user = result.user;
            console.log(user);
            setError('');
        })
        .catch(error=>{
            setError(error.message);
        })
    }

    const setUserName = () => {
        updateProfile(auth.currentUser, { displayName: name })
          .then(result => { })
      }

    const createNewUser = (email, password ) => {
        createUserWithEmailAndPassword(auth, email, password)
        .then(result=>{
        
            hanldeUserInfoRegister(result.user.email )
                
            // save user to the database
                
            const user = result.user;
            console.log(user);
            setError('');
            setUserName();
        })
        .catch(error=> {
            setError(error.message)
        }) 
    }



    const logOut = () => {
        signOut(auth)
            .then(() => {
                setUser({})
            })
    }

    // observe whether user auth state changed or not
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
            }
            setLoading(false)
        });
        return () => unsubscribe();
    }, [auth]);

    useEffect(() => {
        fetch(`http://localhost:5000/users/${user.email}`)
            .then(res => res.json())
            .then(data => setAdmin(data.admin))
    }, [user.email])

    const hanldeUserInfoRegister = (email) => {
        const user = { email };
        fetch("http://localhost:5000/users", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(user),
        })
          .then((res) => res.json())
          .then((result) => console.log(result));
      };


    return {
        user,
        signInUsingGoogle,
        admin,
        loading, 
        setLoading,
        toggolLogin,
        isLogin,
        handleNameChange,
        handleEmailChange,
        handlePasswordChange,
        handleregister,
        error,
        logOut
    }
}

export default useFirebase;
authInit();