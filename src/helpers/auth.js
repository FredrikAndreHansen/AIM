import { SignInModel } from "../model/signInModel.js";
import { SignInController } from "../controller/signInController.js";
import { IndexController } from "../controller/indexController.js";
import { ErrorController } from "../controller/errorController.js";
import { EncryptHelper } from "./encrypt.js";
import { SALT, TRIMSTRING, PARSESTRING } from "./helpers.js";

const encryptHelper = new EncryptHelper();

export class AuthHelper {

    createToken(userId, email, password) {
        SALT().then((salt) => {
            // Encrypt values
            const encrypt = encryptHelper.cipher(salt);
            const encryptedUserId = encrypt(userId);
            const encryptedEmail = encrypt(email);
            const encryptedPassword = encrypt(password);
            const userValues = [encryptedUserId, encryptedEmail, encryptedPassword];
            localStorage.setItem("AIMNomadToken", JSON.stringify(userValues));
            // Initialize classes
            const indexController = new IndexController();
            indexController.setViewIndex();
        });
    }

    removeToken() {
        // Initialize classes
        const signInController = new SignInController();
        const errorController = new ErrorController();

        // Sign out from Firebase
        firebase.auth().signOut().then(() => {
        }).catch((error) => {
            errorController.displayErrorMessage(error);
        });

        if (localStorage.getItem("AIMNomadToken")) {
            localStorage.removeItem("AIMNomadToken");
            signInController.setViewSignIn();
        } else {
            errorController.displayErrorMessage(`Oops, something went wrong!`);
            signInController.setViewSignIn();
        }
    }

    validateIfLoggedIn() {
        // Validate and parse localstorage
        if (localStorage.getItem("AIMNomadToken")) {
            const token = PARSESTRING(localStorage.getItem('AIMNomadToken'));
            const [userId, email, password] = token.split(',');

            const userIdTrim = TRIMSTRING(userId);
            const emailTrim = TRIMSTRING(email);
            const passwordTrim = TRIMSTRING(password);

            // Decrypt values and validate
            const dbRef = firebase.database().ref();
            SALT().then((salt) => {
                // Decrypt values
                const decrypt = encryptHelper.decipher(salt);
                const decryptedUserId = decrypt(userIdTrim);
                const decryptedEmail = decrypt(emailTrim);
                const decryptedPassword = decrypt(passwordTrim);

                dbRef.child("users").child(decryptedUserId).get().then((snapshot) => {
                    if (snapshot.exists()) {
                        // Check if the session is expired in firebase, if the usersession is expired then log the user back in again
                        firebase.auth().onAuthStateChanged((user) => {
                            if (!user) {
                                // If the firebase session is lost then retrieve it if the user has the token
                                firebase.auth().signInWithEmailAndPassword(decryptedEmail, decryptedPassword)
                                .then((_) => {
                                })
                            }
                        });
                    } else {
                        this.removeToken();
                    }   
                });
            })
        } else {
            this.removeToken();
        }
    }

}