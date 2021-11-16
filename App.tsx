import React, { useState, useEffect } from 'react';
import Users from './components/users';
import CreateParty from './components/createparty';
import Gallery from './components/gallery';
import MyPartyList from './components/mypartylist';
import SignIn from './components/signin';
import SignUp from './components/signup';
import ForgotPassword from './components/forgotpassword';
import WelcomePage from './components/welcomepage';

import {Online, Offline} from "react-detect-offline";

import { Route, Redirect, useLocation } from 'react-router-dom';
// import { RefresherEventDetail } from '@ionic/core';
import {
  IonApp,
  IonIcon,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonHeader,
  IonTabs, 
  IonItem,
  IonButton,
  IonPage,
  IonContent, 
  IonToolbar, 
  IonButtons, 
  IonTitle,
  IonRow,
  IonCol,
  IonGrid,
  IonPopover,
  IonImg,
  IonText,
  IonToast,
  IonLoading,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { 
  personAddSharp,   
  cameraOutline,
  thumbsUpOutline,
  thumbsDownOutline,
  imagesOutline,
  createOutline,
  peopleOutline
} from 'ionicons/icons';
import {
  PushNotificationSchema,
  PushNotifications,
} from '@capacitor/push-notifications';
import { Camera, CameraResultType, CameraSource, CameraDirection } from '@capacitor/camera';

import './App.css';
import firebase from './firestore';
import moment from 'moment';
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
import './variables.css';

const Party = ({id, data, live, edit}) => {
  // party card

  var user = firebase.auth().currentUser.uid

  const [showToast, setShowToast] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const [showAccepted, setShowAccepted] = useState(false);
  const [pictureUploading, setPictureUploading] = useState(false);
  const [photo, setPhoto] = useState('');
  //const [videoUrls, setVideoUrls] = useState<any[]>([]);
  const [timeUntil, setTimeUntil] = useState("");
  const [host, setHost] = useState('');
  const [pictureError, setPictureError] = useState('');
  const [currentUser, setCurrentUser] = useState(''); // id of current user
  const collectionRef = firebase.firestore().collection("users").doc(data.hostid).collection("myParties");  

  useEffect(()=>{            
    firebase.firestore().collection("users").doc(data.hostid).get().then(doc => {
      setHost(doc.data().username);
    })        
    setCurrentUser(user);
    getDaysUntilParty();
  }, [])

  const onSave = async() => { 
    setPictureUploading(true);
    setPictureError("");
    if (photo !== "") {
    collectionRef.doc(id).collection('pictures').add({
        picture: photo,
        takenByID: user,
        takenAt: moment(new Date()).format('LT'),
        likeCounter: 0,
        likes: [],
    })
      .then(() => {
        setPictureUploading(false);
        setShowToast(true);
        setPhoto('');
      })
      .catch((error) => {
        setPictureUploading(false);
        setPictureError(error.message);
      });
    } else {
      setPictureUploading(false);
    }
  }  

  const takePhoto = async() => {
    const cameraPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
      quality: 90,
      height: 1350,
      width: 1000,
      preserveAspectRatio: true,
      direction: CameraDirection.Front,
      saveToGallery: true
    });
    var photo = `data:image/jpeg;base64,${cameraPhoto.base64String}`;
    setPhoto(photo);  
  }    

  const getGalleryPhoto = async() => {
    const cameraPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos,
      quality: 90,
      height: 1350,
      width: 1000,
      preserveAspectRatio: true,
      direction: CameraDirection.Front,
      saveToGallery: true
    });
    var photo = `data:image/jpeg;base64,${cameraPhoto.base64String}`;
    setPhoto(photo);  
  }

  // const takeVideo = async () => {
  //   let options: VideoCapturePlusOptions = { limit: 1, duration: 30, highquality: true };
  //   let capture:any = await VideoCapturePlus.captureVideo(options);
  //   let media = capture[0] as MediaFile;
  //   setVideoUrls(videos => [...videos, Capacitor.convertFileSrc(media.fullPath)]);
  //   setPictureError(Capacitor.convertFileSrc(media.fullPath));
  //   // const blob = await fetch(
  //   //     Capacitor.convertFileSrc(media.fullPath)
  //   // ).then(r => r.blob());
  //   // var fd = new FormData();
  //   // fd.append('file', blob);
  //   // axios.post('upload/video', fd, {
  //   //     headers: {
  //   //         'content-type': 'multipart/form-data'
  //   //     }
  //   // })
  //   // .then(res => {
  //   //     console.log(res);
  //   // });
  // };

  const getDaysUntilParty = () => {    
    var now = moment();
    var timeUntilParty = "Starts " + now.to(data.dateTime);    
    setTimeUntil(timeUntilParty);        
  }

  return(
    <>
    <div className="party-title">
    {moment().isBetween(moment(data.endTime), moment(data.endTime).add(20, 'hours')) ? 
    <IonCardTitle class="live-title">After Party</IonCardTitle> :
    live ? <IonCardTitle class="live-title">Live Party</IonCardTitle> : 
    <div className="ion-text-center">
      <IonText class="black-text">{timeUntil}</IonText>
    </div>}
    </div>
    <IonItem className={!live ? "accordion-item" :"accordion-live-item"} lines="none">
      <IonGrid>
        <IonRow>
          <IonCol size="2.5" class={live ? "red-date-box" : "yellow-date-box"}>
            <IonText>{data.month} <br/></IonText>   
            <IonText class="day-text">{data.day}</IonText> 
          </IonCol>
          <IonCol>            
            <IonText>{data.title} <br/></IonText>  
            <IonText class="white-text">{data.address}</IonText><br/>
            {data.postcode ? <><IonText class="white-text">{data.postcode}</IonText><br/></> : null}
            <IonText class="white-text">By {host}</IonText>
          </IonCol>      
        </IonRow> 
        <IonRow className="ion-text-center">
          {currentUser === data.hostid ?  
            <IonCol className="ion-align-self-center">
            <IonButton color="dark" onClick={edit}>
              <IonIcon slot="icon-only" icon={createOutline} />
            </IonButton>
            </IonCol>
            : null
          } 
          <IonCol className="ion-align-self-center">    
            <IonButton color="dark" onClick={()=> setShowAccepted(true)}>
              <IonIcon slot="icon-only" icon={peopleOutline}/>
            </IonButton>
          </IonCol>                           
          <IonCol className="ion-align-self-center">    
            <IonButton color="dark" onClick={()=> setShowPopover(true)}>
              <IonIcon slot="icon-only" src="assets/icon/balloon-outline.svg"/>
            </IonButton>
          </IonCol>
          {live ? 
          <>
          <IonCol className="ion-self-align-center"> 
            <IonButton color="dark" onClick={() => takePhoto()}>
              <IonIcon slot="icon-only" icon={cameraOutline} />      
            </IonButton>  
          </IonCol>
          <IonCol className="ion-self-align-center"> 
            <IonButton color="dark" onClick={() => getGalleryPhoto()}>
              <IonIcon slot="icon-only" icon={imagesOutline} />      
            </IonButton>  
          </IonCol>                   
          </>                     
          : null}
        </IonRow> 
        {photo ?
        <IonGrid class="photo-grid">         
        <IonRow  className="ion-text-center"> 
          <IonImg src={photo}></IonImg>
        </IonRow>     
        <IonRow  className="ion-text-center">
          <IonCol>
          <IonButton onClick={() => onSave()}>
            Share      
          </IonButton>
          </IonCol>
          <IonCol className="ion-align-self-center">
          <IonButton onClick={() => setPhoto('')}>
            Cancel
          </IonButton> 
          </IonCol>           
        </IonRow>
        <IonRow>
          <IonText>{pictureError}</IonText>
        </IonRow>
        </IonGrid> : null}  
        {/* {videoUrls.map((video: any, key: any) => (
          <video controls key={key} width="100%" height="150px" src={video}></video>
        ))} */}
      </IonGrid>   
      <IonPopover
        cssClass="party-details-popover"        
        isOpen={showPopover}
        onDidDismiss={() => setShowPopover(false)}
      >
        {/* if not blank then display detail in pop up */}
        {data.address ? <IonItem lines="none">Location: {data.address} </IonItem> : null}
        {data.postcode ? <IonItem lines="none">Postcode: {data.postcode} </IonItem> : null}
        {data.dresscode ? <IonItem lines="none">Dress Code: {data.dresscode} </IonItem> : null}
        {data.drinksProvided ? <IonItem lines="none">Drinks Provided: {data.drinksProvided} </IonItem> : null}
        <IonItem lines="none">Starts: {moment(data.dateTime).format('ddd, LT')}</IonItem>     
        <IonItem lines="none">Ends: {moment(data.endTime).format('ddd, LT')}</IonItem>
        {data.invited_people ? <IonItem lines="none">Number of Invites: {data.invited_people.length}</IonItem>  : null}        
        {data.details ? <IonItem lines="none">Details: {data.details}</IonItem> : null } 
      </IonPopover>  
      <IonPopover
        cssClass="party-details-popover"        
        isOpen={showAccepted}
        onDidDismiss={() => setShowAccepted(false)}
      >
        <IonItem lines="full">Accepted Invites:</IonItem>
        {data.accepted_invites && data.accepted_invites.length > 0 ? data.accepted_invites.map((invitee, i) => {
          return(<IonItem lines="none" key={i}>{invitee}</IonItem>)           
        })
        : <IonItem lines="none">No accepted invites yet</IonItem>}
      </IonPopover>          
      <IonToast 
      isOpen={showToast}
      onDidDismiss={() => setShowToast(false)}
      duration={2000}
      message="Picture uploaded!"
      position="bottom"
      />       
      <IonLoading
        cssClass='loading'
        spinner="bubbles"
        isOpen={pictureUploading}
        onDidDismiss={() => setPictureUploading(false)}
      />      
    </IonItem><br/>
    </>
  )
}

// when party is created and invites are sent, each user invited gets the party id added to their document.
// Each user then checks their document for parties and then if there is a new party id, this is then checked
// against the same id in the parties collection in order to display all the details.
const Home: React.FC = () => {

  // for friend request bit.
  const collectionRef = firebase.firestore().collection("friend_requests"); 
  const [reqs, setReqs] = useState([]); 
  const [partyreqs, setPartyReqs] = useState([]);
  const [upcomingParties, setUpcomingParties] = useState([]);
  const [liveParties, setLiveParties] = useState([]);
  const [newNotifications, setNewNotifications] = useState(false);
  const [editingParty, setEditingParty] = useState(""); // holds data of the party being edited
  var current_user = firebase.auth().currentUser; 

  useEffect(() => {  
    // useeffect hook only runs after first render so it only runs once    
    displayParties()
    checkForRequests()
    // this means display parties only runs once
  },  []); 

  // Checks for friend requests
  collectionRef.doc(current_user.uid)
  .onSnapshot(function(doc) {
    if (doc.exists && doc.data().request_from) {
      for (var i = 0; i < doc.data().request_from.length; i++) {
        var curr_id = doc.data().request_from[i].id
        var alreadyInReq = reqs.some(item => curr_id === item.id);
        if (alreadyInReq) { 
          setNewNotifications(false);
        } else if (newNotifications === false){
          setNewNotifications(true); 
        }
      }; 
    }
  });
 
  // Checks for party invites
 firebase.firestore().collection("users").doc(current_user.uid)
 .onSnapshot(function(doc) {
    if (doc.exists && doc.data().myInvites) {
      for (var j = 0; j < doc.data().myInvites.length; j++) {
        var curr_id = doc.data().myInvites[j].partyid
        var alreadyInInv = partyreqs.some(item => curr_id === item.partyid);
        if (alreadyInInv) { 
          setNewNotifications(false);
        } else if (newNotifications === false) {
          setNewNotifications(true);
        }
      };
    }
  });  

  //This just handles the requests once they have been made.
  //On refresh check current user's 'request from' array inside friend requests and display their profile. Then see
  // accept friend.
  // function doRefresh(event: CustomEvent<RefresherEventDetail>) {
  //   // toggle new parties so displayParties runs and it checks for new parties
  //   checkForRequests();
  //   displayParties();               
  //   setNewNotifications(false);
  //   setTimeout(() => {
  //     event.detail.complete();
  //   }, 2000);
  // }   

  const checkForRequests = () => {  
      setReqs([])
      setPartyReqs([])
      collectionRef.doc(current_user.uid).get().then(function(doc) {
        if (doc.exists && doc.data().request_from) {          
          for (var i = 0; i < doc.data().request_from.length; i++) {
            var curr_id = doc.data().request_from[i].id
            setReqs(reqs => [
              ...reqs, 
              {
                id: curr_id, 
                name: curr_id
              }
            ]);            
          };
        }
      }).catch(function(error) {
          console.log("Error getting document:", error);
      });
      firebase.firestore().collection("users").doc(current_user.uid).get().then(function(doc) {  
        if (doc.exists && doc.data().myInvites) {                  
          for (var j = 0; j < doc.data().myInvites.length; j++) {
            var hostid = doc.data().myInvites[j].hostid
            var partyid = doc.data().myInvites[j].partyid
            setPartyReqs(reqs => [
              ...reqs, 
              {
                hostid: hostid, 
                partyid: partyid
              }
            ]);                                          
          };
        }
      }).catch(function(error) {
          console.log("Error getting document:", error);
      });
      setNewNotifications(false);
  }

  const displayParties = () => {       
    firebase.firestore().collection("users")
      .doc(current_user.uid).collection("myParties").get().then(querySnapshot => {
        querySnapshot.forEach(doc => {          
          let data = doc.data();      
          var endTime = moment(data.endTime).add(20, 'hours');
          if (moment().isBefore(data.dateTime)) { 
            setUpcomingParties(upcomingParties => [
              ...upcomingParties,
              {
                id: doc.id,
                data: data,
              }
            ]);            
          } else if
          (moment().isBetween(data.dateTime, endTime)) {
            // if party is live
            setLiveParties(liveParties => [
              ...liveParties,
              {
                id: doc.id,
                data: data,
              }
            ]);            
            // remove the party from upcomingParties array if party turns live
            for (var i=0; i < upcomingParties.length; i++) {
              if (upcomingParties[i].id === doc.id) {
                  upcomingParties.splice(i,1);
                  break;
              }   
            }             
          } else if (moment().isAfter(endTime)) {
            for (var j=0; j < liveParties.length; j++) { 
              if (liveParties[j].id === doc.id) {
                  liveParties.splice(j,1);
                  break;
              }   
            }             
          }
          upcomingParties.sort((a, b) => moment(a.data.dateTime).unix() > moment(b.data.dateTime).unix() ? 1:-1);
          liveParties.sort((a, b) => moment(a.data.dateTime).unix() > moment(b.data.dateTime).unix() ? 1:-1);            
        })                    
      }).catch((err) => {
        console.log(err.message)
      });

    firebase.firestore().collection("users")
      .doc(current_user.uid).get().then(doc => {
          let data = doc.data();
          if (data && data.acceptedInvites) {             
            for (var i=0; i < data.acceptedInvites.length; i++) {
              firebase.firestore().collection("users")
                .doc(data.acceptedInvites[i].hostid).collection("myParties").doc(data.acceptedInvites[i].partyid).get().then(partydoc => {
                  var endTime = moment(partydoc.data().endTime).add(20, 'hours');
                  if (moment().isBefore(partydoc.data().dateTime)) { 
                    setUpcomingParties(upcomingParties => [
                      ...upcomingParties,
                      {
                        id: partydoc.id,
                        data: partydoc.data(),
                      }
                    ]);                     
                  } else if 
                  (moment().isBetween(partydoc.data().dateTime, endTime)) {
                    // if party is live
                    setLiveParties(liveParties => [
                      ...liveParties,
                      {
                        id: partydoc.id,
                        data: partydoc.data(),
                      }
                    ]);                     
                    // remove the party from upcomingParties array 
                    for (var i=0; i < upcomingParties.length; i++) {
                      if (upcomingParties[i].id === partydoc.id) {
                          upcomingParties.splice(i,1);
                          break;
                      }   
                    }             
                  } else if (moment().isAfter(endTime)) {
                      for (var j=0; j < liveParties.length; j++) {
                        if (liveParties[j].id === doc.id) {
                            liveParties.splice(j,1);
                            break;
                        }   
                      }             
                    }
                    upcomingParties.sort((a, b) => moment(a.data.dateTime).unix() > moment(b.data.dateTime).unix() ? 1:-1);
                    liveParties.sort((a, b) => moment(a.data.dateTime).unix() > moment(b.data.dateTime).unix() ? 1:-1);             
              })
            }           
          }                           
    });       
  }

  const acceptInvite = () => {
    checkForRequests(); 
    displayParties();    
  }

  const location = useLocation();

  return editingParty !== "" ? 
    (
      <IonPage>
      <CreateParty editingParty={editingParty}/>
      </IonPage>
    )
    :
    (  
      <IonPage>  
      <IonHeader>
      <IonToolbar class="ion-padding">      
        <IonTitle class="ion-padding">
          Upcoming Parties
        </IonTitle>
        <IonButtons class="add-friends-button" slot="end">
          <IonButton href='/users'>
            <IonIcon class="top-icons" slot="icon-only" icon={personAddSharp} />
          </IonButton>       
        </IonButtons>                     
      </IonToolbar>
      </IonHeader>      
      <IonContent fullscreen={true} class="home-content">
        {/* <IonRefresher slot="fixed" onIonRefresh={doRefresh} pullMin={50} pullMax={200}>
          <IonRefresherContent
            pullingIcon={chevronDownCircleOutline}
            refreshingSpinner="circles">
          </IonRefresherContent>
        </IonRefresher>  */}
          {location.pathname === '/home' ? 
          <IonToast
            isOpen={newNotifications}
            cssClass={"refresh-toast"}
            onDidDismiss={() => setNewNotifications(false)}
            position = 'top'
            color="danger"
            buttons={[
              {
                side: 'start',
                text: 'New Notifications',
                handler: () => {
                  checkForRequests();
                }
              }
            ]}
          />     
          : null}         
        {reqs && reqs.map((req, i) =>        
          <FriendRequest id={req.name} click={()=>checkForRequests()} key={i}/>
        )}
        {partyreqs && partyreqs.map((req, j) => 
            (<PartyRequest hostid={req.hostid} partyid={req.partyid} click={()=>acceptInvite()} key={j}/>)
        )}
        { upcomingParties.length > 0 ? null :
          liveParties.length > 0 ? null :
          <div className="ion-text-center"><br/><br/><IonText class="white-text">You have no upcoming parties at the moment. <br/>Organise some parties with friends on the create page!</IonText></div>
        }     
        {liveParties && liveParties.map((party, k) => { 
          return(        
            <Party key={k} id={party.id} data={party.data} live={true} edit={() => setEditingParty(party.data)}/>              
          );                    
        })}
        {upcomingParties && upcomingParties.map((party, l) => {
          return( 
            <Party key={l} id={party.id} data={party.data} live={false} edit={() => setEditingParty(party.data)}/>
          );                
        })}  
      </IonContent>         
      </IonPage>
      )
  }

const Create: React.FC = () => {
  
  return(
    <IonPage>
    <CreateParty editingParty={null} />  
    </IonPage>
  )
}

const FriendRequest = ({id, click}) => {
  // notification item
  const [userName, setUserName] = useState(''); // name of person who requested
  const [fullName, setFullName] = useState(''); // name of person who requested
  const [currentUser, setCurrentUser] = useState(''); // name of current user

  useEffect(() => {
    var user = firebase.auth().currentUser.uid
    firebase.firestore().collection("users").doc(user).get().then(doc => {
      setCurrentUser(doc.data().username) // set name of person who requested 
    })
  }, [])  

  const userRef = firebase.firestore().collection("users").doc(id); // get document of person who requested
  userRef.get().then(function(doc) {
    if (doc.exists) { 
      setUserName(doc.data().username) // set names to the names in that document
      setFullName(doc.data().fullname) 
    } 
  }).catch(function(error) {
    console.log(error);
  });

  // todo - change this to appear in users.
  //if accept is clicked, inside friends collection, create doc with current user's id and add that friend's id
  //to array. If that works, inside friends collection inside the friend's document, add the current user's id.
  // If this is successful then remove eachother from requests.
  const acceptFriend = (friendsID) => {    
    const collectionRef = firebase.firestore().collection("friends"); 
    var friend_user_id = friendsID
    var current_user_id = firebase.auth().currentUser.uid
    //console.log(receiver_user_id)
    //create doc with users's id if it doesn't already exist and adds friend's id to field.
    collectionRef.doc(current_user_id).get()
      .then((docSnapshot) => {
        //if the doc exists...
        if (docSnapshot.exists) {
          collectionRef.doc(current_user_id).onSnapshot((doc) => {
            collectionRef.doc(current_user_id).update({
              //...add friend's UID to array inside current users doc
              friends: firebase.firestore.FieldValue.arrayUnion({id: friend_user_id, name: userName})
            })      
          });
        } else {
          // if array doesn't exist, create the array
          collectionRef.doc(current_user_id).set({
            id: current_user_id,
            friends: [{id: friend_user_id, name: userName}]
          }) // create the document
        }
    })
        //console.log("Document written with ID: ", docRef.id);
        //if successful, create doc w friend's id and add current user's id to the other person's friends array
      .then(function(docRef) {
      collectionRef.doc(friend_user_id).get()
        .then((docSnapshot) => {
          if (docSnapshot.exists) {
            collectionRef.doc(friend_user_id).onSnapshot((doc) => {
              collectionRef.doc(friend_user_id).update({
                friends: firebase.firestore.FieldValue.arrayUnion({id: current_user_id, name: currentUser})
              })      
            });
          } else {
            collectionRef.doc(friend_user_id).set({
              id: friend_user_id, 
              friends: [{id: current_user_id, name: currentUser}]
            }) // create the document
          }
      })        
          //if successful
          .then(function(docRef) {
            //HERE IS WHERE YOU SHOULD REMOVE REQUEST from friends_requests collection
            firebase.firestore().collection("friend_requests").doc(friend_user_id).update({
              request_to: firebase.firestore.FieldValue.arrayRemove({id: current_user_id, name: currentUser})
            })
                // if requests_to item is removed successfully... then remove item from request_from array
                .then(function(docRef) {
                firebase.firestore().collection("friend_requests").doc(current_user_id).update({
                  request_from: firebase.firestore.FieldValue.arrayRemove({id: friend_user_id, name: userName})                
                  //removes text display 
                }).then(() => click());                          
                }).catch(function(error) {
                console.error("Error deleting id from requests_from: ", error);
                }); 
          })
          //if unsuccessful
          .catch(function(error) {
            console.error("Error adding document: ", error);
        }); 
      })
    //if unsuccessful
    .catch(function(error) {
        console.error("Error adding document: ", error);
    });
  }

  const declineFriend = (friendsID) => {
    const collectionRef = firebase.firestore().collection("friend_requests"); 
    var friend_user_id = friendsID
    var current_user_id = firebase.auth().currentUser.uid
    //REMOVE REQUEST from friends_requests collection
    collectionRef.doc(friend_user_id).update({
      request_to: firebase.firestore.FieldValue.arrayRemove({id: current_user_id, name: currentUser})
    })
      // if requests_to item is removed successfully... then remove item from request_from array
      .then(function(docRef) {
      collectionRef.doc(current_user_id).update({
        request_from: firebase.firestore.FieldValue.arrayRemove({id: friend_user_id, name: userName})                
        //removes text display 
      }).then(() => click());                          
      }).catch(function(error) {
        console.error("Error deleting id from requests_from: ", error);
      });
  }


  return(
    <IonCard class="friend-request-card">
      <IonCardHeader>
        <IonCardTitle>
          <IonText>{userName} ({fullName}) wants to be friends</IonText>
        </IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
      <IonButton onClick={() => acceptFriend(id)}>
        <IonIcon size="large" icon={thumbsUpOutline} />
      </IonButton>
      <IonButton onClick={() => declineFriend(id)}>
        <IonIcon size="large" icon={thumbsDownOutline} />
      </IonButton>        
      </IonCardContent>                        
    </IonCard>    
  )
}

const PartyRequest = ({hostid, partyid, click}) => {
  // notification item
  const [userName, setUserName] = useState(''); // name of person who requested
  const [date, setDate] = useState(''); // date of party you've been invited to
  const [time, setTime] = useState(''); // time of party you've been invited to
  const [endTime, setEndTime] = useState(''); // time of party you've been invited to

  useEffect(() => {
    firebase.firestore().collection("users").doc(hostid).get().then(doc => {
      setUserName(doc.data().username) // set name of person who requested 
    })
  }, [])

  // get party document of the person who requested
  const userRef = firebase.firestore().collection("users").doc(hostid); 
  userRef.collection("myParties").doc(partyid).get().then(function(doc) {
    if (doc.exists) { 
      var date = moment(doc.data().date).format('LL')
      setDate(date)
      var end = moment(doc.data().endTime).format('LT')
      setEndTime(end)
      var time = moment(doc.data().dateTime).format('LT')
      setTime(time)
    } 
  }).catch(function(error) {
    console.log(error);
  });

  // todo - change this to appear in users.
  //if accept is clicked, inside friends collection, create doc with current user's id and add that friend's id
  //to array. If that works, inside friends collection inside the friend's document, add the current user's id.
  // If this is successful then remove eachother from requests.
  const acceptInvite = async() => {
    var current_user_id = firebase.auth().currentUser.uid
    var current_username = firebase.auth().currentUser.displayName
    // remove party from myinvites so the notification disappears, add to accepted invites
    firebase.firestore().collection("users").doc(current_user_id).update({
        myInvites: firebase.firestore.FieldValue.arrayRemove({hostid, partyid}),
        acceptedInvites: firebase.firestore.FieldValue.arrayUnion({hostid: hostid, partyid: partyid}),        
    }).then(() => {
      // add current user's name to party doc accepted_invites section
      firebase.firestore().collection("users").doc(hostid).collection("myParties").doc(partyid).update({
        accepted_invites: firebase.firestore.FieldValue.arrayUnion(current_username)
      }).then(() => click());
    })
   
  }

  const declineInvite = async() => {
    var current_user_id = firebase.auth().currentUser.uid
    // remove party from myinvites so the notification disappears, add to declined invites
    firebase.firestore().collection("users").doc(current_user_id).update({
        myInvites: firebase.firestore.FieldValue.arrayRemove({hostid, partyid}),
        declinedInvites: firebase.firestore.FieldValue.arrayUnion({hostid: hostid, partyid: partyid}),
      }).then(() => click());
  }

  return(
    <IonCard class="invite-card">
      <IonCardHeader>
        <IonCardTitle>
          <IonText>{userName} has invited you to a party!</IonText>
        </IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonText class="white-text">Starts at {time} on {date}</IonText><br/>        
        <IonText class="white-text">Ends at {endTime}</IonText><br/>        
        <IonButton color="danger" onClick={() => acceptInvite()}>Accept</IonButton>
        <IonButton color="danger" onClick={() => declineInvite()}>Decline</IonButton>        
      </IonCardContent>                        
    </IonCard>
  )
}

const MyParties: React.FC = () => {

  return(
    <IonPage>
      <MyPartyList />
    </IonPage>
  )
}

const SignedInRoutes: React.FC = () => {
  const [homeNotifications, setHomeNotifications] = useState(false);
  const [mpNotifications, setMPNotifications] = useState(false);
  var user = firebase.auth().currentUser

  firebase.firestore().collection("users").doc(user.uid).onSnapshot(doc => {
    var data = doc.data();
    var partyNotifs = data.partyNotifications ? data.partyNotifications : false; // false if it doesn't exist
    var friendNotifs = data.friendNotifications ? data.friendNotifications : false; // false if it doesn't exist
    var mpNotifs = data.myPartiesNotifications ? data.myPartiesNotifications : false; // false if it doesn't exist
    if (partyNotifs === false && friendNotifs === false) {
      setHomeNotifications(false);
    } else if (partyNotifs === true || friendNotifs === true) {
      setHomeNotifications(true);
    }
    if (mpNotifs === true) {
      setMPNotifications(true);
    } else {
      setMPNotifications(false);
    }
  })

  return(  
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>    
          <Route path='/signin' component={SignIn} />
          <Route path='/signup' component={SignUp} />
          <Route path='/forgotpassword' component={ForgotPassword} />
          <Route path='/welcomepage' component={WelcomePage} />  
          <Route path='/create' component={Create} />
          <Route path='/users' component={Users} />
          <Route path='/gallery' component={Gallery} />
          <Route exact path='/myparties' component={MyParties} />      
          <Route exact path='/home' component={Home} />      
          <Route exact path={["/signin", "/signup", "/forgotpassword", "/welcomepage", "/"]} render={() => <Redirect to="/home" />} /> 
        </IonRouterOutlet> 
        
        <IonTabBar slot="bottom" id="appTabBar">
          <IonTabButton tab="home" href="/home">
            <IonIcon class="side-icons" src={homeNotifications ? "assets/icon/HOME_NOTIF.svg" : "assets/icon/HOME.svg"} />
            Home
          </IonTabButton>
          <IonTabButton tab="create" href="/create">
            <IonIcon class="mid-icon" src="assets/icon/Create.svg" />
            Create
          </IonTabButton>              
          <IonTabButton tab="myparties" href="/myparties">
            <IonIcon class="side-icons" src={mpNotifications ? "assets/icon/MY_PARTIES_NOTIF.svg" : "assets/icon/MY_PARTIES.svg"} />
            MyParties
          </IonTabButton>                         
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>  
  )
}

const App: React.FC = () => {
  // Triggers when the auth state change for instance when the user signs-in or signs-out.
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(Boolean);

  useEffect(() => {
    console.log("app useeffect")
    setLoading(true);
    firebase.auth().onAuthStateChanged(function(user) {   
      if (user && user.emailVerified && user.displayName !== null) { // if new user logs in, is email verified and has a document        
        setSignedIn(true);
        registerNotifications(user.uid);                 
        window.localStorage.clear();    
        setLoading(false);
      } else {
        setSignedIn(false);
        setLoading(false);
      }
    })    
  }, [])   

  const registerNotifications = async(userid) => {
    // Request permission to use push notifications
    // iOS will prompt user and return if they granted permission or not
    // Android will just grant without prompting
    PushNotifications.requestPermissions().then(result => {
      if (result.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register();
      } else {
        // Show some error
      }
    });

    PushNotifications.addListener(
      'registration',
      (token) => {
        return firebase.firestore().collection("users").doc(userid).update({
          deviceToken: token.value
        })            
      },
    );

    PushNotifications.addListener('registrationError', (error: any) => {
      console.log('Error on registration: ' + JSON.stringify(error));
    });

    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('Push received: ' + JSON.stringify(notification));
      },
    );

    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification) => {
        console.log('Push action performed: ' + JSON.stringify(notification));
      },
    );
  }

  if (loading) {
    return(
      <IonApp>
        <IonLoading 
        cssClass="loading"
        spinner="bubbles"
        isOpen={loading} 
        onDidDismiss={() => setLoading(false)} />  
      </IonApp> 
    )
  } else {
    return( 
    <IonApp>
      <Online> {/*only render when online*/}
      { signedIn === false ? (   
        <IonReactRouter>
          <IonRouterOutlet>
            <Route path='/signin' component={SignIn} />
            <Route path='/signup' component={SignUp} />
            <Route path='/forgotpassword' component={ForgotPassword} />
            <Route path='/welcomepage' component={WelcomePage} />            
            <Route exact path={["/", "/myparties"]} render={() => <Redirect to="/welcomepage" />} />
          </IonRouterOutlet>    
        </IonReactRouter>                             
      ) : (       
        <SignedInRoutes />
      )}
      </Online>
      <Offline>
        <IonPage>
          <IonContent>
          <IonTitle class="ion-text-center">
            <div className="ion-text-wrap">
              Oops! Connection error, try to reconnect before using Motive.
            </div>
          </IonTitle>
          </IonContent>
        </IonPage>
      </Offline>      
    </IonApp>
  )
  }
};

export default App;