import React, {useState, useEffect} from 'react';
import {
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonItem,
} from '@ionic/react';
import { 
} from 'ionicons/icons';
import '../App.css'
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
import firebase from '../firestore'


const Memory = ({notifications, data, click}) => {
  // party card  
  const [host, setHost] = useState('');
 
  useEffect(() => {
    firebase.firestore().collection("users").doc(data.hostid).get().then(doc => {
      setHost(doc.data().username)
    })
  }, [])
  
  return(
    <IonItem button lines="none" onClick={click} class="accordion-item">
    <IonGrid>
      <IonRow>
        <IonCol size="12">
          <IonText>{data.title}</IonText>
        </IonCol>
      </IonRow>               
      <IonRow>
        <IonCol size="11">
          <IonText class="white-text">{data.date}<br/></IonText> 
          <IonText class="white-text">Hosted By {host}</IonText>
        </IonCol>
        {notifications === true ? 
        <IonCol>
        <div className="notification-dot"></div>
        </IonCol>
        : null}        
      </IonRow>
      </IonGrid>
    </IonItem>        
  )
}

export default Memory;