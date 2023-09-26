export class IndividualUserController {

    constructor(authDependencies, helpers, views, individualUserModel) {
        this.authDependencies = authDependencies;
        this.helpers = helpers;
        this.views = views;
        this.individualUserModel = individualUserModel;
    }

    setView(userId, userName, company, isBlocked, displayInTeam, teamInfo) {
        this.authDependencies.validateIfLoggedIn();

        this.#generateOutput(userName, company, isBlocked, displayInTeam);

        this.#toggleUserBlock(userId, userName, isBlocked, displayInTeam);

        this.#inviteUserToTeam(userId, userName, displayInTeam, teamInfo);

        const errorBoxContainerDomElement = document.querySelector('.error-box-container');
        const exitIconDOMElement = document.querySelector('.exit-icon');
        this.helpers.CLOSE_MODAL([errorBoxContainerDomElement, exitIconDOMElement], this.views.popupDOMElement);
    }

    #generateOutput(userName, company, isBlocked, displayInTeam) {
        this.helpers.SET_INNER_HTML_VALUE({set: this.views.popupDOMElement, to: this.views.individualUserView({
            userName: userName, 
            company: company, 
            isBlocked: isBlocked,
            displayInTeam: displayInTeam
        })});
    }

    #toggleUserBlock(userId, userName, isBlocked, displayInTeam) {
        if (displayInTeam === false || isBlocked === true) {
            const userBlockBtnDOMEl = document.querySelector(`${isBlocked === true ? '#user-unblock-button' : '#user-block-button'}`);

            userBlockBtnDOMEl.addEventListener('click', () => {
                this.individualUserModel.toggleUserBlock({
                    userId: userId,
                    userName: userName,
                    blockUser: !isBlocked
                });

                this.helpers.initApp('users');
            });
        }
    }

    #inviteUserToTeam(userId, userName, displayInTeam, teamInfo) {
        const userInviteToTeamBtnDOMElement = document.querySelector('#user-invite-to-team-button');

        userInviteToTeamBtnDOMElement.addEventListener('click', () => {
            this.individualUserModel.inviteUserToTeam(userId, userName, teamInfo);

            this.helpers.initApp('teams', teamInfo);
        });
    }

}