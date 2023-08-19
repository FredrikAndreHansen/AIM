import { ErrorController } from "../controller/errorController.js"

export function SALT() {
    // Initialize classes
    const errorController = new ErrorController();
    // Get salt from database
    return new Promise(function(resolve, reject) {
        const dbRef = firebase.database().ref();
        dbRef.child("salt").get().then((snapshot) => {
            if (snapshot.exists()) {
                resolve(snapshot.val());
            } else {
                errorController.displayErrorMessage("No data available!");
                reject();
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

export const REGEX = new RegExp('[a-zA-Z0-9]+@[a-zA-Z]+\.[a-zA-Z]{2,3}');