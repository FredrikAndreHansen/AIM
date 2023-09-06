import { popupDOMElement } from "../index.js";
import { UsersModel } from "../model/usersModel.js";
import { SuccessController } from "./successController.js";
import { UsersController } from "./usersController.js";
import { individualUserView } from "../view/individualUserView.js";
import { AuthHelper } from "../helpers/auth.js";

const usersModel = new UsersModel();
const successController = new SuccessController();

export class IndividualUserController {

    getUser(userId, userName, company, isBlocked) {
        const authHelper = new AuthHelper();
        authHelper.validateIfLoggedIn();

        popupDOMElement.innerHTML = individualUserView({
            userName: userName, 
            company: company, 
            isBlocked: isBlocked
        });

        const errorBoxContainerDomElement = document.querySelector('.error-box-container');
        const exitIconDOMElement = document.querySelector('.exit-icon');
        const usersController = new UsersController();

        document.addEventListener('touchstart', function(e) {e.preventDefault()}, false);
        document.addEventListener('touchmove', function(e) {e.preventDefault()}, false);

        // Exit the user
        exitIconDOMElement.addEventListener('click', function() {
            popupDOMElement.innerHTML = '';
        });

        errorBoxContainerDomElement.addEventListener('click', function() {
            popupDOMElement.innerHTML = '';
        });

        //Toggle user block
        const userBlockBtnDOMEl = document.querySelector(`${isBlocked === true ? '#user-unblock-button' : '#user-block-button'}`);
        userBlockBtnDOMEl.addEventListener('click', function() {
            usersModel.toggleUserBlock({
                userId: userId,
                blockUser: !isBlocked
            });
            successController.displaySuccessMessage(`${userName} has been ${isBlocked === true ? 'unblocked' : 'blocked'}!`);
            usersController.setViewUsers();
        });

    }

}