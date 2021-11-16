const functions = require('firebase-functions');
const fetch = require("node-fetch");

const algoliasearch = require('algoliasearch');
const admin = require('firebase-admin');

const ALGOLIA_APP_ID = "N5BVZA4FRH";
const ALGOLIA_ADMIN_KEY = "97e6599bb78a2011ba204d995be641f8";
const ALGOLIA_INDEX_NAME = "Users";

admin.initializeApp(functions.config().firebase)

// tbd - remember to redeploy at the end

exports.sendFriendRequestNotification = functions.firestore
.document("friend_requests/{userId}")
  .onWrite(async (change, context) => {
    const afterdata = change.after.data()
    const beforedata = change.before.data()    
    var newrequests = afterdata.request_from ? afterdata.request_from : []
    var oldrequests = beforedata.request_from ? beforedata.request_from : []

    if (newrequests.length > oldrequests.length) { // check a new request was added to request_from
      var lastitem = newrequests.length - 1
      //const requestId = newrequests[lastitem].id; // get newest request id     
      const requestName = newrequests[lastitem].name; // get newest request name

      admin.firestore().collection("users").doc(change.after.id).update({
        friendNotifications: true
      }).catch(error => {
        console.log("Error collecting document ", error.message);
        return 
      })      

      admin.firestore().collection("users").doc(change.after.id).get().then(doc => {
        // get user's device token      
        const token = doc.data().deviceToken;
        fetch('https://fcm.googleapis.com/fcm/send', {
          method: "POST", 
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization':'key=AAAAd7z8SLY:APA91bGDcq_D1ik3ppwxuQgp3d66IBusm8TICa04QC5nKDujDFWiLxAU0toYYgsMr9Kmz33femjOkTnl-EU6YZu_q55LQ8Vc0VA5wZNplCainzzdpyaFfSU0pLArv0HDlmvZ4-ydnO-C'
          },
          body: JSON.stringify({
            "priority": "high",
            "to": token,             
            "notification": {"title":"New Friend Request!","body": `${requestName} has sent a friend request`}
          })          
        }).then(res => {
          console.log("Request complete!");
          console.log("Token: ", token)
          return
        }).catch(err => {
          console.log(err.message)
          return
        });
        return
      }).catch(err => {
        console.log(err.message)
      });
    } else if (newrequests.length === 0) {
      admin.firestore().collection("users").doc(change.after.id).update({
        friendNotifications: false 
      }).catch(err => {
        console.log(err.message);
        return
      });            
    }
})

exports.subscribeToPartyTopic = functions.firestore
.document("users/{userId}")
  .onWrite(async (change, context) => {
    const afterdata = change.after.data()
    const beforedata = change.before.data()    
    var newInvites = afterdata.myInvites ? afterdata.myInvites : []
    var oldInvites = beforedata.myInvites ? beforedata.myInvites : []
    var newDeclinedInvites = afterdata.declinedInvites ? afterdata.declinedInvites : []
    var oldDeclinedInvites = beforedata.declinedInvites ? beforedata.declinedInvites : []
    const topic1 = newInvites.length > 0 && newInvites[newInvites.length-1].partyid // get last item
    const inviterId = newInvites.length > 0 && newInvites[newInvites.length-1].hostid // get last item
    const topic2 = newDeclinedInvites.length > 0 && newDeclinedInvites[newDeclinedInvites.length-1].partyid // get last item
  
    if (newInvites.length > oldInvites.length) { // check new invites have been received
      admin.firestore().collection("users").doc(change.after.id).update({
        partyNotifications: true
      }).catch(error => {
        console.log("Error collecting document ", error.message)
        return 
      });    
      admin.messaging().subscribeToTopic(afterdata.deviceToken, topic1)
        .then(function(response) {
          admin.firestore().collection("users").doc(inviterId)
            .collection("myParties").doc(topic1).update({
              topicCreated: true
            })
          console.log('Successfully subscribed to topic');
          return
        })
        .catch(function(error) {
          console.log('Error subscribing to topic:', error.message);
          return
        }); 
    } else if (newDeclinedInvites.length > oldDeclinedInvites.length) { // user has declined an invite    
      admin.messaging().unsubscribeToTopic(afterdata.deviceToken, topic2)
        .then(function(response) {
          console.log('Successfully unsubscribed from topic');
          return
        })
        .catch(function(error) {
          console.log('Error subscribing to topic:', error.message);
          return
        }); 
    } else if (newInvites.length === 0) {
      admin.firestore().collection("users").doc(change.after.id).update({
        partyNotifications: false 
      }).catch(err => {
        console.log(err.message);
        return
      });            
    }
  })


exports.sendPartyNotification = functions.firestore
.document("users/{userId}/{myPartiesId}/{partyId}")
  .onWrite(async (change, context) => {
    // const acceptedInvites = change.before.data().accepted_invites.length;
    // const invitedPeople = change.before.data().invited_people.length;
    // const newAcceptedInvites = change.after.data().accepted_invites.length;
    // const newInvitedPeople = change.after.data().invited_people.length;
    const partyTitle = change.after.data().title;
    const hostname = change.after.data().hostname;  

    if (change.before.data().topicCreated === false && change.after.data().topicCreated === true) {
      fetch('https://fcm.googleapis.com/fcm/send', {
        method: "POST", 
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization':'key=AAAAd7z8SLY:APA91bGDcq_D1ik3ppwxuQgp3d66IBusm8TICa04QC5nKDujDFWiLxAU0toYYgsMr9Kmz33femjOkTnl-EU6YZu_q55LQ8Vc0VA5wZNplCainzzdpyaFfSU0pLArv0HDlmvZ4-ydnO-C'
        },
        body: JSON.stringify({
          "priority": "high",
          "to": `/topics/${change.after.id}`,
          "notification": {"title":"New Party Invite!","body": `${change.after.data().hostname} has invited you to a party`}
        })          
      }).then(res => {
        console.log("Request complete! ", res.registration_ids);
        return
      }).catch(err => {
        console.log(err.message)
        return
      });
    } else if (change.after.data().topicCreated === true) {
      for (const [key1, value1] of Object.entries(change.before.data())) {
        for (const [key2, value2] of Object.entries(change.after.data())) {
          console.log(key1, value1);
          console.log(key2, value2);
          if (key1 === key2 && value1 !== value2) {
            if (key1 === "accepted_invites" || key1 === "invited_people") {
              console.log("accepted_invites or invited_people key")
              // don't send notification as there hasn't been a real change in details
            } else {
              // send notification 
              fetch('https://fcm.googleapis.com/fcm/send', {
                method: "POST", 
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                  'Authorization':'key=AAAAd7z8SLY:APA91bGDcq_D1ik3ppwxuQgp3d66IBusm8TICa04QC5nKDujDFWiLxAU0toYYgsMr9Kmz33femjOkTnl-EU6YZu_q55LQ8Vc0VA5wZNplCainzzdpyaFfSU0pLArv0HDlmvZ4-ydnO-C'
                },
                body: JSON.stringify({
                  "priority": "high",
                  "to": `/topics/${change.after.id}`,
                  "notification": {"title":"Party Details Changed!","body": `${hostname} has changed the details for ${partyTitle}`}
                })          
              }).then(res => {
                console.log("Request complete! ", res.registration_ids);
                return
              }).catch(err => {
                console.log(err.message)
                return
              });               
            }
          }
        }      
      }        
      //if (invitedPeople === newInvitedPeople && acceptedInvites === newAcceptedInvites) { // send notificationd as details have actually changed       
      //}
    }    
})

exports.sendLikeNotification = functions.firestore 
.document("users/{userId}/{myPartiesId}/{partyId}/{picturesId}/{pictureId}")
  .onWrite(async (change, context) => {
    let newLikeCounter = change.after.data().likeCounter ? change.after.data().likeCounter : 0;
    let oldLikeCounter = change.before.data().likeCounter ? change.before.data().likeCounter : 0;
    let newLikes = change.after.data().likes ? change.after.data().likes : [];
    let userId = change.after.data().takenByID; // user who took the picture 
    let partyId = context.params.partyId; // for red notification button to know which party has a notification

    if (newLikeCounter > oldLikeCounter) { // new like
      let likerId = newLikes[newLikeCounter-1];
      admin.firestore().collection("users").doc(userId).update({
        myPartiesNotifications: true,
        partiesWithNotifications: admin.firestore.FieldValue.arrayUnion(partyId)
      }).catch(err => {
        console.log(err.message)
        return
      });      
      admin.firestore().collection("users").doc(userId).get().then(doc1 => {
        let token = doc1.data().deviceToken;
        admin.firestore().collection("users").doc(likerId).get().then(doc2 => {
          let likerName = doc2.data().username
          fetch('https://fcm.googleapis.com/fcm/send', {
            method: "POST", 
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization':'key=AAAAd7z8SLY:APA91bGDcq_D1ik3ppwxuQgp3d66IBusm8TICa04QC5nKDujDFWiLxAU0toYYgsMr9Kmz33femjOkTnl-EU6YZu_q55LQ8Vc0VA5wZNplCainzzdpyaFfSU0pLArv0HDlmvZ4-ydnO-C'
            },
            body: JSON.stringify({
              "priority": "high",
              "to": token,
              "notification": {"title":`${likerName} liked your picture`}
            })                   
          }).then(res => {
            console.log("Request complete! ", token);
            return
          }).catch(err => {
            console.log(err.message)
            return
          });    
          return    
        }).catch(err => {
          return console.log(err.message)
        })
        return
      }).catch(err => {
        return console.log(err.message)
      })
    }
  })

exports.sendCommentNotification = functions.firestore 
.document("users/{userId}/{myPartiesId}/{partyId}/{picturesId}/{pictureId}/{CommentsId}/{commentId}")
  .onCreate(async (snap, context) => {
    let comment = snap.data().comment
    let commenter = snap.data().username // person who commented
    let pictureOwner = snap.data().pictureOwner
    let partyId = context.params.partyId // id of party to show the red notification button on that party
    admin.firestore().collection("users").doc(pictureOwner).update({ // for myparties notification icon
      myPartiesNotifications: true,
      partiesWithNotifications: admin.firestore.FieldValue.arrayUnion(partyId)
    }).catch(err => {
      console.log(err.message)
      return
    });      
    admin.firestore().collection("users").doc(pictureOwner).get().then(doc => {
      let token = doc.data().deviceToken;
      fetch('https://fcm.googleapis.com/fcm/send', {
        method: "POST", 
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization':'key=AAAAd7z8SLY:APA91bGDcq_D1ik3ppwxuQgp3d66IBusm8TICa04QC5nKDujDFWiLxAU0toYYgsMr9Kmz33femjOkTnl-EU6YZu_q55LQ8Vc0VA5wZNplCainzzdpyaFfSU0pLArv0HDlmvZ4-ydnO-C'
        },
        body: JSON.stringify({
          "priority": "high",
          "to": token,
          "notification": {"title":`${commenter} commented on your picture:`, "body": `${comment}`}
        })                   
      }).then(res => {
        console.log("Request complete! ", token);
        return
      }).catch(err => {
        console.log(err.message)
        return
      });    
      return
    }).catch(err => {
      return console.log(err.message)
    })
  })

  // send notification to party host when someone has accepted their invite
exports.sendAcceptedInviteNotification = functions.firestore 
.document("users/{userId}")
  .onWrite(async (change) => {
    let newAcceptedInvites = change.after.data().acceptedInvites ? change.after.data().acceptedInvites : [];
    let oldAcceptedInvites = change.before.data().acceptedInvites ? change.before.data().acceptedInvites : [];
    if (newAcceptedInvites.length > oldAcceptedInvites.length) {
      let newAcceptedInvite = newAcceptedInvites[newAcceptedInvites.length - 1];
      let partyHostid = newAcceptedInvite.hostid;
      admin.firestore().collection("users").doc(partyHostid).get().then(doc => {
        let token = doc.data().deviceToken;
        fetch('https://fcm.googleapis.com/fcm/send', {
          method: "POST", 
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization':'key=AAAAd7z8SLY:APA91bGDcq_D1ik3ppwxuQgp3d66IBusm8TICa04QC5nKDujDFWiLxAU0toYYgsMr9Kmz33femjOkTnl-EU6YZu_q55LQ8Vc0VA5wZNplCainzzdpyaFfSU0pLArv0HDlmvZ4-ydnO-C'
          },
          body: JSON.stringify({
            "priority": "high",
            "to": token,
            "notification": {"title":`${change.after.data().username} has accepted your party invite!`}
          })                   
        }).then(res => {
          console.log("Request complete! ", change.after.data().username);
          return
        }).catch(err => {
          console.log(err.message)
          return
        });    
        return
      }).catch(err => {
        return console.log(err.message)
      })      
    }
  })

exports.verifyPhoneUser = functions.firestore
.document("users/{userId}")
.onWrite(async (change, context) => {
  admin.auth()
    .updateUser(change.after.id, {
      emailVerified: change.after.data().phoneVerified,
      displayName: change.after.data().username,
      email: change.after.data().email,
      phoneNumber: change.after.data().phone_number,       
    })
})

exports.addAlgoliaUser = functions.firestore
.document("users/{userId}")
.onCreate(async (snap, context) => {
  admin.auth()
    .updateUser(snap.id, {
      displayName: snap.data().username,
      email: snap.data().email,
      phoneNumber: snap.data().phone_number, 
    })

  // adding index to algolia 
  const newValue = snap.data();
  newValue.objectID = snap.id;

  var client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);

  var index = client.initIndex(ALGOLIA_INDEX_NAME);
  index.saveObject({
    objectID: newValue.objectID,
    email: newValue.email,
    fullname: newValue.fullname,    
    id: newValue.id,    
    username: newValue.username,
    // bitmoji: newValue.bitmoji
  });
});

exports.updateAlgoliaUser = functions.firestore
.document("users/{userId}")
.onUpdate(async (snap, context) => {
  const afterUpdate = snap.after.data();
  afterUpdate.objectID = snap.after.id;

  var client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);

  var index = client.initIndex(ALGOLIA_INDEX_NAME);
  index.saveObject(afterUpdate);
});

exports.deleteAlgoliaUser = functions.firestore
.document("users/{userId}")
.onDelete(async (snap, context) => {
  const oldID = snap.id;
  
  var client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);

  var index = client.initIndex(ALGOLIA_INDEX_NAME);
  index.deleteObject(oldID);
});