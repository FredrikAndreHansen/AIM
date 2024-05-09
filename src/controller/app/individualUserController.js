export class IndividualUserController {

    constructor(authDependencies, encryptDependencies, helpers, views, individualUserModel, individualTeamModel) {
        this.authDependencies = authDependencies;
        this.encryptDependencies = encryptDependencies;
        this.helpers = helpers;
        this.views = views;
        this.individualUserModel = individualUserModel;
        this.individualTeamModel = individualTeamModel;
    }

    setView(userId, userName, company, isBlocked, displayInTeam, teamInfo, kickUserFromTeam = false) {
        this.authDependencies.validateIfLoggedIn();

        this.#generateOutput(userName, company, isBlocked, displayInTeam, kickUserFromTeam);

        if (kickUserFromTeam === false) {
            this.#toggleUserBlock(userId, userName, isBlocked, displayInTeam);
            this.#inviteUserToTeam(userId, userName, displayInTeam, teamInfo, isBlocked);
        } else {
            this.#kickUserFromTeam(userId, teamInfo);
        }

        const errorBoxContainerDomElement = document.querySelector('.error-box-container');
        const exitIconDOMElement = document.querySelector('.exit-icon');
        this.helpers.CLOSE_MODAL([errorBoxContainerDomElement, exitIconDOMElement], this.views.popupDOMElement);
    }

    #generateOutput(userName, company, isBlocked, displayInTeam, kickUserFromTeam) {
        this.helpers.SET_INNER_HTML_VALUE({set: this.views.popupDOMElement, to: this.views.individualUserView({
            userName: userName, 
            company: company, 
            isBlocked: isBlocked,
            displayInTeam: displayInTeam,
            kickUserFromTeam: kickUserFromTeam
        })});
        this.helpers.DISABLE_SCROLL();
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

    #inviteUserToTeam(userId, userName, displayInTeam, teamInfo, isBlocked) {
        if (isBlocked === false) {
            const userInviteToTeamBtnDOMElement = document.querySelector('#user-invite-to-team-button');

            userInviteToTeamBtnDOMElement.addEventListener('click', () => {
                if (displayInTeam === true) {
                    // Invite from the team
                    this.individualUserModel.inviteUserToTeam(userId, userName, teamInfo).then(() => {

                        this.helpers.SALT().then((salt) => {
                            const decrypt = this.encryptDependencies.decipher(salt);
                            const encryptedUserId = decrypt(userId);
                            teamInfo.invitedUsers.push(encryptedUserId);
                            this.helpers.initApp('teams', teamInfo);
                        });
                    });
                } else {
                    // Invite through the user menu
                    this.helpers.CLOSE_MODAL(userInviteToTeamBtnDOMElement, this.views.popupDOMElement, true);
                    this.helpers.initApp('teams', teamInfo, false, { userId: userId, userName: userName });
                }
            });
        }
    }

    #kickUserFromTeam(userId, teamInfo) {
        const userKickBtnDOMElement = document.querySelector('#user-kick-button');

        userKickBtnDOMElement.addEventListener('click', () => {
            this.individualUserModel.removeUserFromTeam(userId, teamInfo, 'KICK').then(() => {

                this.individualTeamModel.getIndividualTeam(teamInfo).then(res => {
                    const { team, isAdmin } = res;
                    const teamName = team.teamName;
                    const members = team.members;
                    const config = team.configuration;
                    const invitedUsers = Object.values(team.invitedUsers);
    
                    this.helpers.initApp('teams', {
                        teamName: teamName, 
                        members: members, 
                        invitedUsers: invitedUsers, 
                        isAdmin: isAdmin,
                        config: config, 
                        teamId: teamInfo
                    });
                });
            });
        });
    }

}