import { ErrorController } from '../controller/errorController.js';
import { LoadController } from '../controller/loadController.js';
import { AuthHelper } from '../helpers/auth.js';
import { REGEX } from '../helpers/helpers.js';

// Initialize classes
const errorController = new ErrorController();

export class SignInModel {

    signInUser(email, password) {
        // Initialize classes
        const authHelper = new AuthHelper();

        firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            authHelper.createToken(userCredential.user.uid);
        })
        .catch((error) => {
            const errorCode = error.code;
            let errorMessage = error.message;
            if (errorCode === 'auth/wrong-password') {errorMessage = 'The credentials are incorrect!'}
            const formattedErrorMessage = errorMessage.replace('Firebase: ','').replace('auth/', '');
            errorController.displayErrorMessage(formattedErrorMessage);
        });
    }

    isUserInputValid(email, password) {
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
        let regex = REGEX;
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
            errorController.displayErrorMessage(errorMessage);
        }
        // Execute if all validation succeed
        if (isValid === true) {
            this.signInUser(email, password);
        }
    }

}