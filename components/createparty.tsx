import React, { useState, useEffect} from 'react';
import {
  IonLabel,
  IonFooter,
  IonItem,
  IonButton,
  IonButtons,
  IonHeader, 
  IonContent, 
  IonToolbar, 
  IonCard,
  IonTitle,
  IonSearchbar,
  IonPopover,
  IonInput,
  IonModal, 
  IonDatetime,
  IonTextarea,
  IonToast,
  IonIcon,
  IonText,
  IonCol,
  IonGrid,
  IonRow,
  IonToggle
} from '@ionic/react';
import { 
  chevronBackSharp,  
  addOutline,
  removeOutline,
} from 'ionicons/icons';
import '../App.css';
import firebase from '../firestore';
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
import '../variables.css';
import algoliasearch from 'algoliasearch/lite';

const CreateParty = ({editingParty}) => {

    var currentuser = firebase.auth().currentUser
    const friendsCollection = firebase.firestore().collection('friends'); 
    const usersCollection = firebase.firestore().collection('users');

    const [friends, setFriends] = useState([]); // list of people who can be searched for when inviting people
    const [seeFriends, setSeeFriends] = useState(false); // boolean variable to see friends list or not 
    const [invitedPeople, setInvitedPeople] = useState(editingParty ? editingParty.invited_people : []); // array of invited people
    const [newInvites, setNewInvites] = useState([]); // array of new invited people
    const [title, setTitle] = useState<string>(editingParty ? editingParty.title : "");
    const [address, setAddress] = useState<string>(editingParty ? editingParty.address : "");
    const [postcode, setPostcode] = useState<string>(editingParty ? editingParty.postcode : "");
    const [dresscode, setDresscode] = useState<string>(editingParty ? editingParty.dresscode : "");
    const [details, setDetails] = useState<string>(editingParty ? editingParty.details : "");
    const [endTime, setEndTime] = useState<string>(editingParty ? editingParty.endTime : "");
    const [dateTime, setDateTime] = useState<string>(editingParty ? editingParty.dateTime : ""); 
    const [drinksProvided, setDrinksProvided] = useState(editingParty ? editingParty.drinksProvided : "");
    const [showPeopleSearch, setShowPeopleSearch] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [fieldsMissing, setFieldsMissing] = useState(false);
    const [timeError, setTimeError] = useState(false);
    const [showPopover, setShowPopover] = useState(false);
    const [partyDeletedToast, setPartyDeletedToast] = useState(false);    
    const [refresh, setRefresh] = useState(false);
    const [drinksChecked, setDrinksChecked] = useState(editingParty ? editingParty.drinksProvided !== "" ? true : false : false);
    const [dresscodeChecked, setDresscodeChecked] = useState(editingParty ? editingParty.dresscode !== "" ? true : false : false);
    const [postcodeChecked, setPostcodeChecked] = useState(editingParty ? editingParty.postcode !== "" ? true : false : false);
    const [detailsChecked, setDetailsChecked] = useState(editingParty ? editingParty.details !== "" ? true : false : false);

    const searchClient = algoliasearch('N5BVZA4FRH', '10173d946e2ba5aa9ba4f9ae445cef48');
    const index = searchClient.initIndex('Users');
    const [hits, setHits] = useState([]);
    const [query, setQuery] = useState('');

  useEffect(() => {
    findFriends();
  }, [refresh])
  
  const findFriends = () => {
    var tempFriends = []; // list for friend id's
    // loop through friends list in the document of current user in friends collection    
    // and add all the id's into tempFriends
    friendsCollection.doc(currentuser.uid).get().then(doc => {
      if (doc.exists) {
        let data = doc.data().friends && doc.data().friends;
        data && data.map(friend => {
            tempFriends.push(friend)
        })
        // loop through tempFriends and get all user documents of those id's, and add to friends array
        tempFriends && tempFriends.map(friend => {          
            usersCollection.doc(friend.id).get().then(doc => {
                let data = doc.data();
                var alreadyInFriends = friends.some(item => friend.id === doc.id);
                var inInvitedPeople = invitedPeople.some(item => friend.id === item.id)
                data && !alreadyInFriends && !inInvitedPeople && setFriends(friends => [
                    ...friends, 
                    {
                        username: data.username,
                        fullname: data.fullname,
                        id: doc.id
                    }
                ]);  
            });
        })  
      }              
    })
  }    
    
    async function search(query) {
      const result = await index.search(query); 
      setHits(result.hits);
      setQuery(query)    
    }

    const onSave = () => {  
      // validate inputs  
      const inputsFilled = Boolean((title.trim() !== "") && (address.trim() !== "") && (dateTime.trim() !== "") && (endTime.trim() !== ""));
      const timesValid = Boolean(moment(endTime).isAfter(dateTime));
      const collectionRef = firebase.firestore().collection("users").doc(currentuser.uid).collection("myParties");

      if (inputsFilled === false) {
        setFieldsMissing(true)  
      } else if (timesValid === false) {
        setTimeError(true)
      } else if (inputsFilled === true && timesValid === true) {
          // if editing party, update the document, otheriwse add a new document 
          if (editingParty !== null) {
            collectionRef.doc(editingParty.id).update({
              title: title, 
              address: address,
              postcode: postcode,
              dresscode: dresscode,
              drinksProvided: drinksProvided,
              date: moment(dateTime).format('LL'), 
              day: moment(dateTime).format('D'), 
              month: moment(dateTime).format('MMM'),
              details: details ? details : "",
              endTime: moment(endTime).format('LLL'),
              dateTime: moment(dateTime).format('LLL'),              
              invited_people: invitedPeople,             
              }).then(function() {
                setShowToast(true);
                // if people get invited then add them to list below.
                // A party gets created. A person gets invited, they accept invite.
                // Then they get access to the document that was originally created.
                var host_user_id = currentuser.uid
                newInvites && newInvites.map(newInvite => {
                  var userDocument = firebase.firestore().collection("users").doc(newInvite.id)
                  userDocument.update({
                    // add party id to user documents
                    myInvites: firebase.firestore.FieldValue.arrayUnion({hostid: host_user_id, partyid: editingParty.id}),
                  })
                })
              //clear fields
              setTitle("");
              setAddress("");
              setPostcode("");
              setDetails("");
              setEndTime("");
              setDateTime("");
              setDresscode("");
              setDrinksProvided("");
              setInvitedPeople([]);                               
              })  
            } else {
            // only add documents to collection if forms are validated
              collectionRef.add({
                title: title, 
                address: address,
                postcode: postcode,
                dresscode: dresscode,
                drinksProvided: drinksProvided,
                date: moment(dateTime).format('LL'), 
                day: moment(dateTime).format('D'), 
                month: moment(dateTime).format('MMM'),
                details: details ? details : "",
                endTime: moment(endTime).format('LLL'),
                dateTime: moment(dateTime).format('LLL'),
                hostid: currentuser.uid,
                hostname: currentuser.displayName,
                invited_people: invitedPeople,        
                topicCreated: false, // for FCM     
                createdOn: moment(new Date()).format('LL'), 
                }).then(function(docRef) {                  
                  console.log(docRef.id)
                  setShowToast(true);
                  collectionRef.doc(docRef.id).update({
                    id: docRef.id
                  })
                  // if people get invited then add them to list below.
                  // A party gets created. A person gets invited, they accept invite.
                  // Then they get access to the document that was originally created.
                  var host_user_id = currentuser.uid
                  invitedPeople && invitedPeople.map(person => {
                    firebase.firestore().collection("users").doc(person.id).update({
                      // add party id to user documents
                      myInvites: firebase.firestore.FieldValue.arrayUnion({hostid: host_user_id, partyid: docRef.id}),                      
                    })                
                    .catch(function(error) {
                      console.error("error adding party id to user document", error);
                    })           
                  })   
                  //clear fields
                  setTitle("");
                  setAddress("");
                  setPostcode("");
                  setDetails("");
                  setEndTime("");
                  setDateTime("");
                  setDresscode("");
                  setDrinksProvided("");
                  setInvitedPeople([]);                
              })  
            }     
          }    
        }          
      

    const addInvite = (id, username, fullname) => {
      setQuery(''); // reset searchbar when invite button pressed so invite item with the button stops showing
      if (invitedPeople.some(item => id === item.id) === false) {// if friend isn't already in invitedPeople
        setInvitedPeople(invitedPeople => [
          ...invitedPeople, 
          {              
            username: username,
            fullname: fullname,
            id: id
          }
        ]);
        if (editingParty !== null) {
          setNewInvites(newInvites => [
            ...newInvites,
            {
              username: username,
              fullname: fullname,
              id: id
            }
          ])
        }
      }
      // remove friend from "see friends" section
      for (var i=0; i < friends.length; i++) {
        if (friends[i].id === id) {
            friends.splice(i,1);
            setRefresh(!refresh);
            break;
        }   
      }       
    }

    const removeInvite = (id, username, fullname) => {
      setQuery(''); // reset searchbar when invite button pressed so invite item with the button stops showing
      for (var i=0; i < invitedPeople.length; i++) {
        if (invitedPeople[i].id === id) {
            invitedPeople.splice(i,1);
            setRefresh(!refresh);
            break;
        }   
      }
      if (editingParty !== null) { 
        for (var i=0; i < newInvites.length; i++) {
          if (newInvites[i].id === id) {
              newInvites.splice(i,1);
              setRefresh(!refresh);
              break;
          }   
        }
      }   
      if (friends.some(item => id === item.id) === false) {// if friend isn't already in invitedPeople
        setFriends(friends => [
          ...friends, 
          {
              username: username,
              fullname: fullname,
              id:   id
          }
        ]);          
      }
    }

    const deleteParty = async() => {
      // remove invites for all invited people
      await invitedPeople && invitedPeople.map(person => {
        firebase.firestore().collection("users").doc(person.id).update({         
          myInvites: firebase.firestore.FieldValue.arrayRemove({hostid: currentuser.uid, partyid: editingParty.id}),
          acceptedInvites: firebase.firestore.FieldValue.arrayRemove({hostid: currentuser.uid, partyid: editingParty.id})
        })
      })
      // delete party document from firebase
      firebase.firestore().collection("users")
        .doc(currentuser.uid).collection("myParties").doc(editingParty.id).delete().then(() => {
          setTitle("");
          setAddress("");
          setPostcode("");
          setDetails("");
          setEndTime("");
          setDateTime("");
          setInvitedPeople([]);  
          setShowPopover(false);
          setPartyDeletedToast(true);
        })    
    }

    const startTime = (e) => {
      setDateTime(e.detail.value!)
      console.log(e.detail.value!)
      if (endTime === "") {
        setEndTime(e.detail.value!)
      }
    }

    return(
      <>
      <IonHeader>
      <IonToolbar class="create-toolbar">
        {editingParty ? 
        <IonButtons slot="start">
          <IonButton class="create-back-button" fill="clear" href="/home">
            <IonIcon color="dark" slot="icon-only" icon={chevronBackSharp}></IonIcon>
          </IonButton> 
        </IonButtons> : null}            
        {editingParty ? 
        <IonTitle class="ion-padding" color="dark">Editing</IonTitle> : 
        <IonTitle class="ion-padding" color="dark">Create</IonTitle>
        }  
      </IonToolbar>
      </IonHeader>
      <IonContent class="create-content" fullscreen={true}>
        <IonText class="black-text">You can always invite more people and edit the party details after you create it.</IonText>
        <IonCard class="create-card">
          <IonItem class="rounded-top" lines="none">
            <IonInput class="create-input" value={title} onIonChange={e => setTitle(e.detail.value!)} placeholder="Title" clearInput></IonInput>
          </IonItem>
          <IonItem class="create-card-input" lines="none">   
            <IonInput class="create-input" value={address}  onIonChange={e => setAddress(e.detail.value!)} placeholder="Location" clearInput></IonInput>                               
          </IonItem>
          <IonItem class="create-card-input" lines="none">   
            <IonInput 
            disabled={!postcodeChecked}
            class="create-input" 
            value={postcode}  
            onIonChange={e => setPostcode(e.detail.value!)} 
            placeholder="Postcode/Zipcode" 
            clearInput></IonInput>  
            <IonToggle checked={postcodeChecked} color="warning" onIonChange={e => setPostcodeChecked(e.detail.checked)} />
          </IonItem>
          <IonItem class="create-card-input" lines="none">
            <IonInput 
            disabled={!dresscodeChecked}
            class="create-input" 
            value={dresscode}  
            onIonChange={e => setDresscode(e.detail.value!)} 
            placeholder="Dress Code" 
            clearInput></IonInput>  
            <IonToggle checked={dresscodeChecked} color="warning" onIonChange={e => setDresscodeChecked(e.detail.checked)} />
          </IonItem>
          <IonItem class="create-card-input" lines="none">
            <IonInput 
            disabled={!drinksChecked}
            class="create-input" 
            value={drinksProvided}  
            onIonChange={e => setDrinksProvided(e.detail.value!)} 
            placeholder="Drinks Provided" 
            clearInput></IonInput>  
            <IonToggle checked={drinksChecked} color="warning" onIonChange={e => setDrinksChecked(e.detail.checked)} />
          </IonItem>         
          <IonItem class="create-card-input" lines="none">
            <IonLabel>Starts</IonLabel>
            <IonDatetime 
            class="create-datetime" 
            value={dateTime} 
            onIonChange={e => startTime(e)} 
            displayFormat="DD-MMM HH:mm" 
            placeholder="select"
            minuteValues="0, 15, 30, 45"
            ></IonDatetime>
          </IonItem>
          <IonItem class="create-card-input" lines="none">
            <IonLabel>Ends</IonLabel>
            <IonDatetime 
            class="create-datetime" 
            value={endTime} 
            onIonChange={e => setEndTime(e.detail.value!)} 
            displayFormat="DD-MMM HH:mm" 
            placeholder="select"
            minuteValues="0, 15, 30, 45"
            ></IonDatetime>
          </IonItem>        
          <IonItem class="create-card-input" lines="none">
            <IonTextarea 
            disabled={!detailsChecked}
            maxlength={150} 
            class="create-input" 
            value={details} 
            onIonChange={e => setDetails(e.detail.value!)} 
            placeholder="Additional details"></IonTextarea>
            <IonToggle checked={detailsChecked} color="warning" onIonChange={e => setDetailsChecked(e.detail.checked)} />
          </IonItem>
          <IonItem class="create-card-input" lines="none">
            <IonButton class="create-button" expand="block" onClick={e => setShowPeopleSearch(true)}>Invite People</IonButton>
          </IonItem>       
          {invitedPeople && invitedPeople.map((person, i) => {
            return(
              <IonItem class="create-card-input" lines="none" key={i}>  
              <IonGrid>
                <IonRow>
                  <IonCol>           
                  <IonText>{person.username}</IonText><br/>
                  <IonText className="white-text">{person.fullname}</IonText>
                  </IonCol>
                  <IonCol class="ion-text-end">
                  <IonButton onClick={() => removeInvite(person.id, person.username, person.fullname)}>
                    <IonIcon size="large" icon={removeOutline} />  
                  </IonButton>
                  </IonCol>
                </IonRow>
              </IonGrid>
              </IonItem>
            )
          })}  
          <IonItem class="rounded-bottom" lines="none"> 
            <IonButton 
            class="create-button" 
            expand="block"            
            onClick={() => onSave()}
            >{editingParty ? "Update!" : "Create!"}</IonButton>        
          </IonItem>
          {editingParty ? 
            <IonButton class="delete-button" onClick={() => setShowPopover(true)}>Delete party</IonButton> :
          null}
          </IonCard>
             
      <IonModal cssClass="modal" swipeToClose={true} isOpen={showPeopleSearch}>
        <IonHeader>
          <IonToolbar>  
            <IonSearchbar class="searchbar" onIonChange={e => search(e.detail.value!)} placeholder="Search Friends"></IonSearchbar>                            
          </IonToolbar>
        </IonHeader>
        <IonContent class="create-content">
          {query.trim() !== "" && (/[a-zA-z]//*all letters */).test(query) && hits.map((hit, j) => (
            hit.objectID === currentuser.uid || friends.some(item => hit.objectID === item.id) === false ? null :
            <IonItem class="create-card-input" lines="none" key={j}>   
              <IonGrid>
                <IonRow>
                  <IonCol>           
                  <IonText>{hit.username}</IonText><br/>
                  <IonText className="white-text">{hit.fullname}</IonText>
                  </IonCol>
                  <IonCol class="ion-text-end">
                  <IonButton onClick={() => addInvite(hit.objectID, hit.username, hit.fullname)}>
                    <IonIcon size="large" icon={addOutline} />  
                  </IonButton>
                  </IonCol>
                </IonRow>
              </IonGrid>     
            </IonItem>                  
          ))}<br/>     

          {seeFriends ? 
          <IonButton class="create-button" onClick={()=>setSeeFriends(false)}>
          Hide Friends
          </IonButton>
          :
          <IonButton class="create-button" onClick={()=>setSeeFriends(true)}>
          See Friends
          </IonButton>}

          {seeFriends ? friends.map((friend, k) => ( // show all friends below the searched items
            <IonItem class="create-card-input" lines="none" key={k}>     
              <IonGrid>
                <IonRow>
                  <IonCol>           
                  <IonText>{friend.username}</IonText><br/>
                  <IonText className="white-text">{friend.fullname}</IonText>
                  </IonCol>
                  <IonCol class="ion-text-end">
                  <IonButton onClick={() => addInvite(friend.id, friend.username, friend.fullname)}>
                    <IonIcon size="large" icon={addOutline} />  
                  </IonButton>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonItem>                              
          )) : null}      
          <IonText class="black-text">People invited: </IonText>
          {invitedPeople && invitedPeople.map((person, l) => {
            return(
              <IonItem class="create-card-input" lines="none" key={l}>     
              <IonGrid>
                <IonRow>
                  <IonCol>           
                  <IonText>{person.username}</IonText><br/>
                  <IonText className="white-text">{person.fullname}</IonText>
                  </IonCol>
                  <IonCol class="ion-text-end">
                  <IonButton onClick={() => removeInvite(person.id, person.username, person.fullname)}>
                    <IonIcon size="large" icon={removeOutline} />  
                  </IonButton>
                  </IonCol>
                </IonRow>
              </IonGrid>       
              </IonItem>
            )
          })}<br/>                    
        </IonContent>
        <IonFooter>
          <IonButton class="create-button" onClick={e => setShowPeopleSearch(false)}>Done</IonButton>
        </IonFooter>        
      </IonModal>  

      <IonPopover
        cssClass="popover"        
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
      >
        <div className="ion-text-center">
        <IonButton href="/home">
          Party Created! <br/> Click here to see it
        </IonButton>   
        </div>
      </IonPopover> 
      <IonToast
        isOpen={partyDeletedToast}
        onDidDismiss={() => setPartyDeletedToast(false)}
        duration={2000}
        message="Party Deleted!"
        position="bottom"
      />    
      <IonPopover
        cssClass="popover"        
        isOpen={fieldsMissing}
        onDidDismiss={() => setFieldsMissing(false)}
      >
        <IonText>Please fill in all required input fields</IonText><br/>
        <IonButton onClick={()=>setFieldsMissing(false)}>
          Ok
        </IonButton>   
      </IonPopover>    
      <IonPopover
        cssClass="popover"        
        isOpen={timeError}
        onDidDismiss={() => setTimeError(false)}
      >
        <IonText>Error! - End time must be after start time</IonText><br/>
        <IonButton onClick={()=>setTimeError(false)}>
          Ok
        </IonButton>            
      </IonPopover>       
      <IonPopover
        cssClass="popover"        
        isOpen={showPopover}
        onDidDismiss={() => setShowPopover(false)}
      >
        <IonText>Delete Party?</IonText><br/>
        <IonText class="white-text">You won't be able to recover this party</IonText><br/>
        <IonButton onClick={()=>setShowPopover(false)}>
          Cancel
        </IonButton>            
        <IonButton onClick={()=>deleteParty()}>
          Delete
        </IonButton>   
      </IonPopover>             
      </IonContent>
      </>
    )
  };

export default CreateParty;
