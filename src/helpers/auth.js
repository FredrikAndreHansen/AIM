import { LoadController } from "../controller/loadController.js";
import { SignInController } from "../controller/signInController.js";
import { IndexController } from "../controller/indexController.js";
import { ErrorController } from "../controller/errorController.js";

export class AuthHelper {

    createToken(userId) {
        localStorage.setItem("AIMNomadToken", userId);
        // Initialize classes
        const indexController = new IndexController();
        indexController.setViewIndex();
    }

    removeToken() {
        if (localStorage.getItem("AIMNomadToken")) {
            localStorage.removeItem("AIMNomadToken");
            const signInController = new SignInController();
            signInController.setViewSignIn();
        } else {
            // Initialize classes
            const loadController = new LoadController();
            const errorController = new ErrorController();
            errorController.displayErrorMessage(`Oops, something went wrong!<br>Please try again later`);
            loadController.removeLoading();
        }
    }

    validateIfLoggedIn() {
        const userId = localStorage.getItem('AIMNomadToken');
        const dbRef = firebase.database().ref();
    
        dbRef.child("users").child(userId).get().then((snapshot) => {
            if (!snapshot.exists()) {
                this.removeToken();
            }     
        });
    }

}