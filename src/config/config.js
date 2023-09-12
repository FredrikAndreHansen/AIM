try {
  const firebaseConfig = {
    apiKey: "AIzaSyCcrBlX25V35SrTrIF7WK7Jgxpwrnh5ORs",
    authDomain: "aim-nomad.firebaseapp.com",
    databaseURL: "https://aim-nomad-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "aim-nomad",
    storageBucket: "aim-nomad.appspot.com",
    messagingSenderId: "1044745530584",
    appId: "1:1044745530584:web:b3a72c39a4ac07370b7bad"
  };

  firebase.initializeApp(firebaseConfig);
} catch(error) {
    alert(error);
}