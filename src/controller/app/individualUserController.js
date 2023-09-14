export class IndividualUserController {

    constructor(authDependencies, handlerDependencies, helpers, views, usersController, individualUserModel) {
        this.authDependencies = authDependencies;
        this.handlerDependencies = handlerDependencies; 
        this.helpers = helpers;
        this.views = views;
        this.usersController = usersController;
        this.individualUserModel = individualUserModel;
    }

    setView(userId, userName, company, isBlocked) {
        this.authDependencies.validateIfLoggedIn();

        this.#generateOutput(userName, company, isBlocked);

        this.#toggleUserBlock(userId, userName, isBlocked);

        const errorBoxContainerDomElement = document.querySelector('.error-box-container');
        const exitIconDOMElement = document.querySelector('.exit-icon');
        this.helpers.CLOSE_MODAL([errorBoxContainerDomElement, exitIconDOMElement], this.views.popupDOMElement);
    }

    #generateOutput(userName, company, isBlocked) {
        this.helpers.SET_INNER_HTML_VALUE({set: this.views.popupDOMElement, to: this.views.individualUserView({
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
            this.handlerDependencies.displayMessage({message: `${userName} has been ${isBlocked === true ? 'unblocked' : 'blocked'}!`, isError: false});

            this.helpers.initApp('users');
        });
    }

}