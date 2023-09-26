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
        this.usersModel.checkIfAnyUsersAreBlocked().then((hasBlockedUsers) => {
            this.#generateOutput(hasBlockedUsers, displayInTeam);

            this.#displayUsers({searchQuery: '', onlyDisplayBlockedUsers: false, displayInTeam: displayInTeam, teamInfo: teamInfo});

            this.#searchUsers(displayInTeam);

            this.#filterByBlockedUsers(hasBlockedUsers, displayInTeam);

            this.#goBackToIndividualTeamPage(displayInTeam, teamInfo);
        });
    }

    #generateOutput(hasBlockedUsers, displayInTeam) {
        return this.helpers.SET_INNER_HTML_VALUE({set: this.views.viewDOMElement, to: this.views.usersView(hasBlockedUsers, displayInTeam)});
    }

    #displayUsers(input) {
        const { searchQuery, onlyDisplayBlockedUsers, displayInTeam, teamInfo } = input;

        this.usersModel.getUsers({searchQuery: searchQuery, onlyDisplayBlockedUsers: onlyDisplayBlockedUsers, displayInTeam: displayInTeam, teamId: teamInfo.teamId}).then(res => {
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

    #searchUsers(displayInTeam) {
        const searchUserDomElement = document.querySelector('#search-user');
        searchUserDomElement.addEventListener('input', () => {
            this.#getUsers(searchUserDomElement, displayInTeam);
        });

        const btnCutLeftDomElement = document.querySelector('.btn-cut-left-blue');
        btnCutLeftDomElement.addEventListener('click', () => {
            this.#getUsers(searchUserDomElement, displayInTeam);
        });
    }

    #getUsers(searchUserDomElement, displayInTeam) {
        try {
            this.#displayUsers({
                searchQuery: this.helpers.GET_DOM_VALUE(searchUserDomElement), 
                onlyDisplayBlockedUsers: false,
                displayInTeam: displayInTeam
            });
        } catch(error) {
            this.handlerController.displayMessage({message: error, isError: true});
        }
    }

    #filterByBlockedUsers(hasBlockedUsers, displayInTeam) {
        if (hasBlockedUsers === false) {
            return;
        }

        const hasBlockedUsersBtnDOMElement = document.querySelector('#has-blocked-users-button');
        hasBlockedUsersBtnDOMElement.addEventListener('click', () => {
            this.#displayUsers({
                searchQuery: '', 
                onlyDisplayBlockedUsers: true,
                displayInTeam: displayInTeam
            });
        });
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