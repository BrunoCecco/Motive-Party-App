import firebase from 'firebase'
// For the default version

// Your web app's Firebase configuration
var fbConfig = {
  apiKey: "AIzaSyAVvp3VEXlFr-G--hwhIWFPxj_taJdnUx8",
  authDomain: "party-up-dd240.firebaseapp.com",
  databaseURL: "https://party-up-dd240.firebaseio.com",
  projectId: "party-up-dd240",
  storageBucket: "party-up-dd240.appspot.com",
  messagingSenderId: "514271758518",
  appId: "1:514271758518:web:8cd56ee0a6768cf195be17",
  measurementId: "G-0B2KD82CVF"
};
// Initialize Firebase
firebase.initializeApp(fbConfig);

// const messaging = firebase.messaging();

export default firebase;