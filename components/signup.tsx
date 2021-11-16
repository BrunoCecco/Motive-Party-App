import React, { useState, useEffect, useRef} from 'react';
import firebase from '../firestore';
import {
  IonButton,
  IonFooter,
  IonPage,
  IonContent, 
  IonToolbar, 
  IonButtons, 
  IonIcon,
  IonTitle,
  IonInput, 
  IonText,
  IonLoading,
  IonSlides,
  IonItem,
  IonSlide,
  IonBackButton,
  IonPopover,
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

const SignUp: React.FC = () => {

  // Will try to use previously entered email, defaults to an empty string
  const [dob, setDob] = useState(
    window.localStorage.getItem("dob") || ""
  );
  const [fullname, setFullname] = useState(
    window.localStorage.getItem("fullname") || ""
  );
  const [username, setUsername] = useState(
    window.localStorage.getItem("username") || ""
  );
  const [signUpMethod, setSignUpMethod] = useState(
    window.localStorage.getItem("signUpMethod") || ""
  );  
  const [password, setPassword] = useState('');
  const [email_or_phone, setEmail_or_phone] = useState(
    window.localStorage.getItem("email_or_phone") || ""
  );
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [fullnameError, setFullnameError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  //const [phoneError, setPhoneError] = useState('');
  const [fieldsMissing, setFieldsMissing] = useState(false);
  const [loading, setLoading] = useState(false);
  //const [code, setCode] = useState('');
  const [resendEmailPopover, setResendEmailPopover] = useState(false);
  const [lastSlide, setLastSlide] = useState(false);
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

  const goToSlide = async(index) => { 
    window.localStorage.setItem("signUpStage", index)
    await slides.current.getSwiper().then(swiper => {
      swiper.slideTo(index, 1500, false)
    })       
  }

  const nextSlide = async() => {
    await slides.current.getSwiper().then(swiper => {
      swiper.slideNext()
    })
    setLoading(false);
  }

  const prevSlide = async() => {
    let swiper = await slides.current.getSwiper()
    if (swiper.isBeginning) {
      return false 
    } else {
      swiper.slidePrev()
      return true 
    }
  }

  const slideOpts = {
    allowTouchMove: false 
  };

  const clearErrors = () => {
    setEmailError('');
    setFullnameError('');
    setUsernameError('');
    setPasswordError('');
    //setPhoneError('');      
    setFieldsMissing(false);  
  }

  const validateEmail = (email) => {
    const re = RegExp(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    return re.test(email);
  }  

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

  // Enter email/password, username and password.
  const slide0SignUp = async() => {
    //console.log(username + password + email_or_phone);
    clearErrors();  
    setLoading(true);
    if (email_or_phone.trim() !== "" && password.trim() !== "" && fullname.trim() !== "") {
      setFieldsMissing(false);    
      window.localStorage.setItem("fullname", fullname);      
      //go to next slide (DOB)      
      setPasswordError("");  
      if (password.trim().length < 6) { // password too short
        setPasswordError("Password too short")
        setLoading(false);
      } else {
        window.localStorage.setItem("email_or_phone", email_or_phone);
        window.localStorage.setItem("username", username);
        // check which sign up method to use        
        // if (validatePhone(email_or_phone)) { 
        //   // it's a phone number                    
        //   setSignUpMethod('phone')
        //   window.localStorage.setItem("signUpMethod", "phone")
        //   console.log("Sign up method (phone): " + signUpMethod)
        //   signUpEmailorPhoneandVerify("phone")
        // } else 
        //if (validateEmail(email_or_phone)) {
          // it's an email
          setSignUpMethod('email')
          window.localStorage.setItem("signUpMethod", "email")
          console.log("Sign up method (email): " + signUpMethod)
          signUpEmailorPhoneandVerify("email")
        // } else {
        //   setEmailError(
        //     "Invalid format for email or phone number. " +
        //     "Please enter phone numbers in the form +447123456789 (for UK)"
        //   )
        //   setLoading(false)
        // }
      }
    } else {
      setLoading(false);
      setFieldsMissing(true);
      setPasswordError('');       
    }
  }

  const signUpEmailorPhoneandVerify = async(method) => {
    if (method === "email") { // they want email sign up
      emailSignUp();
      //triggered 1
    // } else if (method === "phone") { // they want phone sign up
    //   console.log("Triggered 1")
    //   phoneSignUp();
    } else {   // they didn't enter either
      setPasswordError("Enter email or phone number");
      //We should check this field before?
      console.log("signupmethod is neither phone or email")
      goToSlide(0);
      setLoading(false)
    }
  }


  const emailSignUp = async () => {
    clearErrors();
    console.log("Triggered 2")
    console.log("Email: " + email_or_phone)
    firebase.auth().createUserWithEmailAndPassword(email_or_phone, password).then(user => {
      firebase.auth().signInWithEmailAndPassword(email_or_phone, password).then(res => {
        sendVerificationEmail(true);
      }).catch(err => {          
        setPasswordError(err.message);
        goToSlide(0);
        setLoading(false);
      })   
    }).catch(err => {              
      switch(err.code){
        case "auth/invalid-email":
        case "auth/email-already-exists":
        case "auth/email-already-in-use":
          setEmailError(err.message);
          setLoading(false);
          break;
        case "auth/invalid-password":
          setPasswordError(err.message);
          setLoading(false);
          break;
      }              
      goToSlide(0);
    });
  };   

  const sendVerificationEmail = (goToNextSlide) => {
    firebase.auth().currentUser.sendEmailVerification(actionCodeSettings).then(function() {      
      setResendEmailPopover(false);
      setLoading(false);
      if (goToNextSlide) {
        nextSlide()
      };
    }).catch(function(error) {
      // An error happened.
      setLoading(false);
      setEmailError(error.message);
    });      
  }

  const resendEmail = () => {
    setLoading(true);
    clearErrors();
    var user = firebase.auth().currentUser;
    if (user) {
      sendVerificationEmail(false); 
    } else if (email_or_phone.trim() !== "" && password.trim() !== "") {
      firebase.auth().signInWithEmailAndPassword(email_or_phone, password).then(user => {
        sendVerificationEmail(false);        
      }).catch(err => {
        setLoading(false);
        setPasswordError(err.message);
      })
    } else {
      setLoading(false);
      setPasswordError("Please provide an email and password")
    }
  }

  const checkIfVerified = () => {
    clearErrors();  
    const user = firebase.auth().currentUser;
    user.reload().then(() => {
      if (!user.emailVerified) { // if user has signed in by pressing a button in sign up, but isn't verified  
        setEmailError(email_or_phone + " is not verified, please try again or click the link in your email to verify your account");                           
      } else {
        console.log("Email verified")
        // if verified...
        nextSlide();
      }
    });
  }

  // const phoneSignUp = async() => {
  //   console.log("Triggered 2")
  //   clearErrors();
  //   setLoading(true);
  //   const appVerifier = window.recaptchaVerifier;
  //   if (firebase.auth().currentUser) {
  //     firebase.auth().signOut().then(() => {
  //       firebase.auth().signInWithPhoneNumber(email_or_phone, appVerifier)
  //         .then((confirmationResult) => {
  //           console.log("Triggered 3")
  //           // SMS sent. Prompt user to type the code from the message, then sign the
  //           // user in with confirmationResult.confirm(code).        
  //           window.confirmationResult = confirmationResult;
  //           //goToSlide(3);   
  //           nextSlide();
  //           console.log("Phone signed in: " + confirmationResult)
  //         }).catch((error) => {
  //           // Error SMS not sent phone number may be wrong
  //           if (error.code === "auth/invalid-phone-number") {   
  //             setLoading(false);           
  //             setPhoneError(
  //               "Invalid format for email or phone number. " +
  //               "Please enter phone numbers in the form +447123456789 (for UK)"
  //             )
  //             goToSlide(0);
  //           } else {      
  //             setLoading(false);            
  //             setPhoneError(error.message);
  //             goToSlide(0);
  //           }            
  //         });
  //     })
  //   } else {
  //     firebase.auth().signInWithPhoneNumber(email_or_phone, appVerifier)
  //       .then((confirmationResult) => {
  //         console.log("Triggered 3")
  //         // SMS sent. Prompt user to type the code from the message, then sign the
  //         // user in with confirmationResult.confirm(code).        
  //         window.confirmationResult = confirmationResult;
  //         nextSlide();
  //         console.log("Phone signed in: " + confirmationResult)
  //       }).catch((error) => {
  //         // Error SMS not sent phone number may be wrong
  //         if (error.code === "auth/invalid-phone-number") {   
  //           setLoading(false)         
  //           setPhoneError(
  //             "Invalid format for email or phone number. " +
  //             "Please enter phone numbers in the form +447123456789 (for UK)"
  //           )
  //           goToSlide(0);
  //         } else {          
  //           setLoading(false);      
  //           setPhoneError(error.message);
  //           goToSlide(0);
  //         }            
  //       });
  //     }
  //   }  
  
  // const verifyCode = async() => {
  //   setLoading(true);
  //   clearErrors();
  //   if (window.confirmationResult) {
  //     await window.confirmationResult.confirm(code).then((result) => {
  //       // User signed in successfully.
  //       //link with fake email
  //       var phoneEmail = email_or_phone + '@partyemail.com'
  //       var credential = firebase.auth.EmailAuthProvider.credential(phoneEmail, password);
  //       //var user = result.user
  //       result.user.linkWithCredential(credential)      
  //       .then((usercred) => {
  //         var user = usercred.user;
  //         console.log("Account linking success", user); 
  //         nextSlide();                 
  //       }).catch((error) => {
  //         if (error.code === "auth/provider-already-linked") {  
  //           setPhoneError("Someone has already signed up with this phone number")     
  //         }
  //         setLoading(false);
  //         console.log("Account linking error", error);
  //       });

  //     }).catch((error) => {
  //       // User couldn't sign in (bad verification code?)
  //       setLoading(false);
  //       setPhoneError("Verification code is either incorrect or missing, please try again")      
  //     });
  //   } else {
  //     firebase.auth().signOut().then(() => {
  //       phoneSignUp();
  //       setPhoneError("Page refreshed, please try again")
  //     })      
  //   }
  // }

  const addUserInfo = async() => {
    setLoading(true);
    if (username.trim().length < 4) {
      setLoading(false);
      setUsernameError("Please enter a username longer than 4 characters")
    } else {
    await firebase.firestore().collection("users").where("username", "==", username).get().then(snap => {
      if (snap.empty) { // if no duplicate username
        setUsernameError("")
        firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).set({ // create a user document when a new user signs up
          fullname: fullname,
          username: username,
          email: validateEmail(email_or_phone) ? email_or_phone : email_or_phone  + '@partyemail.com',      
          id: firebase.auth().currentUser.uid,
          //phoneNumber: validatePhone(email_or_phone) ? email_or_phone : "",
          //dateOfBirth: dob,
          //phoneVerified:true,
          // bitmoji: window.localStorage.getItem("bitmoji_avatar")
        }, {merge: true}).then(() => {
          setLoading(false);
          nextSlide();      
        }).catch(err => {
          setLoading(false);
          setUsernameError("Oops! An unexpected error occured, please try again.")        
        })                  
      } else {
        setLoading(false);
        setUsernameError("This username is already in use, try another one")        
      }
    }) 
    }     
  }

  const redirect = () => {
    clearErrors();
    const user = firebase.auth().currentUser;
    console.log(user.displayName, user.emailVerified);
    user.reload().then(() => {
      const user = firebase.auth().currentUser;
      if (user.emailVerified === true && user.displayName !== null) {   
        window.location.href=window.location.href// should redirect to home automatically 
      } else {
        console.log("email not verified or display name is null")
      }
    });
  }

  const redirectToHome = () => {
    setLoading(true); 
    setInterval(() => redirect(), 1000)
  }

  // const updateEmailorphone = (val) => {
  //   var re = new RegExp(/^\+?([0-9]{1,4})\)?[-. ]?([0-9]{1,4})[-. ]?([0-9]{1,4})$/g);
  //   if (val[0] === "0" && val[1] === "7") {
  //     var temp = "+44" + val.slice(1);
  //     setEmail_or_phone(temp)
  //   } else {
  //     setEmail_or_phone(val)
  //   }   
  // }   

  return (
    <IonPage>
      <IonToolbar class="ion-padding">
      {lastSlide ? null :
        <IonButtons slot="start">
          <IonBackButton class="signup-back-button" text="" defaultHref="/welcomepage" />
        </IonButtons>} 
        <IonTitle class="ion-padding">Sign Up</IonTitle>
        {/* <IonButtons slot="end">
          <IonButton slot="end">Help</IonButton>
        </IonButtons>     */}
      </IonToolbar>      
      <IonContent id="signin-content" fullscreen={true}>      
      <IonSlides class="sign-up-slides" ref={slides} options={slideOpts} onIonSlideWillChange={()=>hideBtnsCheck()}>

          {/* Slide 0: Email/Phone, fullname, username and password. */}
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
              {emailError ? <div><IonText class="errormsg">{emailError}</IonText></div>:null}
              {/* {phoneError ? <div><IonText class="errormsg">{phoneError}</IonText></div>:null}  */}
              <IonItem lines="none">             
              <IonLabel position="floating">Full Name</IonLabel>
              <IonInput 
              value={fullname} 
              type="text"
              onIonChange={e => setFullname(e.detail.value!)}
              >                  
              </IonInput>  
              </IonItem>
              {fullnameError ? <div><IonText class="errormsg">{fullnameError}</IonText></div>:null}                
            
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
              {passwordError ? <div><IonText class="errormsg">{passwordError}</IonText></div>:null}               
              {fieldsMissing ? <div><IonText class="errormsg">Please fill in all the fields</IonText></div>:null}  
              </div>             
              <IonFooter>
              <IonButton className="signin-button" onClick={()=>slide0SignUp()}>Next</IonButton>
              </IonFooter>
              {/* <div id='sign-in-button'></div> */}
              {/* <IonText>This site is protected by reCAPTCHA and the Google
              <a href="https://policies.google.com/privacy"> Privacy Policy </a> and
              <a href="https://policies.google.com/terms"> Terms of Service </a> apply</IonText>               */}            
          </IonSlide>   
 
          {/* Slide 1: Confirm email or phone number */}
          <IonSlide>
            <div className="signin-inputs">
            {/* if sign up method is email... */}
              <IonText>We have sent you an email, please click the link in the email to verify it before continuing</IonText>
            </div>
            <IonFooter>
            <IonButton className="signin-button" onClick={()=>checkIfVerified()}>Next</IonButton>
            <IonText class="errormsg">{emailError}</IonText><br/>
            <IonButton onClick={() => setResendEmailPopover(true)}>Resend verification email</IonButton>
            </IonFooter>
              {/* <IonItem lines="none">
              <IonLabel position="floating">SMS verification code</IonLabel>
              <IonInput 
              value={code} 
              onIonChange={e => setCode(e.detail.value!)}
              >
              </IonInput>   
              </IonItem>
              {phoneError ? <div><IonText class="errormsg">{phoneError}</IonText></div>:null}
              <IonButton class="signin-button" onClick={()=>verifyCode()}>
                Verify
              </IonButton>                  */}              
          </IonSlide>

          {/* Slide 2: Enter username */}
          <IonSlide>     
              <div className="signin-inputs">
              <IonItem lines="none">
              <IonLabel position="floating">Username</IonLabel>
              <IonInput 
              class="create-input" 
              value={username} 
              type="text"
              onIonChange={e => setUsername(e.detail.value!)}
              ></IonInput>
              </IonItem>
              {usernameError ? <div><IonText class="errormsg">{usernameError}</IonText></div>:null}
              </div>
              <IonFooter>
              <IonButton className="signin-button" onClick={()=>addUserInfo()}>Finish Up</IonButton>
              </IonFooter>              

              {/* <IonInput 
              class="create-input" 
              value={dob} 
              placeholder="Date of birth (dd/mm/yyyy)"
              type="text"
              onIonChange={e => setDob(e.detail.value!)}
              >                
              </IonInput>         
              {dobError ? <><IonText class="errormsg">{dobError}</IonText></>:null}
              <IonButton className="signin-button" onClick={()=>slide2SignUp()}>Next</IonButton>
              <IonText class="errormsg">{fieldsMissing ? "Please fill in all the fields" : (null)} </IonText> */}
              {/* <div id='sign-in-button'>
              <button>Test</button>
              </div> */}
              {/* <div id='sign-in-button'></div> */}
              {/* <IonButton class="signin-button" id='sign-in-button' onClick={()=>signUpEmailorPhoneandVerify()}>Continue</IonButton> */}
              {/* <div id="recaptcha-container"></div> */}
          
              {/* <button className="signin-button" id='sign-in-button'>Skip</button> */}
              {/* <div id='sign-in-button'></div>
              <IonButton onClick={()=>signUpEmailorPhoneandVerify()}>Skip</IonButton>
              <IonText>This site is protected by reCAPTCHA and the Google
              <a href="https://policies.google.com/privacy"> Privacy Policy </a> and
              <a href="https://policies.google.com/terms"> Terms of Service </a> apply</IonText> */}
          </IonSlide>
           
          {/* Slide 3: Welcome in */}
          <IonSlide>   
          <div className="signin-inputs">
          <IonText>Welcome {fullname}!</IonText><br/>
          </div>
          <IonFooter>
          <IonButton className="signin-button" onClick={() => redirectToHome()}>Start Partying!</IonButton>
          <IonText>{emailError}</IonText><br/>
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
          <IonText>Are you sure you want us to resend the email?</IonText><br/>
          <IonButton onClick={() => resendEmail()}>Yes</IonButton>             
          <IonButton onClick={() => setResendEmailPopover(false)}>No</IonButton>             
        </IonPopover>              
    </IonPage>
  )
}

export default SignUp;