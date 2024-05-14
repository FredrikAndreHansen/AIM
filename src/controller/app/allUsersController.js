export class AllUsersController {

    constructor(loadDependencies, handlerController, encryptDependencies, helpers, views, individualUserController, usersModel, individualUserModel) {
        this.loadDependencies = loadDependencies;
        this.handlerController = handlerController;
        this.encryptDependencies = encryptDependencies;
        this.helpers = helpers;
        this.views = views;
        this.individualUserController = individualUserController;
        this.usersModel = usersModel;
        this.individualUserModel = individualUserModel;
    
    }

    setView(displayInTeam = false, teamInfo = false) {
        this.usersModel.checkIfAnyUsersAreBlocked(teamInfo).then((hasBlockedUsers) => {
            this.#generateOutput(hasBlockedUsers, displayInTeam);

            this.#displayUsers({searchQuery: '', onlyDisplayBlockedUsers: false, displayInTeam: displayInTeam, teamInfo: teamInfo});

            this.#searchUsers(displayInTeam, teamInfo);

            this.#searchByVoiceOnClick(displayInTeam, teamInfo);

            this.#toggleAllOrBlockedUsers(hasBlockedUsers, displayInTeam, teamInfo);

            this.#goBackToIndividualTeamPage(displayInTeam, teamInfo);
        });
    }

    #generateOutput(hasBlockedUsers, displayInTeam) {
        return this.helpers.SET_INNER_HTML_VALUE({set: this.views.viewDOMElement, to: this.views.usersView(hasBlockedUsers, displayInTeam)});
    }

    #displayUsers(input) {
        const { searchQuery, onlyDisplayBlockedUsers, displayInTeam, teamInfo } = input;

        this.usersModel.getUsers({searchQuery: searchQuery, onlyDisplayBlockedUsers: onlyDisplayBlockedUsers, displayInTeam: displayInTeam, teamId: teamInfo?.teamId}).then(res => {
            this.#outputAllUsers(res);
            
            this.#getIndividualUser(displayInTeam, teamInfo);
        });
    }

    #outputAllUsers(userInfo) {
        const userListDOMElement = document.querySelector('#user-list');
        this.helpers.SET_INNER_HTML_VALUE({set: userListDOMElement, to: userInfo});

        const allUsersDOMElement = document.querySelectorAll("#all-users");
        this.helpers.ANIMATE_FADE_IN(allUsersDOMElement);
    }

    #getIndividualUser(displayInTeam, teamInfo) {
        const allUsersDOMElement = document.querySelectorAll("#all-users");

        allUsersDOMElement.forEach((getIndividualUser) => {
            
            getIndividualUser.addEventListener('click', () => {
                
                this.loadDependencies.displayLoading();
                const userId = getIndividualUser.getAttribute('data-id');
                
                this.helpers.SALT().then((salt) => {
                    const decrypt = this.encryptDependencies.decipher(salt);
                    const decryptedId = decrypt(userId);
                    
                    this.individualUserModel.getIndividualUser(decryptedId).then(res => {
                        const userName = res[0];
                        const company = res[1];
                        const userIsBlocked = res[2];
                        
                        this.individualUserController.setView(userId, userName, company, userIsBlocked, displayInTeam, teamInfo);
                    });
                })
            })
        });
    }

    #searchByVoiceOnClick(displayInTeam, teamInfo) {
        const microphoneDOMElement = document.querySelector('.microphone-icon');

        microphoneDOMElement.addEventListener('click', () => {
            if (!microphoneDOMElement.classList.contains('listen')) {
                this.usersModel.searchByVoice(microphoneDOMElement).then((searchQuery) => {
                    try {
                        this.#displayUsers({
                            searchQuery: searchQuery, 
                            onlyDisplayBlockedUsers: false,
                            displayInTeam: displayInTeam,
                            teamInfo: teamInfo
                        });
                    } catch(error) {
                        this.handlerController.displayMessage({message: error, isError: true});
                    }
                });
            }
        });
    }
    
    #searchUsers(displayInTeam, teamInfo) {
        const searchUserDomElement = document.querySelector('#search-user');
        searchUserDomElement.addEventListener('input', () => {
            this.#getUsers(searchUserDomElement, displayInTeam, teamInfo);
        });

        const btnCutLeftDomElement = document.querySelector('.btn-cut-left-blue');
        btnCutLeftDomElement.addEventListener('click', () => {
            this.#getUsers(searchUserDomElement, displayInTeam, teamInfo);
        });
    }

    #getUsers(searchUserDomElement, displayInTeam, teamInfo) {
        try {
            this.#displayUsers({
                searchQuery: this.helpers.GET_DOM_VALUE(searchUserDomElement), 
                onlyDisplayBlockedUsers: false,
                displayInTeam: displayInTeam,
                teamInfo: teamInfo
            });
        } catch(error) {
            this.handlerController.displayMessage({message: error, isError: true});
        }
    }

    #toggleAllOrBlockedUsers(hasBlockedUsers, displayInTeam, teamInfo) {
        if (hasBlockedUsers === false) {
            return;
        }

        const hasBlockedUsersBtnDOMElement = document.querySelector('#has-blocked-users-button');
        let toggleUsers = false;

        hasBlockedUsersBtnDOMElement.addEventListener('click', () => {
            toggleUsers = this.#toggleFilterUsersBlockedOrAllButton(toggleUsers, hasBlockedUsersBtnDOMElement);

            this.#displayUsers({
                searchQuery: '', 
                onlyDisplayBlockedUsers: toggleUsers,
                displayInTeam: displayInTeam,
                teamInfo: teamInfo
            });
        });
    }

    #toggleFilterUsersBlockedOrAllButton(toggleUsers, hasBlockedUsersBtnDOMElement) {
        const searchUserDomElement = document.querySelector('#search-user');
        this.helpers.CLEAR_DOM_VALUE(searchUserDomElement);

        if (toggleUsers === true) {
            hasBlockedUsersBtnDOMElement.innerHTML = '<img class="inside-btn-icon-image" src="../../../graphic/userBlockIcon.svg" />FILTER BY BLOCKED USERS';
        } else {
            hasBlockedUsersBtnDOMElement.innerHTML = '<img class="inside-btn-icon-image" src="../../../graphic/userIcon.svg" />SHOW ALL USERS';
        }

        return !toggleUsers;
    }

    #goBackToIndividualTeamPage(displayInTeam, teamInfo) {
        if(displayInTeam === true) {
            const backArrowIconDOMElement = document.querySelector('.backarrow-icon');

            backArrowIconDOMElement.addEventListener('click', () => {
                this.helpers.initApp('teams', teamInfo);
            });
        }
   }

}