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

    setView(teamName, members, invitedUsers, isAdmin, config, teamId, settings) {
        this.authDependencies.validateIfLoggedIn();

        this.#generateOutput(teamName, members, invitedUsers, isAdmin, config, teamId, settings);
    }

    #generateOutput(teamName, members, invitedUsers, isAdmin, config, teamId, settings) {
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
                
            this.#goToSettings(teamName, members, invitedUsers, isAdmin, config, teamId, settings);
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

    #goToSettings(teamName, members, invitedUsers, isAdmin, config, teamId, settings) {
        const cogWeelIconDomElement = document.querySelector('.cogwheel-icon');

        const individualTeamObject = this.#createIndividualTeamObject(teamName, members, invitedUsers, isAdmin, config, teamId);

        cogWeelIconDomElement.addEventListener('click', () => {
            this.loadDependencies.displayLoading();

            if(isAdmin === true) {
                this.#adminSettings(individualTeamObject);
            } else {
                this.#userSettings(individualTeamObject);
            }

            this.loadDependencies.removeLoading();
        });

        if (settings === 'settings') {
            this.#adminSettings(individualTeamObject);  
        }
    }

    #adminSettings(individualTeamObject) {
        this.helpers.SET_INNER_HTML_VALUE({set: this.views.viewDOMElement, to: this.views.adminSettingsView(individualTeamObject.teamName, individualTeamObject.config)});

        this.#goBackToIndividualTeam(individualTeamObject);

        this.#renameTeam(individualTeamObject);

        this.#toggleConfigurationItem(individualTeamObject);

        this.#deleteTeam(individualTeamObject);
    }

    #userSettings(individualTeamObject) {
        this.individualTeamModel.getTeamAdminName(individualTeamObject.teamId).then((adminUser) => {
            this.helpers.SET_INNER_HTML_VALUE({set: this.views.viewDOMElement, to: this.views.userSettingsView(individualTeamObject.teamName, adminUser)});

            this.#goBackToIndividualTeam(individualTeamObject);
    
            this.#leaveTeam(individualTeamObject);
        });
    }

    #toggleConfigurationItem(individualTeamObject) {
        const allowAddUsersDOMElement = document.querySelector('#allowAddUsers');
        const allowKickUsersDOMElement = document.querySelector('#allowKickUsers');
        const allowRemoveInvitedUsersDOMElement = document.querySelector('#allowRemoveInvitedUsers');
        const allowScheduleMeetingDOMElement = document.querySelector('#allowScheduleMeeting');
        const allConfigElements = [allowAddUsersDOMElement, allowKickUsersDOMElement, allowRemoveInvitedUsersDOMElement, allowScheduleMeetingDOMElement];

        for(let i = 0; i < allConfigElements.length; i++) {
            allConfigElements[i].addEventListener('click', () => {
                this.individualTeamModel.toggleTeamConfiguration(individualTeamObject.teamId, allConfigElements[i].id).then((updatedObject) => {
                    this.#getUpdatedObjectAndRefreshPage(updatedObject, individualTeamObject);
                });
            });
        }
    }

    #goBackToIndividualTeam(individualTeamObject) {
        const backArrowIconDOMElement = document.querySelector('.backarrow-icon');

        backArrowIconDOMElement.addEventListener('click', () => {
            this.helpers.initApp('teams', individualTeamObject);
        });
    }

    #createIndividualTeamObject(teamName, members, invitedUsers, isAdmin, config, teamId) {
        return {
            teamName: teamName,
            members: members,
            invitedUsers: invitedUsers,
            isAdmin: isAdmin,
            config: config,
            teamId: teamId
        };
    }

    #renameTeam(individualTeamObject) {
        const changeTeamNameDOMElement = document.querySelector('#change-team-name');

        changeTeamNameDOMElement.addEventListener('click', () => {
            const teamNameDOMElement = document.querySelector('#team-name');
            const teamName = teamNameDOMElement.value;
            const teamId = individualTeamObject.teamId;
            
            if (this.helpers.VALIDATE_USER_INPUT({name: teamName}) && this.helpers.CANT_BE_THE_SAME_NAME(teamName, individualTeamObject.teamName, 'team')) {
                this.individualTeamModel.renameTeam(teamId, teamName).then((updatedObject) => {
                    this.#getUpdatedObjectAndRefreshPage(updatedObject, individualTeamObject);
                });
            }
        });
    }

    #getUpdatedObjectAndRefreshPage(updatedObject, individualTeamObject) {
        const updatedIndividualTeamObject = this.#createIndividualTeamObject(
            updatedObject.teamName, 
            updatedObject.members, 
            individualTeamObject.invitedUsers, 
            individualTeamObject.isAdmin, 
            updatedObject.configuration, 
            individualTeamObject.teamId
        );

        this.helpers.initApp('teams', updatedIndividualTeamObject, 'settings');
    }

    #leaveTeam(individualTeamObject) {
        const leaveTeamButtonDOMElement = document.querySelector('#leave-team-button');
        const teamId = individualTeamObject.teamId;
        const teamName = individualTeamObject.teamName;

        leaveTeamButtonDOMElement.addEventListener('click', () => {
            this.handlerDependencies.confirmMessage(`Are you sure you want to leave <span style="font-weight: bold;">${teamName}</span>?`, { btnText: 'LEAVE', btnColor: '-red' }).then((confirm) => {
                if (confirm === true) {
                    this.individualUserModel.removeUserFromTeam(false, teamId, false, false).then(() => {
                        this.helpers.REFRESH_APPLICATION();
                    });
                }
            });
        });
    }

    #deleteTeam(individualTeamObject) {
        const deleteTeamButtonDOMElement = document.querySelector('#delete-team-button');
        const teamId = individualTeamObject.teamId;
        const teamName = individualTeamObject.teamName;

        deleteTeamButtonDOMElement.addEventListener('click', () => {
            this.handlerDependencies.confirmMessage(`Are you sure you want to delete <span style="font-weight: bold;">${teamName}</span>?`, { btnText: 'DELETE', btnColor: '-red' }).then((confirm) => {
                if (confirm === true) {
                    this.individualTeamModel.removeAllUsersFromTeamFromDB(teamId, 'RemoveInvitedUsers').then(() => {
                        this.individualTeamModel.removeAllUsersFromTeamFromDB(teamId).then(() => {
                            this.individualTeamModel.deleteTeam(teamId).then(() => {
                                this.helpers.REFRESH_APPLICATION();
                            });
                        });
                    });
                }
            });
        });
    }

}