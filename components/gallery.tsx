import React, { useState, useEffect, useRef} from 'react';
import {useCollection} from 'react-firebase-hooks/firestore';
import { useDoubleTap } from 'use-double-tap';
import {
  IonIcon,
  IonCard,
  IonRow,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonCardSubtitle,
  IonButton,
  IonContent,
  IonImg,
  IonList,
  IonCol,
  IonInput,
  IonText,
  IonItem,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonTextarea,
  IonPopover,
  IonActionSheet
} from '@ionic/react';
import {   
  heartOutline,
  heart,
  sendOutline,
  trashSharp,
  ellipsisHorizontal
} from 'ionicons/icons';
import '../App.css'
import firebase from '../firestore'
import moment from 'moment'
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

const Gallery = ({hostid, partyid}) => {
    // party card
    const [host, setHost] = useState('');
    const [date, setDate] = useState('');
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [afterMessage, setAfterMessage] = useState('');
    const [edit, setEdit] = useState(false);

    const [value, loading, error] = useCollection(
      firebase.firestore().collection('users').doc(hostid).collection('myParties').doc(partyid).collection('pictures'),
    );      

    useEffect(() => {
      firebase.firestore().collection("users").doc(hostid).get().then(doc => {
        setHost(doc.data().username)
      })
    }, [])

    const doc = firebase.firestore().collection('users').doc(hostid).collection("myParties").doc(partyid)
    doc.get().then(function(doc) {
      if (doc.exists) {
          setTitle(doc.data().title);
          setDate(moment(doc.data().date).format('l'));
          setAfterMessage(doc.data().afterMessage)
      } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
      }
      }).catch(function(error) {
          console.log("Error getting document:", error);
      });

      const uploadMessage = () => {
        doc.update({
          afterMessage: message
        }).then(function(doc){
          setEdit(false);
        })
      }

    // in the return function, we loop through each picture in the collection
    // and for each document, we create a picture card, 
    // passing through the document and doc.id to the picture function
    return(   
      <IonContent fullscreen={true} class="home-content">
          <IonCard class="gallery-card">
            <IonCardHeader>
              <IonCardTitle>{title}</IonCardTitle><br/>         
              <IonCardSubtitle>Hosted on {date} by {host}</IonCardSubtitle>            
            </IonCardHeader>
            <IonCardContent>
              {firebase.auth().currentUser.uid === hostid && edit ?              
                <IonItem lines="none">
                  <IonTextarea class="create-input" value={message} placeholder="Message" onIonChange={e => setMessage(e.detail.value!)}></IonTextarea>
                  <IonButton onClick={() => uploadMessage()}>Upload</IonButton>
                </IonItem>
             : null
            }         
            {afterMessage ? <IonText>"{afterMessage}"</IonText> : <IonText>"Thanks for coming!"</IonText>}
            {firebase.auth().currentUser.uid === hostid && !edit ?              
              <IonItem lines="none">
                <IonButton onClick={() => setEdit(true)}>Edit</IonButton>
              </IonItem>
             : null
            }                  
            </IonCardContent>
          </IonCard>
          <IonList>
          {value && value.docs.map((doc, i) => {
            return( !loading &&
              <Picture doc={doc} hostid={hostid} partyid={partyid} key={i}/> 
            )
          })} 
          </IonList>        
      </IonContent>
    )
  } 

const Picture = ({doc, hostid, partyid}) => {

  // get pictures collection for the current party 
  const collectionRef = firebase.firestore().collection('users').doc(hostid).collection('myParties').doc(partyid).collection("pictures"); 

  const [liked, setLiked] = useState(Boolean);
  const [numLikes, setNumLikes] = useState(Number); 
  const [ownPicture, setOwnPicture] = useState(Boolean);
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(true);
  const [otherComments, setOtherComments] = useState([]);
  const [displayName, setDisplayName] = useState('');
  const [takenBy, setTakenBy] = useState('');
  const [deletePhotoPopover, setDeletePhotoPopover] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
    
  var currentuser = firebase.auth().currentUser.uid

  useEffect(() => {  
    firebase.firestore().collection("users").doc(currentuser).get().then(doc => {
      setDisplayName(doc.data().username)
    })    
    firebase.firestore().collection("users").doc(doc.data().takenByID).get().then(doc => {
      setTakenBy(doc.data().username)
    })        
    likedPicture();
    checkOwnPicture();
    displayComments();
  }, []);

  const inputEl = useRef(null);

  const checkOwnPicture = () => {
    // function to check if the picture was taken by the current user
    collectionRef.doc(doc.id).get().then(function(doc){
      // if picture was taken by the current user then they can delete it 
      if (doc.data().takenByID === firebase.auth().currentUser.uid) {
        setOwnPicture(true)
      } else {
        setOwnPicture(false)
      } 
    })       
  }

  const likedPicture = () => {
    // set initial likes by fetching data from the picture document 
    collectionRef.doc(doc.id).get().then(function(doc){
      if (doc.data().likes.includes(currentuser)) {
        // if picture's likes array contains current user, the picture is already liked
        setLiked(true); 
      } else {
        // otherwise, the picture has not been liked by current user
        setLiked(false); 
      };
      // set number of likes to the picture document's like counter
      setNumLikes(doc.data().likeCounter ? doc.data().likeCounter : 0);    
    });    
  }

  const doubletap = useDoubleTap((event) => {
    // Your action here
    like();
    console.log('Double tapped');
  });  

  const like = () => {
    // function to like a picture
    collectionRef.doc(doc.id).get().then(function(doc){
      // increase like counter in the picture document, and add current user to the likes array
      if (doc.data().likes.includes(currentuser)) {
        return
      } else {
        collectionRef.doc(doc.id).update({
          likes: firebase.firestore.FieldValue.arrayUnion(currentuser),
          likeCounter:  firebase.firestore.FieldValue.increment(1)
        })          
      }           
    });
    setLiked(true); 
  }

  const unlike = () => {
    // function to unlike a picture
    collectionRef.doc(doc.id).get().then(function(doc){
      // decrease like counter in the picture document, and remove current user to the likes array
      collectionRef.doc(doc.id).update({
        likes: firebase.firestore.FieldValue.arrayRemove(currentuser),
        likeCounter:  firebase.firestore.FieldValue.increment(-1)
      })            
    });
    setLiked(false);     
  }

  collectionRef.doc(doc.id).onSnapshot(function(doc){
    // update like counter on the picture when there's an update in the picture document 
    doc.data() && setNumLikes(doc.data().likeCounter);    
    //doc.data() && displayComments();
  })

  const deletePicture = () => {
    // function to delete a picture
    collectionRef.doc(doc.id).delete()
    .catch(function(error) { 
      console.error("Error removing document: ", error); 
    });     
  }

  // display appropriate like button depending on whether photo has been liked or not (either filled or unfilled heart)
  const likeButton = liked ? (
    <IonButton onClick={unlike} class="like-panel">
      <IonIcon slot="icon-only" icon={heart} />   
    </IonButton>       
  ) : (
    <IonButton onClick={like} class="like-panel">
      <IonIcon slot="icon-only" icon={heartOutline} />   
    </IonButton>     
  )

  const removePicture = ownPicture ? (
    <>
      <IonButton onClick={() => setShowActionSheet(true)} expand="block">
      <IonIcon icon={ellipsisHorizontal}/>
      </IonButton>
      <IonActionSheet
        isOpen={showActionSheet}
        onDidDismiss={() => setShowActionSheet(false)}
        cssClass='action-sheet'
        buttons={[{
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            setDeletePhotoPopover(true)
          }
        }, 
        // {
        //   text: 'Share',
        //  // icon: share,
        //   handler: () => {
        //     console.log('Share clicked');
        //   }
        // }, 
        {
          text: 'Cancel',
          handler: () => {
            setShowActionSheet(false)
          }
        }]}
      >
      </IonActionSheet>
      </>
  ) : null 

  const writeComments = () => {
    if (comment !== '') {
    collectionRef.doc(doc.id).collection("Comments").add({
      username: displayName,
      comment: comment,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      pictureOwner: doc.data().takenByID,
      commenterId: currentuser
    }).then(function(docRef) {
        setComment('');
        displayComments(); 
        setShowComments(true);       
        })
    }
  }

  const displayComments = () => {
    setOtherComments([])
    collectionRef.doc(doc.id).collection("Comments").orderBy("timestamp", "asc").get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        var commentor = doc.data().username
        var theComment = doc.data().comment
          setOtherComments(otherComments => [
            ...otherComments, 
            {
              name: commentor,
              comment: theComment,
              id: doc.id
            }              
          ]);
        })
      })
      }

  const deleteComment = (commentid) => {
    collectionRef.doc(doc.id).collection("Comments").doc(commentid).delete().then(() => {
      displayComments()
    })
  }    

  const scrollContentUp = () => {
    inputEl.current.scrollIntoView({behavior: "smooth", block: "center"});

  }

  return(
    <IonCard class="picture-card">
      <IonCardHeader>
        <IonRow>
        <IonCol><IonText>{doc.data().takenAt}</IonText></IonCol> 
        <IonCol size="5"><IonText>{takenBy}</IonText></IonCol> 
        <IonCol><IonText>{numLikes} likes</IonText></IonCol> 
        </IonRow>
      </IonCardHeader>    
      <div {...doubletap} className="gallery-photo">
        <IonImg src={doc.data().picture}/>  
      </div>
      <IonRow>
        {likeButton}    
        {removePicture}
        {showComments && otherComments.length > 0 ? 
        <IonButton onClick={()=>setShowComments(false)} fill="clear">
          Hide comments
        </IonButton>    
        : otherComments.length > 0 ?
        <IonButton onClick={()=>setShowComments(true)} fill="clear">
          See comments
        </IonButton> : null}
      </IonRow>
      {otherComments && showComments && otherComments.map((comment, i) => {
        return(<Comment key={i} name={comment.name} comment={comment.comment} comid={comment.id} colref={collectionRef} picid={doc.id} deleteComment={() => deleteComment(comment.id)}/>)
      })}
      <IonRow class="comment-item">
      <IonItem lines="none">           
        <IonInput 
          ref={inputEl}
          class="create-input ion-padding-start" 
          value={comment} 
          placeholder="Comment"
          type="text"
          onIonChange={e => setComment(e.detail.value!)}
          onIonFocus={() => scrollContentUp()}>
        </IonInput>  
        {comment.trim() !== '' ? /*only show send button when there is text in the comment area */
        <div className="send-icon" slot="end">
          <IonIcon onClick={writeComments} slot="end" icon={sendOutline} />
        </div> : null}                    
      </IonItem>
      </IonRow>
      <IonPopover
        cssClass="popover"        
        isOpen={deletePhotoPopover}
        onDidDismiss={() => setDeletePhotoPopover(false)}
      >      
      <IonText>Delete this photo?</IonText><br/>
      <IonButton class="yellow-text" onClick={() => deletePicture()}>Yes</IonButton>
      <IonButton class="yellow-text" onClick={() => setDeletePhotoPopover(false)}>No</IonButton>
      </IonPopover>
    </IonCard>  
  )
}

const Comment = (props: {name, comment, comid, colref, picid, deleteComment}) => {
  const [ownComment, setOwnComment] = useState(false);
  const [timestamp, setTimestamp] = useState('');

  useEffect(() => {
    checkOwnComment(props.comid);
  })

  const checkOwnComment = (commentid) => {
    props.colref.doc(props.picid).collection("Comments").doc(commentid).get().then(function(doc){
      // if picture was taken by the current user then they can delete it 
      if (doc.data().commenterId === firebase.auth().currentUser.uid) {
        setOwnComment(true);
      } else {
        setOwnComment(false);
      }
      var commentTime = doc.data().timestamp.toDate();
      var time = moment(commentTime).format('DD-MM');
      setTimestamp(time);
    }).catch((err) => {
      setOwnComment(false);
    })       
  }

  if (ownComment === true) { 
    return(
      <IonItemSliding>
        <IonItem lines="none">
          <IonText>{props.name}: {props.comment} <IonText class="white-text">{timestamp}</IonText></IonText>
        </IonItem>
        <IonItemOptions side="end">
          <IonItemOption color="danger" onClick={props.deleteComment}>
            <IonIcon icon={trashSharp}></IonIcon>
          </IonItemOption>
        </IonItemOptions>
      </IonItemSliding>
    ) 
  } else {
    return(
      <IonItem lines="none">
        <IonText>{props.name}: {props.comment} <IonText class="white-text">{timestamp}</IonText></IonText>        
      </IonItem>            
    ) 
  }   
}

export default Gallery;