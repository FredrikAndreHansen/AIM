export class UsersModel {

    constructor(authDependencies, loadDependencies, handlerDependencies, encryptDependencies, helpers, views) {
        this.authDependencies = authDependencies;
        this.loadDependencies = loadDependencies;
        this.handlerDependencies = handlerDependencies;
        this.encryptDependencies = encryptDependencies;
        this.helpers = helpers;
        this.views = views;
    }
   
    async getUsers(displayArguments) {
        const { searchQuery = '', onlyDisplayBlockedUsers = false, displayInTeam = false, teamId = '' } = displayArguments;

        this.authDependencies.validateIfLoggedIn();

        const getAllUsers = this.helpers.GET_DB_ALL_USERS();

        const userId = this.helpers.GET_USER_ID();
        
        return await new Promise((resolve, reject) => {
            getAllUsers.on('value', (snapshot) => {
                const users = this.helpers.GET_VALUE(snapshot);
                
                this.helpers.SALT().then((salt) => {
                    const decrypt = this.encryptDependencies.decipher(salt);
                    const decryptedUserId = decrypt(userId);
                    const dbRef = this.helpers.GET_DB_REFERENCE();

                    this.helpers.GET_DB_USERS_INFO(dbRef, decryptedUserId).then((snapshot) => {
                        try {
                            if (this.helpers.IF_EXISTS(snapshot)) {
                                const user = this.helpers.GET_VALUE(snapshot);
                                const blockedUsers = user.blockedUsers;
                                const encrypt = this.encryptDependencies.cipher(salt);

                                const HTMLInput = this.#outputUsers(users, decryptedUserId, searchQuery, blockedUsers, encrypt, onlyDisplayBlockedUsers, displayInTeam, teamId);
   
                                this.loadDependencies.removeLoading();

                                resolve(HTMLInput);
                            } else {
                                reject(this.handlerDependencies.throwError("No data available!"));
                            }
                        } catch (error) {
                            this.handlerDependencies.displayMessage({message: error, isError: true});
                        }
                    })
                })
            });
        })
    }

    #outputUsers(users, userId, searchQuery, blockedUsers, encrypt, onlyDisplayBlockedUsers, displayInTeam, teamId) {
        let i = 0;
        let HTMLOutput = '';
        
        HTMLOutput += this.#getSearchOutputInfo(searchQuery);
        
        for (const key in users) {
            if (key === userId) { continue; }

            let userIsInvitedOrMember = false;
            if (displayInTeam === true) {

                const invitedTeams = Object.values(users[key].invitedTeams);
                for (let i = 0; i < invitedTeams.length; i++) {
                    if (invitedTeams[i].teamId === teamId) {
                        userIsInvitedOrMember = true;
                    }
                }

                const teams = Object.values(users[key].teams);
                for (let i = 0; i < teams.length; i++) {
                    if (teams[i] === teamId) {
                        userIsInvitedOrMember = true;
                    }
                }
            }
            if (userIsInvitedOrMember === true) { continue; }

            const blockedCurrentUser = users[key].blockedUsers;
            const userName = users[key].username;
            const company = users[key].company;

            if (this.#ifSearchIncludesValues(userName, company, searchQuery)) {
                    
                const encryptedKey = encrypt(key);

                HTMLOutput += this.#outputUserInfo({
                    outputUserId: encryptedKey,
                    outputUsers: users,
                    key: key,
                    blockedUsers: blockedUsers,
                    currentUserId: userId,
                    blockedCurrentUser: blockedCurrentUser,
                    onlyDisplayBlockedUsers: onlyDisplayBlockedUsers
                });
 
                i++;
            }
            if (i > 99) { break };
        }

        HTMLOutput += this.#getSearchOutputInfo(false, i);
        
        return HTMLOutput;
    }

    #getSearchOutputInfo(searchQuery, i = -1) {
        if (searchQuery !== '' && searchQuery !== false && i === -1) {
            return this.views.userSearchOutput(searchQuery);
        }

        if (i === 0) {
            return this.views.userSearchOutput();
        }

        return '';
    }

    #ifSearchIncludesValues(userName, company, searchQuery) {
        const formattedUserName = userName.toLowerCase();
        const formattedCompany = company.toLowerCase();
        const formattedSearchQuery = searchQuery.toLowerCase();

        if (formattedUserName.includes(formattedSearchQuery) || formattedCompany.includes(formattedSearchQuery)) {
            return true;
        } else {
            return false;
        }
    }

    #outputUserInfo(userData) {
        const { outputUserId, outputUsers, key, blockedUsers, currentUserId, blockedCurrentUser, onlyDisplayBlockedUsers } = userData;

        if (!this.helpers.CHECK_IF_BLOCKED_USERS_EXISTS(blockedCurrentUser, currentUserId)) {
            return '';
        }
        
        if (this.helpers.CHECK_IF_BLOCKED_USERS_EXISTS(blockedUsers, key)) {   
            if (onlyDisplayBlockedUsers == true){
                return '';
            }             
            return this.views.userOutputView(outputUserId, outputUsers, key, false);
        } else {
            return this.views.userOutputView(outputUserId, outputUsers, key, true);
        }
    }
  
    async checkIfAnyUsersAreBlocked(teamInfo) {

        const userId = this.helpers.GET_USER_ID();

        return await new Promise((resolve, reject) => {

            this.helpers.SALT().then((salt) => {
                const decrypt = this.encryptDependencies.decipher(salt); 
                const decryptedUserId = decrypt(userId);
                const dbRef = this.helpers.GET_DB_REFERENCE();

                this.helpers.GET_DB_USERS_INFO(dbRef, decryptedUserId).then((snapshot) => {
                    try {
                        if (this.helpers.IF_EXISTS(snapshot)) {
                            const user = this.helpers.GET_VALUE(snapshot);

                            const blockedUsers = user.blockedUsers;
                            if (teamInfo === false) {
                                resolve(this.helpers.IF_ANY_BLOCKED_USERS(blockedUsers));
                            } else {
                                this.helpers.GET_DB_INDIVIDUAL_TEAM_INFO(dbRef, teamInfo.teamId).then((snapshot) => {
                                    const teams = this.helpers.GET_VALUE(snapshot);
                                    const getTeams = Object.values(teams);
                                    const getInvitedUsers = Object.values(getTeams[1]);
                                    const getMembers = getTeams[2];

                                    resolve(this.#checkIfAnyBlockedUsersInTeam(getInvitedUsers, getMembers, blockedUsers));
                                });
                            }
                        } else {
                            reject(this.handlerDependencies.throwError("No data available!"));
                        }
                    } catch (error) {
                        reject(this.handlerDependencies.displayMessage({message: error, isError: true}));
                    }
                })
            })
        })
    }

    #checkIfAnyBlockedUsersInTeam(getInvitedUsers, getMembers, blockedUsers) {
        let remainingBlockedUsers = blockedUsers.length;

        for (let i = 0; i < blockedUsers.length; i++) {

            for (let ii = 0; ii < getInvitedUsers.length; ii++) {
                if (blockedUsers[i] === getInvitedUsers[ii] && blockedUsers[i] !== '') {
                    remainingBlockedUsers -= 1;
                }
            }

            for (let ii = 0; ii < getMembers.length; ii++) {
                if (blockedUsers[i] === getMembers[ii] && blockedUsers[i] !== '') {
                    remainingBlockedUsers -= 1;
                }
            }
        }
        if (remainingBlockedUsers === 1) {
            return false;
        } else {
            return true;
        }
    }

    searchByVoice(microphoneDOMElement) {
        return new Promise((resolve, reject) => {
            navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then(() => { 
                if (!microphoneDOMElement.classList.contains('listen')) {
                    microphoneDOMElement.classList.add('listen');
                }
                
                window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

                const recognition = new window.SpeechRecognition();
                recognition.interimResults = true;

                recognition.lang = this.helpers.GET_LANGUAGE();

                recognition.addEventListener('result', (e) => {
                    const text = Array.from(e.results).map(result => result[0]).map(result => result.transcript).join('');
        
                    if(e.results[0].isFinal) {
                        resolve(this.helpers.REMOVE_FULLSTOP(text));
                    }
                });

                microphoneDOMElement.addEventListener('click', () => {
                    this.#microphoneStopListen(recognition, microphoneDOMElement);
                })

                recognition.addEventListener('end', () => {
                    this.#microphoneStopListen(recognition, microphoneDOMElement);
                });
        
                recognition.start();          
            })
            .catch(() => {
                reject(this.handlerDependencies.displayMessage({message: 'You need to enable microphone permission!<br><br> Go to your browser settings and enable microphone.', isError: true}));
            });
        });
    }

    #microphoneStopListen(recognition, microphoneDOMElement) {
        recognition.stop();
        if (microphoneDOMElement.classList.contains('listen')) {
            microphoneDOMElement.classList.remove('listen');
        }
    }
        
}