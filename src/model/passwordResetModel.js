import { ErrorController } from '../controller/errorController.js';
import { SuccessController } from '../controller/successController.js';
import { LoadController } from '../controller/loadController.js';

// Initialize classes
const errorController = new ErrorController();

export class PasswordResetModel {

    resetPassword(email) {
        firebase.auth().sendPasswordResetEmail(email)
        .then(() => {
            const successController = new SuccessController();
            successController.displaySuccessMessage(`An email has been sent to <span style="font-weight: bold;">${email}</span>!<br>Please check your spam folder if you can't find it`);
        })
        .catch((error) => {
        let errorMessage = error.message;
        const formattedErrorMessage = errorMessage.replace('Firebase: ','').replace('auth/', '');
        errorController.displayErrorMessage(`Entered email: <span style="font-weight: bold;">${email}</span><br><br>` + formattedErrorMessage);
        });
    }

    isEmailValid(email) {
        // Initialize classes
        const loadController = new LoadController();
        loadController.displayLoading();
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
            errorController.displayErrorMessage(errorMessage);
        }
        // Execute if all validation succeed
        if (isValid === true) {
            this.resetPassword(email);
        }
    }

}