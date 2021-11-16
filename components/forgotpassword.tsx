import React, { useState, useEffect, useRef} from 'react';
import firebase from '../firestore';
import {
  IonButton,
  IonPage,
  IonContent, 
  IonToolbar, 
  IonButtons, 
  IonTitle,
  IonInput,  
  IonText,
  IonLoading,
  IonSlides,
  IonItem,
  IonSlide,
  IonBackButton,
  IonPopover,
  IonLabel,
  IonFooter
} from '@ionic/react';
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

const ForgotPassword: React.FC = () => {

  // Will try to use previously entered email, defaults to an empty string
  const [email_or_phone, setEmail_or_phone] = useState(
    window.localStorage.getItem("email_or_phone") || ""
  );
  const [emailError, setEmailError] = useState('');
  // const [phoneError, setPhoneError] = useState('');
  const [loading, setLoading] = useState(false);
  // const [code, setCode] = useState('');
  const [resendEmailPopover, setResendEmailPopover] = useState(false);
  const [lastSlide, setLastSlide] = useState(false);
  const [emailorphoneError, setEmailorphoneError] = useState('');
  const slides = useRef(null);

  // When this component renders
  useEffect(() => {  
    clearErrors(); 
    hideBtnsCheck();
    //  window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('sign-in-button', {
    //    'size': 'invisible',
    //    'callback': (response) => {
    //      // reCAPTCHA solved, allow signInWithPhoneNumber.
    //      console.log("Response: " + response)
    //      //signUpEmailorPhoneandVerify()
    //      //phoneSignUp()
    //      //phoneNumberAuth()
    //    },
    //    'expired-callback': () => {
    //      // Response expired. Ask user to solve reCAPTCHA again.
    //    }
    //  });

    //  window.recaptchaVerifier.render().then(function (widgetId) {
    //    window.recaptchaWidgetId = widgetId;   
    //  }); 
  }, []);  

  var actionCodeSettings = {
    url: "http://localhost:8100/signup",
    dynamicLinkDomain: "motivepartyapp.page.link",
    handleCodeInApp: false,
    iOS: {
      bundleId: 'com.charke.partyapp',
    },
    android: {
      packageName: 'com.charke.partyapp',
      //minimumVersion: '0',
      installApp: true,
    }
  };  

  const hideBtnsCheck = async() => {
    let swiper = await slides.current.getSwiper()
    if (swiper.isEnd) {
      setLastSlide(true)
    } else {
      setLastSlide(false)
    }
  }

  const nextSlide = async() => {
    await slides.current.getSwiper().then(swiper => {
      swiper.slideNext()
    })
    setLoading(false);
  }

  // const prevSlide = async() => {
  //   let swiper = await slides.current.getSwiper()
  //   if (swiper.isBeginning) {
  //     return false 
  //   } else {
  //     swiper.slidePrev()
  //     return true 
  //   }
  // }

  const slideOpts = {
    allowTouchMove: false 
  };

  const clearErrors = () => {
    setEmailError('');
    //setPhoneError('');       
  }

  // const validateEmail = (email) => {
  //   const re = RegExp(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  //   return re.test(email);
  // }  

  // const validatePhone = (num) => {
  //   var re = new RegExp(/^\+?([0-9]{1,4})\)?[-. ]?([0-9]{1,4})[-. ]?([0-9]{1,4})$/g);
  //   if (num[0] === "0" && num[1] === "7") {
  //     var temp = "+44" + num.slice(1);
  //     setEmail_or_phone(temp)
  //     console.log(temp)
  //     return true 
  //   } else {
  //     return re.test(num);
  //   }    
  // }  
  
  // const redirect = () => {
  //   const user = firebase.auth().currentUser;
  //   console.log(user.displayName, user.uid);
  //   user.reload();
  //   if (user.emailVerified && user.displayName !== null) { // if user has signed in by pressing a button in sign up, but isn't verified  
  //     window.location.href=window.location.href; // reloads app
  //   }  
  // }

  // const updateEmailorphone = (val) => {
  //   var re = new RegExp(/^\+?([0-9]{1,4})\)?[-. ]?([0-9]{1,4})[-. ]?([0-9]{1,4})$/g);
  //   if (val[0] === "0" && val[1] === "7") {
  //     var temp = "+44" + val.slice(1);
  //     setEmail_or_phone(temp)
  //   } else {
  //     setEmail_or_phone(val)
  //   }   
  // }  

  const resetPassword = () => {  
    clearErrors();  
    if (email_or_phone.trim() === "") { // ask user to provide an email address
      setEmailorphoneError("Please provide an email or phone number before resetting your password");
      //setForgotPassword(false); // remove popover
    } else {
      setEmailorphoneError("")
      //check if phone or email
      // if (validatePhone(email_or_phone)) { 
      //   setSignUpMethod("phone")
      //   //send code to phone, and reset password.
      //   const appVerifier = window.recaptchaVerifier;
      //   firebase.auth().signInWithPhoneNumber(email_or_phone, appVerifier)
      //     .then((confirmationResult) => {
      //       // SMS sent. Prompt user to type the code from the message, then sign the
      //       // user in with confirmationResult.confirm(code).        
      //       window.confirmationResult = confirmationResult;
      //       console.log("Phone signed in: " + confirmationResult)
      //       // IF THIS STAGE IS REACHED, A POP UP SHOULD APPEAR ASKING USER TO ENTER CODE,
      //       // IF CODE IS CORRECT, THEN updatePassword CAN BE USED TO CHOOSE A NEW PASSWORD AND SAVE A NEW PASSWORD
      //       nextSlide();
      //     }).catch((error) => {
      //       // Error SMS not sent phone number may be wrong
      //       if (error.code === "auth/invalid-phone-number") {              
      //         setPhoneError(
      //          "Invalid format for email or phone number. " +
      //          "Please enter phone numbers in the form +447123456789 (for UK)"
      //        )
      //       } else {                  
      //        setPhoneError(error.message);
      //       }
      //     })
      // } else 
      // if (validateEmail(email_or_phone)) {
        //setSignUpMethod("email")
          //reset email password.
        console.log("going to reset email password")
        console.log(email_or_phone)
        firebase.auth().sendPasswordResetEmail(email_or_phone, actionCodeSettings).then(() => {
          nextSlide();
        }).catch(function(error) {
          setEmailorphoneError(error.message)
          switch(error.code){
            case "auth/invalid-email":
            case "auth/user-disabled":
            case "auth/user-not-found":
              setEmailorphoneError("User not found or is disabled, please check you have signed up to Motive before trying to reset your password.");
              break;
          }         
        });  
      // }        
    }
  }

// const verifyCodeforReset = async() => {
//     clearErrors();
//     if (window.confirmationResult) {  
//       await window.confirmationResult.confirm(code).then((result) => {
//         // User signed in successfully.
//         // update password
//         var user = firebase.auth().currentUser;  
//         user.updatePassword(newPassword).then(function() {
//           setNewPassword('');
//           setLoading(false);
//         }).catch(function(error) {
//           setNewPasswordError(error.message);
//           setLoading(false);
//         });          
//       }).catch((error) => {
//         // User couldn't sign in (bad verification code?)
//         setLoading(false);
//         setPhoneError(error.message);   
//       });
//     }
//   }  

//   const verifyNewPassword = () => {
//     setLoading(true)
//     if (newPassword.trim().length > 6) {
//         verifyCodeforReset();            
//     } else {
//       setLoading(false)
//       setNewPasswordError("Password may be too short, has to be over 6 characters")   
//     }
//   }

  return (
    <IonPage>
      <IonToolbar class="ion-padding">
          {lastSlide ? null :
        <IonButtons slot="start">
          <IonBackButton text="" color="warning" defaultHref="/welcomepage" />
        </IonButtons>}
        <IonTitle class="ion-padding signup-toolbar">Forgot Password</IonTitle> 
        {/* {lastSlide ? null : <IonButtons slot="end">
          <IonButton slot="end">Help</IonButton>
        </IonButtons>}    */}
      </IonToolbar>
      <IonContent id="signin-content">      
      <IonSlides class="sign-up-slides" ref={slides} options={slideOpts} onIonSlideWillChange={()=>hideBtnsCheck()}>

          {/* Slide 0: Enter email or number. */}
          <IonSlide>               
            <div className="signin-inputs">
              <IonItem lines="none">
              <IonLabel position="floating">Email</IonLabel>
              <IonInput 
              value={email_or_phone} 
              type="text"
              onIonChange={e => setEmail_or_phone(e.detail.value!)}
              >        
              </IonInput>
              </IonItem>
              {emailError ? <div className="ion-padding"><IonText class="errormsg">{emailError}</IonText></div>:null}
              {/* {phoneError ? <div className="ion-padding"><IonText class="errormsg">{phoneError}</IonText></div>:null}  */}
              {emailorphoneError ? <div className="ion-padding"><IonText class="errormsg">{emailorphoneError}</IonText></div>:null}
              </div>
              <IonFooter>
              <IonButton className="signin-button" onClick={()=>resetPassword()}>Next</IonButton>
              </IonFooter>
              {/* <div id='sign-in-button'></div>
              <IonText>This site is protected by reCAPTCHA and the Google
              <a href="https://policies.google.com/privacy"> Privacy Policy </a> and
              <a href="https://policies.google.com/terms"> Terms of Service </a> apply</IonText>               */}
          </IonSlide>   
 
          {/* Slide 1: Create new password and confirm code */}
          <IonSlide>     
              <div className="signin-inputs">
              {/* <>
              <IonItem lines="none">
              <IonLabel position="floating">SMS verification code</IonLabel>
              <IonInput 
              value={code} 
              onIonChange={e => setCode(e.detail.value!)}
              >
              </IonInput>   
              </IonItem>
              {phoneError ? <div className="ion-padding"><IonText class="errormsg">{phoneError}</IonText></div>:null}

              <IonItem lines="none">           
              <IonLabel position="floating">New Password</IonLabel>
                <IonInput 
                value={newPassword} 
                type={showPassword ? "text" : "password"}
                onIonChange={e => setNewPassword(e.detail.value!)}
                >
                </IonInput>   
                <div className="eye-icon" slot="end">                
                <IonIcon onClick={()=>setShowPassword(!showPassword)} slot="end" icon={eyeOutline}>
                </IonIcon> 
                </div>         
              </IonItem>
              {newPasswordError ? <div className="ion-padding"><IonText class="errormsg">{newPasswordError}</IonText></div>:null}
              
              <IonButton class="signin-button" onClick={()=>verifyNewPassword()}>
                Reset password and sign in 
              </IonButton>
              <br/>
              <div className="ion-text-start"><IonButton onClick={() => prevSlide()}>Prev</IonButton></div>              
              </>
              : */}
              <IonText>An email has been sent to {email_or_phone}, click the link in the email to reset your password.</IonText>
              <IonText>{emailError}</IonText>  
              </div>            
              <IonFooter>
              <IonButton className="signin-button" href="/signin">Go to sign in</IonButton>
              </IonFooter>
          </IonSlide>
        </IonSlides>            
      </IonContent>      
      <IonLoading 
      cssClass="loading"
      spinner="bubbles"
      isOpen={loading} 
      onDidDismiss={() => setLoading(false)} />  
        <IonPopover
          id="popover"
          cssClass="popover"        
          isOpen={resendEmailPopover}
          onDidDismiss={() => setResendEmailPopover(false)}
        >
          <IonText>Are you sure you want us to resend the email?</IonText>
          {/* <IonButton onClick={() => resendEmail()}>Yes</IonButton>              */}
          <IonButton onClick={() => setResendEmailPopover(false)}>No</IonButton>             
        </IonPopover>                     
    </IonPage>
  )
}

export default ForgotPassword;