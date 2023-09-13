import { SignInController } from "../controller/signedOut/signInController.js";
import { HandlerController } from "../controller/handlers/handlerController.js";
import { EncryptHelper } from "./encrypt.js";
import { initApp } from "../config/init.js";
import { SALT, TRIMSTRING, PARSESTRING, GET_AUTH, GET_DB_REFERENCE, GET_DB_USERS_INFO, IF_EXISTS, GET_TOKEN, ADD_TOKEN, REMOVE_TOKEN } from "./helpers.js";

const encryptHelper = new EncryptHelper();

export class AuthHelper {

    constructor(handlerController, encryptHelper) {
        this.handlerController = handlerController;
        this.encryptHelper = encryptHelper;
    }

    createToken(userId, email, password) {
        SALT().then((salt) => {
            const encrypt = encryptHelper.cipher(salt);
            const encryptedUserId = encrypt(userId);
            const encryptedEmail = encrypt(email);
            const encryptedPassword = encrypt(password);
            const userValues = [encryptedUserId, encryptedEmail, encryptedPassword];

            ADD_TOKEN(userValues);

            initApp();
        });
    }

    removeToken() {
        const signInController = new SignInController();
        const handlerController = new HandlerController();

        // Sign out from Firebase
        GET_AUTH.signOut().then(() => {
        }).catch((error) => {
            handlerController.displayMessage({message: error, isError: true});
        });

        if (GET_TOKEN()) {
            REMOVE_TOKEN();
            signInController.setView();
        } else {
            signInController.setView();
        }
    }

    validateIfLoggedIn() {
        if (GET_TOKEN()) {
            const token = PARSESTRING(GET_TOKEN());
            const [userId, email, password] = token.split(',');

            const userIdTrim = TRIMSTRING(userId);
            const emailTrim = TRIMSTRING(email);
            const passwordTrim = TRIMSTRING(password);

            const dbRef = GET_DB_REFERENCE();
            SALT().then((salt) => {
                const decrypt = encryptHelper.decipher(salt);
                const decryptedUserId = decrypt(userIdTrim);
                const decryptedEmail = decrypt(emailTrim);
                const decryptedPassword = decrypt(passwordTrim);

                GET_DB_USERS_INFO(dbRef, decryptedUserId).then((snapshot) => {
                    if (IF_EXISTS(snapshot)) {
                        // Check if the session is expired in firebase, if the usersession is expired then log the user back in again
                        GET_AUTH.onAuthStateChanged((user) => {
                            if (!user) {
                                GET_AUTH.signInWithEmailAndPassword(decryptedEmail, decryptedPassword)
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