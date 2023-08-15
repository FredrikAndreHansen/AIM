import { displayErrorMessage } from '../controller/errorController.js';
import { displayLoading , removeLoading } from '../controller/loadController.js'

function registerUser(name, email, password) {
    firebase.auth().createUserWithEmailAndPassword(email, password).then((userCredential) => {
        const user = userCredential.user;
        writeUserData(user.uid, name, email, [''], false);
        removeLoading();
    }).catch((error) => {
        const errorCode = error.code;
        let errorMessage = error.message;
        if (errorCode === 'auth/email-already-in-use') {errorMessage = 'The email address is already taken!'}
        if (errorCode === 'auth/invalid-email') {errorMessage = 'The email address is not properly formatted!'}
        const formattedErrorMessage = errorMessage.replace('Firebase: ','').replace('auth/', '');
        displayErrorMessage(formattedErrorMessage);
    });
}

function writeUserData(userId, name, email, teams, isUpgraded) {
    firebase.database().ref('users/' + userId).set({
      username: name,
      email: email,
      teams: teams,
      isUpgraded: isUpgraded
    });
}

export function isUserInputValid(name, email, password, confirmPassword) {
    displayLoading();
    let isValid = true;
    let errorMessage = '';
    // Validating name
    if (name.length > 66 && isValid == true) {
        isValid = false;
        errorMessage = `The name is too long!<br>Maximum length is 66 characters`;
    }
    if (name.length === 0 && isValid == true) {
        isValid = false;
        errorMessage = "The name cannot be empty!";
    }
    // Validate email
    if (email.length === 0 && isValid == true) {
        isValid = false;
        errorMessage = "The email address cannot be empty!";
    }
    if (email.length > 66 && isValid == true) {
        isValid = false;
        errorMessage = `The email address is too long!<br>Maximum length is 66 characters`;
    }
    let regex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');
    if (!regex.test(email) && isValid == true) {
        errorMessage = "The email address is not properly formatted!"; 
        isValid = false;
    }
    // Validate password
    if (password.length === 0 && isValid == true) {
        isValid = false;
        errorMessage = "The password cannot be empty!";
    }
    if (password.length > 140 && isValid == true) {
        isValid = false;
        errorMessage = `The password is too long!<br>Maximum length is 140 characters`;
    }
    if (password.length < 6 && isValid == true) {
        isValid = false;
        errorMessage = `The password is too short!<br>Minimum length is 6 characters`;
    }
    // Validate confirm password
    if (password !== confirmPassword && isValid == true) {
        isValid = false;
        errorMessage = `The passwords don't match!<br>Please make sure that the password and the confirmed password are the same`;
    }
    // Show error message if there are any errors
    if (isValid === false) {
        displayErrorMessage(errorMessage);
    }
    // Execute if all validation succeed
    if (isValid === true) {
        registerUser(name, email, password);
    }
}