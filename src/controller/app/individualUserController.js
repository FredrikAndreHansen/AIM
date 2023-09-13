import { popupDOMElement } from "../../index.js";
import { individualUserView } from "../../view/app/individualUserView.js";
import { initApp } from "../../config/init.js";
import { SET_INNER_HTML_VALUE, CLOSE_MODAL } from "../../helpers/helpers.js";

export class IndividualUserController {

    constructor(handlerController, usersController, authHelper, individualUserModel) {
        this.handlerController = handlerController; 
        this.usersController = usersController;
        this.authHelper = authHelper;
        this.individualUserModel = individualUserModel;
    }

    setView(userId, userName, company, isBlocked) {
        this.authHelper.validateIfLoggedIn();

        this.#generateOutput(userName, company, isBlocked);

        this.#toggleUserBlock(userId, userName, isBlocked);

        const errorBoxContainerDomElement = document.querySelector('.error-box-container');
        const exitIconDOMElement = document.querySelector('.exit-icon');
        CLOSE_MODAL([errorBoxContainerDomElement, exitIconDOMElement], popupDOMElement);
    }

    #generateOutput(userName, company, isBlocked) {
        SET_INNER_HTML_VALUE({set: popupDOMElement, to: individualUserView({
            userName: userName, 
            company: company, 
            isBlocked: isBlocked
        })});
    }

    #toggleUserBlock(userId, userName, isBlocked) {
        const userBlockBtnDOMEl = document.querySelector(`${isBlocked === true ? '#user-unblock-button' : '#user-block-button'}`);

        userBlockBtnDOMEl.addEventListener('click', () => {
            this.individualUserModel.toggleUserBlock({
                userId: userId,
                blockUser: !isBlocked
            });
            this.handlerController.displayMessage({message: `${userName} has been ${isBlocked === true ? 'unblocked' : 'blocked'}!`, isError: false});

            initApp('users');
        });
    }

}