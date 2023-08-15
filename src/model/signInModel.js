import { displayErrorMessage } from '../controller/errorController.js';
import { displayLoading , removeLoading } from '../controller/loadController.js';

function signInUser(email, password) {
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
        removeLoading();
    })
    .catch((error) => {
        const errorCode = error.code;
        let errorMessage = error.message;
        if (errorCode === 'auth/wrong-password') {errorMessage = 'The credentials are incorrect!'}
        const formattedErrorMessage = errorMessage.replace('Firebase: ','').replace('auth/', '');
        displayErrorMessage(formattedErrorMessage);
    });
}

export function isUserInputValid(email, password) {
    displayLoading();
    let isValid = true;
    let errorMessage = '';
    // Validate email
    if (email.length === 0 && isValid == true) {
        isValid = false;
        errorMessage = "The email address cannot be empty!";
    }
    let regex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');
    if (!regex.test(email) && isValid == true) {
        errorMessage = "You can only sign in with an email address!";
        isValid = false;
    }
    // Validate password
    if (password.length === 0 && isValid == true) {
        isValid = false;
        errorMessage = "The password cannot be empty!";
    }
    // Show error message if there are any errors
    if (isValid === false) {
        displayErrorMessage(errorMessage);
    }
    // Execute if all validation succeed
    if (isValid === true) {
        signInUser(email, password);
    }
}