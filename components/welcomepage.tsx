import React, { useEffect } from 'react';
import {
  IonButton,
  IonPage,
  IonContent, 
  IonText,
  IonIcon
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
import firebase from 'firebase';

const WelcomePage: React.FC = () => {

  useEffect(() => {
    if (firebase.auth().currentUser) {
      firebase.auth().signOut();
    }
  })

  return (
    <IonPage>
{/* <IonToolbar>
    <IonButtons slot="end">
      <IonButton>Help</IonButton>
    </IonButtons>
    </IonToolbar> */}
      <IonContent class="welcome-page-content" id="welcome-page">   
        <IonIcon class="logo-icon" src={"assets/images/logo.svg"}></IonIcon>
        <div className="ion-padding"><IonText class="welcome-title">MOTIVE</IonText><br/></div>
        <div className="ion-padding"><IonText>The app for organizing parties and capturing memories.</IonText><br/></div>
        <IonButton href="signup" class="custom-button">Get Started</IonButton>
        <IonButton href="signin" class="custom-button">Already have an account? Sign In</IonButton>
      </IonContent>
    </IonPage>
  )
}

export default WelcomePage;