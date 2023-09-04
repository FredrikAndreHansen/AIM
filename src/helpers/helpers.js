import { ErrorController } from "../controller/errorController.js"
import { LoadController } from "../controller/loadController.js";
const errorController = new ErrorController();

export function SALT() {
    // Get salt from database
    return new Promise(function(resolve) {
        const dbRef = firebase.database().ref();
        dbRef.child("salt").get().then((snapshot) => {
            if (snapshot.exists()) {
                resolve(snapshot.val());
            } else {
                errorController.throwError("No data available!");
            }
        }).catch((error) => {
            errorController.displayErrorMessage(error);
        });
    });
}

export function TRIMSTRING(string) {
    let a = string.replaceAll('"', '');
    let b = a.replaceAll('[', '');
    const c = b.replaceAll(']', '');
    return c;
}

export function PARSESTRING(string) {
    let a = JSON.parse(string);
    const b = JSON.stringify(a);
    return b;
}

export function VALIDATE_USER_INPUT(userInput) {
    try {
        const { name = false, email = false, company = false, password = false, confirmPassword = false } = userInput;

        const loadController = new LoadController();
        loadController.displayLoading();

        if (name !== false) {
            validateNameOrCompany(name);
        }

        if (email !== false) {
            validateEmail(email);
        }

        if (company !== false) {
            validateNameOrCompany(company, 'company');
        }

        if (password !== false) {
            validatePassword(password, confirmPassword);
        }

        return true;
    } catch(error) {
        errorController.displayErrorMessage(error);
    }
}

export function validateNameOrCompany(name, company = '') {
    if (name.length > 64) {
        errorController.throwError(`The ${company} name is too long!<br>Maximum length is 64 characters`);
    }

    if (name.length === 0) {
        errorController.throwError(`The ${company} name cannot be empty!`);
    }
}

export function validateEmail(email) {
    if (email.length === 0) {
        errorController.throwError("The email address cannot be empty!");
    }

    if (email.length > 66) {
        errorController.throwError(`The email address is too long!<br>Maximum length is 66 characters`);
    }

    const regex = regExp;
    if (!regex.test(email)) {
        errorController.throwError("The email address is not properly formatted!");
    }
}

// Email validation, text followed by "@" followed by text, followed by "." followed by text
const regExp = new RegExp('[a-zA-Z0-9]+@[a-zA-Z]+\.[a-zA-Z]{2,3}');

export function validatePassword(password, confirmPassword = false) {
    if (password.length === 0) {
        errorController.throwError("The password cannot be empty!");
    }

    if (password.length > 140) {
        errorController.throwError(`The password is too long!<br>Maximum length is 140 characters`);
    }

    if (password.length < 6) {
        errorController.throwError(`The password is too short!<br>Minimum length is 6 characters`);
    }

    if (confirmPassword !== false && password !== confirmPassword) {
        errorController.throwError(`The passwords don't match!<br>Please make sure that the password and the confirmed password are the same`);
    }
}

export function FORMAT_ERROR_MESSAGE(error) {
    const errorCode = error.code;
    let errorMessage = error.message;

    if (errorCode === 'auth/wrong-password') {errorMessage = 'The credentials are incorrect!'}
    if (errorCode === 'auth/email-already-in-use') {errorMessage = 'The email address is already taken!'}
    if (errorCode === 'auth/invalid-email') {errorMessage = 'The email address is not properly formatted!'}
    const formattedErrorMessage = errorMessage.replace('Firebase: ','').replace('auth/', '');

    return formattedErrorMessage;
}