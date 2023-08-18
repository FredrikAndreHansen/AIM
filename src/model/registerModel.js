import { ErrorController } from '../controller/errorController.js';
import { LoadController } from '../controller/loadController.js'
import { SignInModel } from './signInModel.js';
import { REGEX } from '../helpers/helpers.js';

// Initialize classes
const errorController = new ErrorController();

export class RegisterModel {

    registerUser(name, email, company, password) {
        firebase.auth().createUserWithEmailAndPassword(email, password).then((userCredential) => {
            // Initialize classes
            const signInModel = new SignInModel();
            
            const user = userCredential.user;
            this.writeUserData(user.uid, name, company, [''], ['']);
            signInModel.signInUser(email, password);
        }).catch((error) => {
            const errorCode = error.code;
            let errorMessage = error.message;
            if (errorCode === 'auth/email-already-in-use') {errorMessage = 'The email address is already taken!'}
            if (errorCode === 'auth/invalid-email') {errorMessage = 'The email address is not properly formatted!'}
            const formattedErrorMessage = errorMessage.replace('Firebase: ','').replace('auth/', '');
            errorController.displayErrorMessage(formattedErrorMessage);
        });
    }

    writeUserData(userId, name, company, teams, blockedUsers) {
        firebase.database().ref('users/' + userId).set({
        username: name,
        company: company,
        teams: teams,
        blockedUsers: blockedUsers
        });
    }

    isUserInputValid(name, email, company, password, confirmPassword) {
        // Initialize classes
        const loadController = new LoadController();
        loadController.displayLoading();
        let isValid = true;
        let errorMessage = '';
        // Validating name
        if (name.length > 64 && isValid == true) {
            isValid = false;
            errorMessage = `The name is too long!<br>Maximum length is 64 characters`;
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
        let regex = REGEX;
        if (!regex.test(email) && isValid == true) {
            errorMessage = "The email address is not properly formatted!"; 
            isValid = false;
        }
        // Validate company
        if (company.length === 0 && isValid == true) {
            isValid = false;
            errorMessage = "The company name cannot be empty!";
        }
        if (company.length > 64 && isValid == true) {
            isValid = false;
            errorMessage = `The company name is too long!<br>Maximum length is 64 characters`;
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
            errorController.displayErrorMessage(errorMessage);
        }
        // Execute if all validation succeed
        if (isValid === true) {
            this.registerUser(name, email, company, password);
        }
    }

}