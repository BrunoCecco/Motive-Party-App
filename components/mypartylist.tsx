import React, {useState, useEffect } from 'react';
import {
  IonText,
  IonPopover,
  IonList,
  IonInput,
  IonMenu,
  IonHeader,
  IonRouterOutlet,
  IonItem,
  IonRefresher,
  IonRefresherContent,
  IonToolbar,
  IonTitle,
  IonRadioGroup,
  IonRadio,
  IonContent,
  IonIcon,
  IonButtons,
  IonButton,
  IonRow,
  IonGrid,
  IonCol,
  IonMenuButton,
  IonToast
} from '@ionic/react';
import firebase from '../firestore';
import moment from 'moment';

import Gallery from './gallery';
import Memory from './memory';

import { 
  chevronBackSharp,
  settingsSharp,
  peopleOutline,
  chevronDownCircleOutline
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

const MyPartyList = () => {

  //const slides = useRef(null);
  const [yourParties, setYourParties] = useState([]);  
  const [attendedParties, setAttendedParties] = useState([]);  
  const [selected, setSelected] = useState('attended');
  const [partyID, setPartyID] = useState<string>('');
  const [hostID, setHostID] = useState<string>('');
  const [inGallery, setInGallery] = useState(false);
  const [friend_no, setFriend_no] = useState<number>();

  const [showFriends, setShowFriends] = useState(false);
  const [usernamePopover, setUsernamePopover] = useState(false); //popover to change username
  const [signOutPopover, setSignOutPopover] = useState(false); //popover to sign out
  const [newUsername, setNewUsername] = useState('');
  const [namePopover, setNamePopover] = useState(false);
  const [newName, setNewName] = useState('');
  const [passwordPopover, setPasswordPopover] = useState(false); //popover to change password
  const [deleteAccPopover, setDeleteAccPopover] = useState(false); 
  const [oldPassword, setOldPassword] = useState(''); //popover to change username
  const [newPassword, setNewPassword] = useState(''); //popover to change username
  const [verifyNewPassword, setVerifyNewPassword] = useState(''); //popover to change username
  const [passwordError, setPasswordError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [nameError, setNameError] = useState('');
  const [nameUpdated, setNameUpdated] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);

  const [friends, setFriends] = useState([]);
  const [refresh, setRefresh] = useState(false);  
  var user = firebase.auth().currentUser;
  var currentuser = firebase.auth().currentUser.uid;
  const [fullname, setFullname] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {  
    // const script = document.createElement("script");
    // script.src = "https://sdk.snapkit.com/js/v1/login.js"; //Try change this url
    // //script.async = true;
    // //script.onload = () => scriptLoaded();
    // document.body.appendChild(script); 
    async function getUserDoc() {
      await firebase.firestore().collection("users").doc(user.uid).get().then(doc => {
        let data = doc.data()
        if (data.partiesWithNotifications) {
          if (data.partiesWithNotifications.length === 0) {
            firebase.firestore().collection("users").doc(user.uid).update({
              myPartiesNotifications: false
            }).catch(err => {
              console.log(err.message)
            });
          }
        }
        setFullname(data.fullname);
        setUsername(data.username);
        var pwn = data.partiesWithNotifications ? data.partiesWithNotifications : [];
        displayParties(pwn); 
        findFriends();
        //finds the number of friends you have.
        firebase.firestore().collection("friends")
        .doc(currentuser).get().then(function(doc) {
            if (doc.exists) {
              setFriend_no(doc.data().friends.length);
            }
          })           
      })      
    } 

    getUserDoc();
    // useeffect hook only runs after first render so it only runs once          
    // useeffect makes display parties only runs once
  }, [refresh, inGallery]); 

  // const displayNewBitmo = () => {
  //   // When local storage changes, dump the list to
  //   // the console.
  //   //console.log("Change in storage");
  //   //console.log("Snap name: " + window.localStorage.getItem("snap_fullname"))
  //   if (window.localStorage.getItem("snap_fullname") !== null) {
  //     var fullname = window.localStorage.getItem("snap_fullname");
  //     var bitmoji = window.localStorage.getItem("bitmoji_avatar");
  //     firebase.firestore().collection("users").doc(currentuser).update({
  //       fullname: fullname,
  //       bitmoji: bitmoji
  //    // }).then(() => {
  //     //  setContinuedWithSnap(true);
  //     }).catch(err => {
  //       console.log(err.message)
  //     })
  //   }
  // };   

  const friendsCollection = firebase.firestore().collection('friends');
  const usersCollection = firebase.firestore().collection('users');
  var tempFriends = []; // list for friend id's

  function doRefresh(event) {
    // toggle new parties so displayParties runs and it checks for new parties    
    setRefresh(!refresh);         
    setTimeout(() => {
      event.detail.complete();
    }, 2000);
  }     

  const findFriends = () => {
      // loop through friends list in the document of current user in friends collection    
      // and add all the id's into tempFriends
      friendsCollection.doc(user.uid).get().then(doc => {
        if (doc.exists) {
          let data = doc.data().friends && doc.data().friends;
          data && data.map(friend => {
              tempFriends.push(friend)
          })
          // loop through tempFriends and get all user documents of those id's, and add to friends array
          tempFriends && tempFriends.map(friend => {
              usersCollection.doc(friend.id).get().then(doc => {
                  let data = doc.data();
                  var alreadyInFriends = friends.some(item => data.id === item.id);
                  data && !alreadyInFriends && setFriends(friends => [
                      ...friends, 
                      {
                          username: data.username,
                          fullname: data.fullname,
                          // bitmoji: data.bitmoji,
                          id: doc.id
                      }
                  ]);  
              });
          })  
        }              
      })
  }

  // Signs out of Party app.
  const signOut = async() => {
    // Sign out of Firebase.
    window.localStorage.clear();    
    firebase.auth().signOut();
  }

  const updateUsername = async() => {    
    firebase.firestore().collection("users").where("username", "==", newUsername).get().then(snap => {
      if (snap.empty) { // if no duplicate username
        setUsernameError("");
        user = firebase.auth().currentUser
        user.updateProfile({
          displayName: newUsername
        });
        firebase.firestore().collection('users').doc(user.uid).update({
          username: newUsername,  
        }).then(() => {
          //setHits([]);
          setUsernameError('');
          setUsernamePopover(false);
          setNewUsername('');
          setNameUpdated(true);
        })                 
      } else {
        setUsernameError("This username is already in use, try another one")        
      }
    })       
  }

  const updateName = async() => {    
      if (newName.trim().length > 0) { // if new name is entered
        setNameError("");
        user = firebase.auth().currentUser
        firebase.firestore().collection('users').doc(user.uid).update({
          fullname: newName,  
        }).then(() => {
          //setHits([]);
          setNameError('');
          setNamePopover(false);
          setNewName('');
          setNameUpdated(true);
        })                 
      } else {
        setNameError("Please enter a name")        
      }     
  }

  const updatePassword = () => {
    setPasswordError('');
    user = firebase.auth().currentUser
    const credential = firebase.auth.EmailAuthProvider.credential(
      user.email, 
      oldPassword
    );            
    if (newPassword !== verifyNewPassword) {
      setPasswordError("passwords don't match");
    } else {        
      // Now you can use that to reauthenticate
      user.reauthenticateWithCredential(credential).then(function() {
        user.updatePassword(newPassword).then(function() {
          setPasswordPopover(false);
          setPasswordUpdated(true);
          setOldPassword('');
          setNewPassword('');
          setVerifyNewPassword('');
        }).catch(function(error) {
          setPasswordError(error.message);
        });        
      }).catch(function(error) {
        setPasswordError(error.message);
      });    
    } 
  } 

  const deleteAccount = () => {
    var user = firebase.auth().currentUser;
    const credential = firebase.auth.EmailAuthProvider.credential(
      user.email, 
      oldPassword
    ); 
    // Now reauthenticate user then delete from firebase auth
    user.reauthenticateWithCredential(credential).then(function() {
      user.delete();
      setOldPassword('');
      setPasswordError('');
      // now it should redirect to welcome page as authstate changes in app.tsx
    }).catch(error => {
      setPasswordError(error.message)
    })
  }  

  // if memory card clicked, go to gallery
  const enter = (partyid, hostid) => {
    // when user clicks on a party card, set my party notifications to false
    firebase.firestore().collection("users").doc(user.uid).get().then(doc => {
      if (doc.data().partiesWithNotifications) {
        if (doc.data().partiesWithNotifications.some(item => partyid === item)) {          
          // user has clicked on a party with a notification so dismiss the notification
          firebase.firestore().collection("users").doc(user.uid).update({
            partiesWithNotifications: firebase.firestore.FieldValue.arrayRemove(partyid)
          }).catch(err => {
            console.log(err.message)
          });
        }
      }
    }).catch(err => {
      console.log(err.message)
    })
    setPartyID(partyid);
    setHostID(hostid);    
    setInGallery(true);
  }  

 const displayParties = (pwn) => {          
    // get your parties
    firebase.firestore().collection("users")
      .doc(currentuser).collection("myParties").get().then(querySnapshot => {        
        querySnapshot.forEach(doc => {
          let data = doc.data();         
          var hasNotifications = pwn.some(item => doc.id === item);
          var alreadyInYP = yourParties.some(item => doc.id === item.id)
          if (moment().isAfter(data.dateTime)) { 
            if (!alreadyInYP) {
              setYourParties(yourParties => [
                ...yourParties,
                {
                  id: doc.id,
                  data: doc.data(),
                  notifications: hasNotifications
                }
              ]); 
            }            
          } 
        })
        yourParties.sort((a, b) => moment(a.data.dateTime).unix() < moment(b.data.dateTime).unix() ? 1:-1);
        yourParties.map(y=>{console.log(moment(y.data.dateTime).unix(), y.data.dateTime)})
      })

    // get attended parties
    firebase.firestore().collection("users")
      .doc(currentuser).get().then(doc => {          
          let data = doc.data();
          if (data.acceptedInvites) {
            for (var i=0; i < data.acceptedInvites.length; i++) {
              firebase.firestore().collection("users")
                .doc(data.acceptedInvites[i].hostid).collection("myParties").doc(data.acceptedInvites[i].partyid).get().then(partydoc => {
                  var hasNotifications = pwn.some(item => partydoc.id === item);
                  var alreadyInAP = attendedParties.some(item => partydoc.id === item.id)
                  if (moment().isAfter(partydoc.data().dateTime)) {
                    if (!alreadyInAP) {
                      setAttendedParties(attendedParties => [
                        ...attendedParties,
                        {
                          id: partydoc.id,
                          data: partydoc.data(),
                          notifications: hasNotifications
                        }
                      ]);    
                    }                  
                    // if party is live          
                  }
              })
            }                   
            attendedParties.sort((a, b) => moment(a.data.dateTime).unix() > moment(b.data.dateTime).unix() ? 1:-1);
          }
    });      
  }  

  // const handleSlideChange = async() => {
  //   //const swiper = await slißdes.current.getSwiper();
  //   if (swiper.activeIndex === 0) {
  //     setSelected("attended")
  //   } else {
  //     setSelected("hosted")
  //   }
  // }

  const changeSlide = async(direction) => {
    if (direction === "next") {
      setSelected("attended")
    } else {
      setSelected("hosted")
    }
    // const swiper = await slides.current.getSwiper();
    // if (direction === "next") {
    //   swiper.slideNext()
    // } else if (direction === "prev") {
    //   swiper.slidePrev()
    // }
  }

  // const CheckSnapInfo = () => {
  //   console.log("Snap Name: " + window.localStorage.getItem("snap_fullname"))
  //   console.log("Bitmo: " + window.localStorage.getItem("bitmoji_avatar"))
  // }

  // const { Camera } = Plugins;
  // const updatePhoto = async() => {
  //   const cameraPhoto = await Camera.getPhoto({
  //     resultType: CameraResultType.Uri,
  //     source: CameraSource.Prompt,
  //     quality: 100,
  //     allowEditing: true
  //   });
  //   var photo = cameraPhoto.webPath;
  //   setProfilePhoto(photo);        
  // }

  // const saveNewPhoto = async() => {
  //   firebase.storage().ref('users/' + currentuser + '/profile.jpg').putString(profilePhoto).then(function() {
  //     setShowPhotoSaved(true)
  //     setProfilePhoto(profilePhoto);
  //   }).catch(function(error) {
  //     console.log(error.message)
  //   });  
  //   await user.updateProfile({
  //     photoURL: profilePhoto
  //   }).then(function() {
  //     console.log("photo saved to auth profile")
  //   }).catch(function(error) {
  //     console.log(error.message)
  //   });  
  // }

  // const deletePhoto = async() => {
  //   firebase.storage().ref('users/' + currentuser + '/profile.jpg').delete().then(() => {
  //     setShowPhotoDeleted(true);
  //   })
  //   await user.updateProfile({
  //     photoURL: ''
  //   }).then(function() {
  //   }).catch(function(error) {
  //     console.log(error.message)
  //   });     
  // }

  const exitGallery = () => {
    setInGallery(false)    
    setSelected("attended")
  }

  if (inGallery) {
    return(
        <>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton color="warning" fill="clear" onClick={() => exitGallery()}>
              <IonIcon icon={chevronBackSharp} />
            </IonButton>
          </IonButtons>
          <IonTitle class="ion-padding">
            My Parties
          </IonTitle>        
        </IonToolbar>
        <Gallery hostid={hostID} partyid={partyID} key={partyID}/>
        </>
      )
  } else {
    return(
        <>
        <IonMenu swipeGesture={true} side="end" type="overlay" contentId="myPartiesPage">
          <IonToolbar>
            <IonTitle class="ion-padding">Settings</IonTitle>
          </IonToolbar>
          <IonContent>
            <IonList class="list">      
              <IonButton onClick={() => setNamePopover(true)}>
                Change name              
              </IonButton> <br/>
              <IonButton onClick={() => setUsernamePopover(true)}>
                Change username              
              </IonButton> <br/>
              <IonButton onClick={() => setPasswordPopover(true)}>
                Change password              
              </IonButton><br/>
              <IonButton onClick={() => setSignOutPopover(true)}>
                Sign out              
              </IonButton> <br/>              
              <IonButton onClick={() => setDeleteAccPopover(true)}>
                Delete Account             
              </IonButton><br/>                
            </IonList>
          </IonContent>
        </IonMenu>
        <IonRouterOutlet></IonRouterOutlet>

        <div id="myPartiesPage">
        <IonHeader>
          <IonToolbar class="myparties-title ion-padding">
            <IonTitle class="ion-padding">My Parties</IonTitle>
          </IonToolbar>
          <IonToolbar class="myparties-toolbar">
          <IonItem class="accordion-profile" lines="none">
            <IonGrid>
              <IonRow class="ion-align-items-center">
                <IonCol size="3">
                  <span onClick={()=>setShowFriends(true)}><IonIcon className="profile-icon" icon={peopleOutline}/></span>
                </IonCol> 
                <IonCol size="6"> 
                  <IonText>{fullname}</IonText><br/>
                  <IonText class="white-text">{username}</IonText>
                </IonCol>      
                <IonCol size="3">
                  <IonMenuButton class="top-icons">
                    <IonIcon icon={settingsSharp}></IonIcon>
                  </IonMenuButton>                
                </IonCol>
              </IonRow>      
            </IonGrid> 
          </IonItem>
          <IonRadioGroup value={selected} onIonChange={e => setSelected(e.detail.value)}>
          <IonRow>
            <IonCol size="6">
              <IonItem class="radio-buttons" lines="none">
                <IonText>Attended</IonText>
                <IonRadio onIonFocus={(e) => changeSlide("prev")} slot="end" value="attended" />
              </IonItem>
            </IonCol>
            <IonCol size="6">
              <IonItem class="radio-buttons" lines="none">
                <IonText>Hosted</IonText>
                <IonRadio onIonFocus={e => changeSlide("next")} slot="end" value="hosted" />
              </IonItem>
            </IonCol>
          </IonRow>
          </IonRadioGroup>  
        </IonToolbar>
        </IonHeader>
          <IonContent fullscreen={true} class="myparties-content">
          <IonRefresher slot="fixed" onIonRefresh={doRefresh} pullMin={50} pullMax={200}>
              <IonRefresherContent
                pullingIcon={chevronDownCircleOutline}
                refreshingSpinner="circles">
              </IonRefresherContent>
            </IonRefresher>               
          <div className="myparties-inner-content">                  
            {selected === "attended" ? 
            attendedParties.length === 0 ?
            <IonText class="white-text">You haven't attended any parties yet..</IonText> :          
            attendedParties.map((party, i) => {
              return(
                <Memory notifications={party.notifications} data={party.data} key={i} click={() => enter(party.id, party.data.hostid)}/>
              )          
            }) : null}   
            {selected === "hosted" ?
            yourParties.length === 0 ?
            <IonText class="white-text">You haven't hosted any parties yet..</IonText> : 
            yourParties.map((party, j) => {
              return(              
                <Memory notifications={party.notifications} data={party.data} key={j} click={() => enter(party.id, party.data.hostid)}/>
              )          
            }) : null} 
            </div>
            </IonContent>       
        <IonPopover
          id="popover"
          cssClass="popover"        
          isOpen={usernamePopover}
          onDidDismiss={() => setUsernamePopover(false)}
        >
          <IonInput 
          class="create-input" 
          value={newUsername} 
          onIonChange={e => setNewUsername(e.detail.value!)} 
          placeholder="New Username" clearInput>            
          </IonInput>
          <IonText>{usernameError}</IonText><br/>
          <IonButton onClick={() => setUsernamePopover(false)}>Cancel</IonButton>
          <IonButton onClick={() => updateUsername()}>Done</IonButton>                         
        </IonPopover>

        <IonPopover
          id="popover"
          cssClass="popover"        
          isOpen={namePopover}
          onDidDismiss={() => setNamePopover(false)}
        >
          <IonInput 
          class="create-input" 
          value={newName} 
          onIonChange={e => setNewName(e.detail.value!)} 
          placeholder="New Name" clearInput>            
          </IonInput>
          <IonText>{nameError}</IonText><br/>
          <IonButton onClick={() => setNamePopover(false)}>Cancel</IonButton>
          <IonButton onClick={() => updateName()}>Done</IonButton>             
        </IonPopover>

        <IonPopover
          id="popover"
          cssClass="popover"        
          isOpen={signOutPopover}
          onDidDismiss={() => setSignOutPopover(false)}
        >
          <IonText>Are you sure you want to sign out of your account?</IonText><br/>
          <IonButton href="/welcomepage" onClick={() => signOut()}>Yes</IonButton>  
          <IonButton onClick={() => setSignOutPopover(false)}>No</IonButton>               
        </IonPopover>    

        <IonToast 
        isOpen={passwordUpdated}
        onDidDismiss={() => setPasswordUpdated(false)}
        duration={2000}
        message="Password updated!"
        position="bottom"
        />               
        {/* <IonPopover
          id="popover"
          cssClass="popover"        
          isOpen={photoPopover}
          onDidDismiss={() => setPhotoPopover(false)}
        >
        <IonButton onClick={() => updatePhoto()}>New Profile Photo</IonButton>        
        {profilePhoto ? <IonImg src={profilePhoto}></IonImg> : null}   
        {profilePhoto ? <IonButton class="custom-button" onClick={()=>saveNewPhoto()}>Save New Photo</IonButton> : null}
        <IonButton onClick={() => deletePhoto()}>Delete Profile Photo</IonButton>                     
        </IonPopover>         */}
        <IonPopover
          id="popover"
          cssClass="popover"        
          isOpen={passwordPopover}
          onDidDismiss={() => setPasswordPopover(false)}
        >
          <IonInput 
          class="create-input" 
          value={oldPassword} 
          onIonChange={e => setOldPassword(e.detail.value!)} 
          placeholder="Old Password" clearInput>            
          </IonInput><br/>
          <IonInput 
          class="create-input" 
          value={newPassword} 
          onIonChange={e => setNewPassword(e.detail.value!)} 
          placeholder="New Password" clearInput>            
          </IonInput><br/>
          <IonInput 
          class="create-input" 
          value={verifyNewPassword} 
          onIonChange={e => setVerifyNewPassword(e.detail.value!)} 
          placeholder="Re-enter New Password" clearInput>            
          </IonInput><br/>              
          <IonText>{passwordError}</IonText><br/>            
          <IonButton onClick={() => setPasswordPopover(false)}>Cancel</IonButton>   
          <IonButton onClick={() => updatePassword()}>Done</IonButton>             
        </IonPopover>    
        <IonPopover
          id="popover"
          cssClass="popover"        
          isOpen={deleteAccPopover}
          onDidDismiss={() => setDeleteAccPopover(false)}
        >
          <IonText className="ion-padding">Delete Account?</IonText><br/>
          <IonText class="white-text">You won't be able to recover this account</IonText><br/>
          <IonInput 
          class="create-input" 
          value={oldPassword} 
          onIonChange={e => setOldPassword(e.detail.value!)} 
          placeholder="Enter password to confirm">            
          </IonInput>    
          <IonText>{passwordError}</IonText><br/>
          <IonButton onClick={()=>setDeleteAccPopover(false)}>
            Cancel
          </IonButton>            
          <IonButton onClick={()=>deleteAccount()}>
            Delete
          </IonButton>   
        </IonPopover>    
        {/* <IonPopover
          id="popover"
          cssClass="popover"        
          isOpen={continuedWithSnap}
          onDidDismiss={() => {displayNewBitmo();setContinuedWithSnap(false);setRefresh(!refresh)}}
        >
          <IonText className="ion-padding">Successfully linked snapchat details!</IonText><br/>
          <IonButton onClick={()=>{displayNewBitmo();setContinuedWithSnap(false);setRefresh(!refresh)}}>
            Ok
          </IonButton>        
        </IonPopover>             */}
        <IonPopover
          id="popover" 
          cssClass="friends-popover"        
          isOpen={showFriends}
          onDidDismiss={() => setShowFriends(false)}        
        >
          {friends.length > 0 ? 
          <IonList class="list">
            <IonItem lines="full">
              <IonText>{friend_no} Friends</IonText>
            </IonItem>
              {friends && friends.map((friend, k) => {
                  return(
                    <IonItem lines="none" key={k}>
                      <IonCol>
                        <IonRow>
                          <IonText>{friend.username}</IonText>   
                        </IonRow>
                        <IonRow>
                          <IonText class="white-text">{friend.fullname}</IonText>   
                        </IonRow>        
                      </IonCol>               
                    </IonItem>
                  )
              })}
          </IonList> 
          :
          <IonItem lines="none">Add some friends to start partying!</IonItem>}
        </IonPopover>
        <IonPopover
          id="popover" 
          cssClass="popover"        
          isOpen={nameUpdated}
          onDidDismiss={() => setRefresh(!refresh)}        
        >
        <IonText>Name updated!</IonText><br/>
        <IonButton href='/myparties'>Ok</IonButton>
        </IonPopover>                   
        </div>    
      </>
    )
  }
}

export default MyPartyList;