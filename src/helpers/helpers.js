import { displayMessage, throwError } from "../libraries/handler.js";
import { displayLoading } from "../libraries/load.js";
import { viewDOMElement } from "../index.js";

export function SALT() {
    // Get salt from database
    return new Promise((resolve, reject) => {
        get_db_salt_info().then((snapshot) => {
            if (IF_EXISTS(snapshot)) {
                resolve(GET_VALUE(snapshot));
            } else {
                reject(throwError("No data available!"));
            }
        }).catch((error) => {
            displayMessage({message: error, isError: true});
        });
    });
}

function get_db_salt_info() {
    const dbRef = GET_DB_REFERENCE();

    return dbRef.child("salt").get();
}

export function GLOBAL_CONFIG(item) {
    // Get global config from database
    return new Promise((resolve, reject) => {
        get_db_config_info().then((snapshot) => {
            if (IF_EXISTS(snapshot)) {

                const config = GET_VALUE(snapshot);
                const { CONTACT_URL, MAXIMUM_PEOPLE_PER_TEAM, MAXIMUM_TEAMS_PER_PERSON } = config;

                if (item === 'CONTACT_URL') {resolve(CONTACT_URL);}
                if (item === 'MAXIMUM_PEOPLE_PER_TEAM') {resolve(MAXIMUM_PEOPLE_PER_TEAM);}
                if (item === 'MAXIMUM_TEAMS_PER_PERSON') {resolve(MAXIMUM_TEAMS_PER_PERSON);}
            } else {
                reject(throwError("No data available!"));
            }
        }).catch((error) => {
            displayMessage({message: error, isError: true});
        });
    });
}

function get_db_config_info() {
    const dbRef = GET_DB_REFERENCE();

    return dbRef.child("config").get();
}

export function TRIMSTRING(string) {
    let a = string.replaceAll('"', '');
    let b = a.replaceAll('[', '');
    return b.replaceAll(']', '');
}

export function REMOVE_SEMICOLON(string) {
    return string.replaceAll(':', '');
}

export function REMOVE_FULLSTOP(string) {
    return string.replaceAll('.', '');
}

export function PARSESTRING(string) {
    let a = JSON.parse(string);
    return JSON.stringify(a);
}

export function CONVERT_STRING_TO_ARRAY(string) {
    let [a, b] = string.split(",");

    return [a, b];
}

export function VALIDATE_USER_INPUT(userInput) {
    try {
        const { name = false, email = false, company = false, password = false, confirmPassword = false } = userInput;

        displayLoading();

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
        displayMessage({message: error, isError: true});
    }
}

export function CANT_BE_THE_SAME_NAME(newName, oldName, nameString = 'team') {
    try{
        if (newName === oldName) {
            throwError(`The name of the ${nameString} can't be the same!`)
        }

        return true;
    } catch(error) {
        displayMessage({message: error, isError: true});
    }
}

function validateNameOrCompany(name, company = '') {
    if (name.length > 64) {
        throwError(`The ${company} name is too long!<br>Maximum length is 64 characters`);
    }

    if (name.length === 0) {
        throwError(`The ${company} name cannot be empty!`);
    }

    if (name.trim().length === 0) {
        throwError(`The ${company} name cannot be empty!`);
    }
}

function validateEmail(email) {
    if (email.length === 0) {
        throwError("The email address cannot be empty!");
    }

    if (email.trim().length === 0) {
        throwError("The email address cannot be empty!");
    }

    if (email.length > 66) {
        throwError(`The email address is too long!<br>Maximum length is 66 characters`);
    }

    const regex = regExp;
    if (!regex.test(email)) {
        throwError("The email address is not properly formatted!");
    }
}

// Email validation, text followed by "@" followed by text, followed by "." followed by text
const regExp = new RegExp('[a-zA-ZŽžÀ-ÿ0-9]+@[a-zA-Z]+\.[a-zA-Z]{2,3}');

function validatePassword(password, confirmPassword = false) {
    if (password.length === 0) {
        throwError("The password cannot be empty!");
    }

    if (password.trim().length === 0) {
        throwError("The password cannot be empty!");
    }

    if (password.length > 140) {
        throwError(`The password is too long!<br>Maximum length is 140 characters`);
    }

    if (password.length < 6) {
        throwError(`The password is too short!<br>Minimum length is 6 characters`);
    }

    if (confirmPassword !== false && password !== confirmPassword) {
        throwError(`The passwords don't match!<br>Please make sure that the password and the confirmed password are the same`);
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
export const USERS_GET_CHILD_REF = "users";
export const USERS_REF = USERS_GET_CHILD_REF + "/";

export const TEAMS_GET_CHILD_REF = "teams";
export const TEAMS_REF = TEAMS_GET_CHILD_REF + "/";

export function GET_DB_TEAMS_INFO(dbReference) {
    return dbReference.child(TEAMS_GET_CHILD_REF).get();
}

export function GET_DB_INDIVIDUAL_TEAM_INFO(dbReference, child) {
    return dbReference.child(TEAMS_GET_CHILD_REF).child(child).get();
}

export function GET_DB_USERS_INFO(dbReference, child) {
    return dbReference.child(USERS_GET_CHILD_REF).child(child).get();
}

export function GET_DB_USERS_INVITEDTEAMS(dbReference, child, invitedTeams) {
    return dbReference.child(USERS_GET_CHILD_REF).child(child).child(invitedTeams).get();
}

export function GET_DB_ALL_USERS() {
    return GET_DB_REFERENCE(USERS_REF);
}

export function GET_DB_ALL_USERS_INFO(dbReference) {
    return dbReference.child(USERS_GET_CHILD_REF).get();
}

export function SAVE_TO_DB_IN_USERS(databaseRows) {
    const { dbReference, firstChild, secondChild, saveValue } = databaseRows;

    dbReference.child(USERS_GET_CHILD_REF).child(firstChild).child(secondChild).set(saveValue);
}

export function SAVE_TO_DB_IN_USERS_CONFIG(databaseRows) {
    const { dbReference, firstChild, secondChild, saveValue } = databaseRows;

    dbReference.child(USERS_GET_CHILD_REF).child(firstChild).child('configuration').child(secondChild).set(saveValue);
}

export function SAVE_TO_DB_IN_TEAMS(databaseRows) {
    const { dbReference, firstChild, secondChild, saveValue } = databaseRows;

    dbReference.child(TEAMS_GET_CHILD_REF).child(firstChild).child(secondChild).set(saveValue);
}

export function SAVE_TO_DB_IN_TEAMS_CONFIGURATION(databaseRows) {
    const { dbReference, firstChild, secondChild, thirdChild, saveValue } = databaseRows;

    dbReference.child(TEAMS_GET_CHILD_REF).child(firstChild).child(secondChild).child(thirdChild).set(saveValue);
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

export function CHECK_INNER_HTML_VALUE(DOMElement) {
    if (DOMElement.innerHTML === '' || DOMElement.innerHTML === undefined) {
        return true;
    } else {
        return false;
    }
}

export function SET_MENU_HIGHLIGHT(DOMEl) {
    const clickedElementDOM = document.querySelector("." + DOMEl.id + "-clicked");
    clickedElementDOM.style.opacity = "1";
    DOMEl.id = '';
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

export function DISABLE_SCROLL() {
    viewDOMElement.classList.add("remove-scrolling");
}

function enable_scroll() {
    viewDOMElement.classList.remove("remove-scrolling");
}

export function CLOSE_MODAL(clickListeners, element, noClick = false) {
    if (noClick === false) {
        for(let i = 0; i < clickListeners.length; i++) {
            clickListeners[i].addEventListener('click', function() {
                SET_INNER_HTML_VALUE({set: element, to: 'clear'});
                enable_scroll();
            });
        }
    } else {
        SET_INNER_HTML_VALUE({set: element, to: 'clear'});
        enable_scroll();
    }
}

export function ANIMATE_FADE_IN(DOMEl) {
    for(let i = 0; i < DOMEl.length; i++) {
        DOMEl[i].style.animationDelay = i/15+"s";
    }
}

export function HAS_INTERNET_CONNECTION() {
    const online = window.navigator.onLine;
    return online;
}

export function REFRESH_APPLICATION() {
    location.reload();
}

export function PRINT_CURRENT_DATE() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const printedDate = year + '-' + ('0' + month).slice(-2) + '-' + ('0' + day).slice(-2);

    return printedDate;
}

export function PRINT_TIME_ONE_HOUR_AHEAD() {
    const date = new Date();
    let hour = date.getHours() + 1;
    let minute = date.getMinutes();
    if (hour >= 23) {
        hour = 23;
        minute = 59;
    }
    const printedTime = ('0' + hour).slice(-2) + ":" + ('0' + minute).slice(-2);
    
    return printedTime;
}

export function GET_LANGUAGE() {
    return 'en-US';
}

export function MICROPHONE_STOP_LISTEN(recognition, microphoneDOMElement) {
    recognition.stop();

    if (microphoneDOMElement.classList.contains('listen')) {
        microphoneDOMElement.classList.remove('listen');
    }   
}