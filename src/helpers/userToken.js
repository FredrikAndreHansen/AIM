import { removeLoading } from "../controller/loadController.js";
import { setViewSignIn } from "../controller/signInController.js";
import { setViewIndex } from "../controller/indexController.js";
import { displayErrorMessage } from "../controller/errorController.js";

export function createToken(userId) {
    localStorage.setItem("AIMNomadToken", userId);
    setViewIndex();
}

export function removeToken() {
    if (localStorage.getItem("AIMNomadToken")) {
        localStorage.removeItem("AIMNomadToken");
        setViewSignIn();
    } else {
        displayErrorMessage(`Oops, something went wrong!<br>Please try again later`);
        removeLoading();
    }
}