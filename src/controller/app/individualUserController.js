import { popupDOMElement } from "../../index.js";
import { IndividualUserModel } from "../../model/app/individualUserModel.js";
import { HandlerController } from "../handlers/handlerController.js";
import { UsersController } from "./usersController.js";
import { individualUserView } from "../../view/app/individualUserView.js";
import { AuthHelper } from "../../helpers/auth.js";
import { SET_INNER_HTML_VALUE, CLOSE_MODAL } from "../../helpers/helpers.js";

export class IndividualUserController {

    setView(userId, userName, company, isBlocked) {
        const authHelper = new AuthHelper();
        authHelper.validateIfLoggedIn();

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
        const usersController = new UsersController();
        const individualUserModel = new IndividualUserModel();
        const handlerController = new HandlerController();

        const userBlockBtnDOMEl = document.querySelector(`${isBlocked === true ? '#user-unblock-button' : '#user-block-button'}`);

        userBlockBtnDOMEl.addEventListener('click', function() {
            individualUserModel.toggleUserBlock({
                userId: userId,
                blockUser: !isBlocked
            });
            handlerController.displayMessage({message: `${userName} has been ${isBlocked === true ? 'unblocked' : 'blocked'}!`, isError: false});
            usersController.setView();
        });
    }



}