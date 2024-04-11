export class IndividualTeamController {

    constructor(handlerDependencies, authDependencies, loadDependencies, encryptDependencies, helpers, views, individualTeamModel, individualUserModel, allUsersController, individualUserController) {
        this.handlerDependencies = handlerDependencies;
        this.authDependencies = authDependencies;
        this.loadDependencies = loadDependencies;
        this.encryptDependencies = encryptDependencies;
        this.helpers = helpers;
        this.views = views;
        this.individualTeamModel = individualTeamModel;
        this.individualUserModel = individualUserModel;
        this.allUsersController = allUsersController;
        this.individualUserController = individualUserController;
    }

    setView(teamName, members, invitedUsers, isAdmin, config, teamId) {
        this.authDependencies.validateIfLoggedIn();

        this.#generateOutput(teamName, members, invitedUsers, isAdmin, config, teamId);
    }

    #generateOutput(teamName, members, invitedUsers, isAdmin, config, teamId) {
        this.individualTeamModel.generateTeamUsers(members, invitedUsers, config, teamId).then((res) => {
            const memberQuantity = res[2];
            const membersOutput = res[0];

            const invitedUsersQuantity = res[3];
            const invitedUsersOutput = res[1];

            this.helpers.SET_INNER_HTML_VALUE({set: this.views.viewDOMElement, to: this.views.individualTeamView(teamName, memberQuantity, invitedUsersQuantity, isAdmin, config)});

            const userListDOMElement = document.querySelector('#user-list');
            this.helpers.SET_INNER_HTML_VALUE({set: userListDOMElement, to: membersOutput});

            const invitedUserListDOMElement = document.querySelector('#invited-user-list');
            this.helpers.SET_INNER_HTML_VALUE({set: invitedUserListDOMElement, to: invitedUsersOutput});

            const allUsersDOMElement = document.querySelectorAll("#all-users");
            this.helpers.ANIMATE_FADE_IN(allUsersDOMElement);

            this.#goBackToTeamsPage();

            this.#inviteUsers(teamName, members, invitedUsers, isAdmin, config, teamId);

            this.#kickUsers(members, invitedUsers, isAdmin, config, teamId);
            
            this.#goToSettings(teamName, members, invitedUsers, isAdmin, config, teamId);
        });
    }

    #goBackToTeamsPage() {
         const backArrowIconDOMElement = document.querySelector('.backarrow-icon');

         backArrowIconDOMElement.addEventListener('click', () => {
            this.helpers.initApp('teams');
         });
    }

    #inviteUsers(teamName, members, invitedUsers, isAdmin, config, teamId) {
        if (isAdmin === true || config.allAllowedToAddUsers === true) {
            const inviteMembersBtnDOMElement = document.querySelector('#invite-members-button');

            inviteMembersBtnDOMElement.addEventListener('click', () => {
                this.#generateInviteUsersOutput(teamName, members, invitedUsers, isAdmin, config, teamId);
            });
        }
    }

    #generateInviteUsersOutput(teamName, members, invitedUsers, isAdmin, config, teamId) {
        this.loadDependencies.displayLoading();

        const teamInfo = {
            teamName: teamName,
            members: members,
            invitedUsers: invitedUsers,
            isAdmin: isAdmin,
            config: config,
            teamId: teamId
        };
        this.allUsersController.setView(true, teamInfo);
    }

    #kickUsers(members, invitedUsers, isAdmin, config, teamId) {
        const allUsersDOMEElement = document.querySelectorAll('#all-users');

        allUsersDOMEElement.forEach(getIndividualUser => {
            getIndividualUser.addEventListener('click', () => {
                const individualUserId = getIndividualUser.getAttribute('data-id');

                this.individualTeamModel.checkPermissionToKickUsers(members, invitedUsers, isAdmin, config, teamId, individualUserId).then((kanKick) => {

                    if (kanKick === true) {
                        this.helpers.SALT().then((salt) => {
                            const decrypt = this.encryptDependencies.decipher(salt);
                            const decryptedId = decrypt(individualUserId);

                            this.individualUserModel.getIndividualUser(decryptedId).then(res => {
                                const userName = res[0];
                                const company = res[1];
                                const userIsBlocked = res[2];
    
                                this.individualUserController.setView(decryptedId, userName, company, userIsBlocked, true, teamId, kanKick);
                            });
                        });
                    }
                });
            })
        });
    }

    #goToSettings(teamName, members, invitedUsers, isAdmin, config, teamId) {
        const cogWeelIconDomElement = document.querySelector('.cogwheel-icon');

        cogWeelIconDomElement.addEventListener('click', () => {
            this.loadDependencies.displayLoading();

            if(isAdmin === true) {
                this.#adminSettings(teamName, config, teamId);
            }

            this.#goBackToIndividualTeam(teamName, members, invitedUsers, isAdmin, config, teamId);

            this.loadDependencies.removeLoading();
        });
    }

    #adminSettings(teamName, config, teamId) {
        this.helpers.SET_INNER_HTML_VALUE({set: this.views.viewDOMElement, to: this.views.adminSettingsView(teamName, config)});

        this.#toggleConfigurationItem(teamName, config, teamId);
    }

    #toggleConfigurationItem(teamName, config, teamId) {
        const allowAddUsersDOMElement = document.querySelector('#allowAddUsers');
        const allowKickUsersDOMElement = document.querySelector('#allowKickUsers');
        const allowRemoveInvitedUsersDOMElement = document.querySelector('#allowRemoveInvitedUsers');
        const allowScheduleMeetingDOMElement = document.querySelector('#allowScheduleMeeting');
        const allConfigElements = [allowAddUsersDOMElement, allowKickUsersDOMElement, allowRemoveInvitedUsersDOMElement, allowScheduleMeetingDOMElement];

        for(let i = 0; i < allConfigElements.length; i++) {
            allConfigElements[i].addEventListener('click', () => {
                this.individualTeamModel.toggleTeamConfiguration(teamId, allConfigElements[i].id);
                //this.#adminSettings(teamName, config, teamId);
            });
        }
    }

    #goBackToIndividualTeam(teamName, members, invitedUsers, isAdmin, config, teamId) {
        const backArrowIconDOMElement = document.querySelector('.backarrow-icon');

        const individualTeamObject = {
            teamName: teamName,
            members: members,
            invitedUsers: invitedUsers,
            isAdmin: isAdmin,
            config: config,
            teamId: teamId
        }

        backArrowIconDOMElement.addEventListener('click', () => {
            this.helpers.initApp('teams', individualTeamObject);
        });
    }

}