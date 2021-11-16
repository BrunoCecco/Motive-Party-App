import React, { useState, useEffect} from 'react';
import firebase from '../firestore';
// import PhoneInput from 'react-phone-number-input';
import {
  IonButton,
  IonPage,
  IonContent, 
  IonToolbar, 
  IonIcon,
  IonTitle,
  IonInput, 
  IonText,
  IonFooter,
  IonBackButton,
  IonButtons,
  IonItem,
  IonLabel
} from '@ionic/react';
import { 
  eyeOutline,
} from 'ionicons/icons';
/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
/* Theme variables */
import '../variables.css';

// declare global {
//   interface Window {
//     recaptchaVerifier:any;
//     recaptchaWidgetId:any;
//     confirmationResult:any;
//   }
// }

const SignIn: React.FC = () => {

  // Will try to use previously entered email, defaults to an empty string
  const [emailorphone, setEmailorphone] = useState(
    window.localStorage.getItem("emailorphone") || ""
  );
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailorphoneError, setEmailorphoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [fieldsMissing, setFieldsMissing] = useState(false);

  useEffect(() => {
    clearErrors();
    if (firebase.auth().currentUser && !firebase.auth().currentUser.emailVerified) { 
      firebase.auth().signOut();
    }
    
    // window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('sign-in-button', {
    //   'size': 'invisible',
    //   'callback': (response) => {
    //     // reCAPTCHA solved, allow signInWithPhoneNumber.
    //     console.log("Response: " + response)
    //     //signUpEmailorPhoneandVerify()
    //     //phoneSignUp()
    //     //phoneNumberAuth()
    //   },
    //   'expired-callback': () => {
    //     // Response expired. Ask user to solve reCAPTCHA again.
    //   }
    // });

    // window.recaptchaVerifier.render().then(function (widgetId) {
    //   window.recaptchaWidgetId = widgetId;   
    // }); 
  }, [])

  // var actionCodeSettings = {
  //   url: 'http://localhost:8100/signup',
  //   iOS: {
  //     bundleId: 'com.partyuptest.partyapp'
  //   },
  //   android: {
  //     packageName: 'com.charke.partyapp',
  //     installApp: true,
  //     minimumVersion: '12'
  //  },
  //   handleCodeInApp: false,
  //   // When multiple custom dynamic link domains are defined, specify which
  //   // one to use.
  //  dynamicLinkDomain: "motivepartyapp.page.link"
  // };  

  const clearErrors = () => {
    setEmailorphoneError('');
    setPasswordError('');  
    setFieldsMissing(false);  
  }

  const validateEmail = (email) => {
    const re = RegExp(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    return re.test(email);
  }  

  // const validatePhone = (num) => {
  //   var re = new RegExp(/^\+?([0-9]{1,4})\)?[-. ]?([0-9]{1,4})[-. ]?([0-9]{1,4})$/g);
  //   return re.test(num);
  // }  

  const handleLogin = () => {
    // normal login function 
    clearErrors();   
    // check all fields have a value 
    if (emailorphone.trim() === "" || password.trim() === "") {
      setFieldsMissing(true);
    } else if (firebase.auth().currentUser && !firebase.auth().currentUser.emailVerified) {
      setPasswordError("Not verified, please click the link in your email to verify your account");      
    } else { 
      // if (validatePhone(emailorphone)) { 
      //   console.log("phone number")
      //   phoneSignIn()
      // } else 
      if (validateEmail(emailorphone)) {
        console.log("email")
        emailSignIn()
      } else {
        setEmailorphoneError("Invalid format for email, please try again")
      }
    }
  }  

  const emailSignIn = () => {
    setFieldsMissing(false);     
    firebase.auth().signInWithEmailAndPassword(emailorphone, password)
      .then(result => {
        console.log("signed in with email and password")      
      })
      .catch(err => {
        switch(err.code){
          case "auth/invalid-email":
          case "auth/user-disabled":
          case "auth/user-not-found":
            setEmailorphoneError("User not found or is disabled, please check you have signed up to Motive before trying to sign in.");
            break;
          case "auth/wrong-password":
            setPasswordError("The password you entered is incorrect, please try again or reset your password");
            break;
        }
        console.log(err.message)
      })    
  }

  // const phoneSignIn = () => {
  //   setFieldsMissing(false);     
  //   var phoneEmail = emailorphone + '@partyemail.com';
  //   firebase.auth().signInWithEmailAndPassword(phoneEmail, password)
  //     .then(result => {
  //       console.log("signed in with email and password", firebase.auth().currentUser.emailVerified)      
  //     })
  //     .catch(err => {
  //       switch(err.code){
  //         case "auth/invalid-email":
  //           setEmailorphoneError("Phone number not found or not formatted correctly")
  //         case "auth/user-disabled":
  //         case "auth/user-not-found":
  //           setEmailorphoneError("User not found or is disabled, please check you have signed up to Motive before trying to sign in.");
  //           break;
  //         case "auth/wrong-password":
  //           setPasswordError("The password you entered is incorrect, please try again or reset your password");
  //           break;
  //       }
  //     })    
  // }  

  // const updateEmailorphone = (val) => {
  //   var re = new RegExp(/^\+?([0-9]{1,4})\)?[-. ]?([0-9]{1,4})[-. ]?([0-9]{1,4})$/g);
  //   if (val[0] === "0" && val[1] === "7") {
  //     var temp = "+44" + val.slice(1);
  //     setEmailorphone(temp)
  //   } else {
  //     setEmailorphone(val)
  //   }   
  // }

  return (
    <IonPage>
    {/* <div id="my-login-button-target"></div>
    <div id="display_name"></div>
    <img id="bitmoji"/>
    <div id="external_id"></div> */}

      <IonToolbar class="ion-padding">
        <IonButtons slot="start">
          <IonBackButton class="signup-back-button" text="" defaultHref="/welcomepage" />
        </IonButtons>
        <IonTitle class="ion-padding">Sign In</IonTitle>
        {/* <IonButtons slot="end">
          <IonButton slot="end">Help</IonButton>
        </IonButtons>     */}
      </IonToolbar>
      <IonContent id="signin-content">   
        <div className="signin-inputs">
          <IonItem lines="none">
          <IonLabel position="floating">Email</IonLabel>
          <IonInput 
          value={emailorphone} 
          type="text"
          onIonChange={e => setEmailorphone(e.detail.value!)}
          >        
          </IonInput> 
          </IonItem>
          <IonItem lines="none">           
          <IonLabel position="floating">Password</IonLabel>
            <IonInput 
            value={password} 
            type={showPassword ? "text" : "password"}
            onIonChange={e => setPassword(e.detail.value!)}
            >
            </IonInput>   
            <div className="button-icon" slot="end">                
            <IonIcon onClick={()=>setShowPassword(!showPassword)} slot="end" icon={eyeOutline}>
            </IonIcon> 
            </div>         
          </IonItem>
          <div className="ion-text-end">
            <IonButton className="yellow-text" href="/forgotpassword">Forgot Password?</IonButton>
          </div>  
          {passwordError ? <div className="ion-padding"><IonText class="errormsg">{passwordError}</IonText></div> : null}
          {fieldsMissing ? <div className="ion-padding"><IonText class="errormsg">Please fill in all the fields</IonText></div>:null}               
          {/* <div id='sign-in-button'></div> */}
          {emailorphoneError ? <div className="ion-padding"><IonText class="errormsg">{emailorphoneError}</IonText></div>:null}               
          </div>          
      </IonContent>
      <IonFooter>
        <IonButton class="signin-button" onClick={() => handleLogin()}>Sign in</IonButton>                    
      </IonFooter>      
    </IonPage>
  )
}

export default SignIn;