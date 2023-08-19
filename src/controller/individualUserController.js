import { popupDOMElement } from "../index.js";
import { individualUserView } from "../view/individualUserView.js";
import { AuthHelper } from "../helpers/auth.js";

export class IndividualUserController {

    getUser(userName, company) {
        // Validate
        const authHelper = new AuthHelper();
        authHelper.validateIfLoggedIn();

        popupDOMElement.innerHTML = individualUserView(userName, company);

        // Exit the user
        const errorBoxContainerDomElement = document.querySelector('.error-box-container');
        const exitIconDOMElement = document.querySelector('.exit-icon');

        document.addEventListener('touchstart', function(e) {e.preventDefault()}, false);
        document.addEventListener('touchmove', function(e) {e.preventDefault()}, false);

        exitIconDOMElement.addEventListener('click', function() {
            popupDOMElement.innerHTML = '';
        });

        errorBoxContainerDomElement.addEventListener('click', function() {
            popupDOMElement.innerHTML = '';
        });
    }

}