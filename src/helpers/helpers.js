import { HandlerController } from "../controller/handlers/handlerController.js";
import { LoadController } from "../controller/handlers/loadController.js";

const handlerController = new HandlerController();

export function SALT() {
    // Get salt from database
    return new Promise(function(resolve) {
        get_db_salt_info().then((snapshot) => {
            if (IF_EXISTS(snapshot)) {
                resolve(GET_VALUE(snapshot));
            } else {
                handlerController.throwError("No data available!");
            }
        }).catch((error) => {
            handlerController.displayMessage({message: error, isError: true});
        });
    });
}

function get_db_salt_info() {
    const dbRef = GET_DB_REFERENCE();

    return dbRef.child("salt").get();
}

export function TRIMSTRING(string) {
    let a = string.replaceAll('"', '');
    let b = a.replaceAll('[', '');
    return b.replaceAll(']', '');
}

export function PARSESTRING(string) {
    let a = JSON.parse(string);
    return JSON.stringify(a);
}

export function VALIDATE_USER_INPUT(userInput) {
    try {
        const { name = false, email, company = false, password = false, confirmPassword = false } = userInput;

        const loadController = new LoadController();
        loadController.displayLoading();

        if (name !== false) {
            validateNameOrCompany(name);
        }

        validateEmail(email);

        if (company !== false) {
            validateNameOrCompany(company, 'company');
        }

        if (password !== false) {
            validatePassword(password, confirmPassword);
        }

        return true;
    } catch(error) {
        handlerController.displayMessage({message: error, isError: true});
    }
}

function validateNameOrCompany(name, company = '') {
    if (name.length > 64) {
        handlerController.throwError(`The ${company} name is too long!<br>Maximum length is 64 characters`);
    }

    if (name.length === 0) {
        handlerController.throwError(`The ${company} name cannot be empty!`);
    }
}

function validateEmail(email) {
    if (email.length === 0) {
        handlerController.throwError("The email address cannot be empty!");
    }

    if (email.length > 66) {
        handlerController.throwError(`The email address is too long!<br>Maximum length is 66 characters`);
    }

    const regex = regExp;
    if (!regex.test(email)) {
        handlerController.throwError("The email address is not properly formatted!");
    }
}

// Email validation, text followed by "@" followed by text, followed by "." followed by text
const regExp = new RegExp('[a-zA-Z0-9]+@[a-zA-Z]+\.[a-zA-Z]{2,3}');

function validatePassword(password, confirmPassword = false) {
    if (password.length === 0) {
        handlerController.throwError("The password cannot be empty!");
    }

    if (password.length > 140) {
        handlerController.throwError(`The password is too long!<br>Maximum length is 140 characters`);
    }

    if (password.length < 6) {
        handlerController.throwError(`The password is too short!<br>Minimum length is 6 characters`);
    }

    if (confirmPassword !== false && password !== confirmPassword) {
        handlerController.throwError(`The passwords don't match!<br>Please make sure that the password and the confirmed password are the same`);
    }
}

export function FORMAT_ERROR_MESSAGE(error) {
    const errorCode = error.code;
    let errorMessage = error.message;

    if (errorCode === 'auth/wrong-password') {errorMessage = 'The credentials are incorrect!'}
    if (errorCode === 'auth/email-already-in-use') {errorMessage = 'The email address is already taken!'}
    if (errorCode === 'auth/invalid-email') {errorMessage = 'The email address is not properly formatted!'}

    return errorMessage.replace('Firebase: ','').replace('auth/', '');
}

export function GET_DB_REFERENCE(refArgument = false) {
    if (refArgument === false) {
        return firebase.database().ref();
    } else {
        return firebase.database().ref(refArgument);
    }
}

export function GET_DB_USERS_INFO(dbReference, child) {
    return dbReference.child('users').child(child).get();
}

export function SAVE_TO_DB_IN_USERS(databaseRows) {
    const { dbReference, firstChild, secondChild, saveValue } = databaseRows;

    dbReference.child("users").child(firstChild).child(secondChild).set(saveValue);
}

export const GET_AUTH = firebase.auth();

export function IF_EXISTS(argumentToCheck) {
    if (argumentToCheck.exists()) {
        return true;
    } else {
        return false;
    }
}

export function GET_VALUE(value) {
    return value.val();
}

const tokenString = "AIMNomadToken";

export function GET_TOKEN() {
    return localStorage.getItem(tokenString);
}

export function REMOVE_TOKEN() {
    return localStorage.removeItem(tokenString);
}

export function ADD_TOKEN(setValue) {
    return localStorage.setItem(tokenString, JSON.stringify(setValue));
}

export function GET_DOM_VALUE(DOMEl) {
    return DOMEl.value;
}

export function CLEAR_DOM_VALUE(DOMEl) {
    return DOMEl.value = '';
}

export function SET_INNER_HTML_VALUE(DOMElements) {
    const { set, to = 'clear' } = DOMElements;
    if (to === 'clear') {
        return set.innerHTML = '';
    } else {
        return set.innerHTML = to;
    }
}

export function SET_MENU_HIGHLIGHT(DOMEl) {
    return DOMEl.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
}

export function GET_USER_ID() {
    const token = PARSESTRING(GET_TOKEN());
    const [userIdRaw, _, __] = token.split(',');
    return TRIMSTRING(userIdRaw);
}

export function CHECK_IF_BLOCKED_USERS_EXISTS(blockedUsers, encryptedUserId) {
    if (!blockedUsers) {
        return true;
    }

    for(let i = 0; i < blockedUsers.length; i++) {
        if (blockedUsers[i] === encryptedUserId) {
            return false;
        }
    }
    return true; 
}

export function IF_ANY_BLOCKED_USERS(blockedUsers) {
    if (blockedUsers && blockedUsers.length > 1) {
        return true;
    } else {
        return false;
    }
}