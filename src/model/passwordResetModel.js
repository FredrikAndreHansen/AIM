import { displayErrorMessage } from '../controller/errorController.js';
import { displaySuccessMessage } from '../controller/successController.js';
import { displayLoading } from '../controller/loadController.js';

function resetPassword(email) {
    firebase.auth().sendPasswordResetEmail(email)
    .then(() => {
        displaySuccessMessage(`An email has been sent to <span style="font-weight: bold;">${email}</span>!<br>Please check your spam folder if you can't find it`);
    })
    .catch((error) => {
      let errorMessage = error.message;
      const formattedErrorMessage = errorMessage.replace('Firebase: ','').replace('auth/', '');
      displayErrorMessage(`Entered email: <span style="font-weight: bold;">${email}</span><br><br>` + formattedErrorMessage);
    });
}

export function isEmailValid(email) {
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
        errorMessage = "Please enter a valid email address!"; 
        isValid = false;
    }
    // Show error message if there are any errors
    if (isValid === false) {
        displayErrorMessage(errorMessage);
    }
    // Execute if all validation succeed
    if (isValid === true) {
        resetPassword(email);
    }
}