export class GetOutputByVoiceModel {

    constructor(authDependencies, loadDependencies, handlerDependencies, encryptDependencies, helpers, views) {
        this.authDependencies = authDependencies;
        this.loadDependencies = loadDependencies;
        this.handlerDependencies = handlerDependencies;
        this.encryptDependencies = encryptDependencies;
        this.helpers = helpers;
        this.views = views;
    }

    getClosestUsers(voiceInput) {
        this.authDependencies.validateIfLoggedIn();

        const LoggedInUserId = this.helpers.GET_USER_ID();
        const dbRef = this.helpers.GET_DB_REFERENCE();

        return new Promise((resolve, reject) => {
            try{
                this.helpers.SALT().then((salt) => {
                    const decrypt = this.encryptDependencies.decipher(salt);
                    const decryptedCurrentUserId = decrypt(LoggedInUserId);
                    
                    this.helpers.GET_DB_ALL_USERS_INFO(dbRef).then(users => {
                        const allUsers = this.helpers.GET_VALUE(users);

                        let outputUsers = [];
                        for (let i = 0; voiceInput.length > i; i ++) {
                          
                          if (voiceInput[i].person) {
                            outputUsers.push(this.#checkForClosestUser(allUsers, voiceInput[i].person.name, voiceInput[i].person.company, decryptedCurrentUserId));
                          }
                        }

                        outputUsers = this.#filterDuplicateUsers(outputUsers);

                        if (outputUsers.length > 0) {
                          resolve(outputUsers);
                        } else {
                          reject(this.handlerController.displayMessage({message: 'An unknown error occured, please try again!', isError: true}))
                        }
                    });
                });
            } catch(error) {
                reject(this.handlerController.displayMessage({message: error, isError: true}));
            }
        });
    }

    #checkForClosestUser(allUsers, userName, company, LoggedInUserId) {
        let allUsersData = [];
        let loggedInUserBlockedUsers = [];
        for (const key in allUsers) {
            if (key === LoggedInUserId) {
              loggedInUserBlockedUsers = allUsers[key].blockedUsers; 
              continue;
            }
            const getUserName = allUsers[key].username;
            const getCompany= allUsers[key].company;
            const getBlockedUsers = allUsers[key].blockedUsers;
            const getKey = key;
            
            const mostSimilarUsername = this.#similarity(userName, getUserName);
            const mostSimilarCompany = this.#similarity(company, getCompany);
            const mostSimilar = mostSimilarUsername + mostSimilarCompany;

            allUsersData.push({
                userId: getKey, 
                username: getUserName, 
                company: getCompany, 
                score: mostSimilar,
                blockedUsers: getBlockedUsers
            });
        }

        return this.#returnClosestUserData(allUsersData, LoggedInUserId, loggedInUserBlockedUsers);
    }

    #returnClosestUserData(allUsersData, LoggedInUserId, loggedInUserBlockedUsers) {
        let returnedFilteredUser = false;

        for (let i = 0; allUsersData.length > i; i++) {
        let exclude = false;

        for (let k = 0; loggedInUserBlockedUsers.length > k; k++) {
          if (allUsersData[i].userId === loggedInUserBlockedUsers[k]) {
            exclude = true;
          }
        }
            for (let j = 0; allUsersData[i].blockedUsers.length > j; j++) {

                if (allUsersData[i].blockedUsers[j] === LoggedInUserId) { exclude = true; }
                
                if (returnedFilteredUser === false && allUsersData[i].blockedUsers.length === j+1 && exclude === false) { returnedFilteredUser = allUsersData[i]; exclude = true; }

                if (allUsersData[i].score > returnedFilteredUser.score && exclude === false && allUsersData[i].blockedUsers.length === j+1) {
                    returnedFilteredUser = allUsersData[i];
                }
            }
        }

        return returnedFilteredUser;
    }

    #similarity(s1, s2) {
        let longer = s1;
        let shorter = s2;
        if (s1.length < s2.length) {
          longer = s2;
          shorter = s1;
        }
        let longerLength = longer.length;
        if (longerLength == 0) {
          return 1.0;
        }
        return (longerLength - this.#editDistance(longer, shorter)) / parseFloat(longerLength);
      }

      #editDistance(s1, s2) {
        s1 = s1.toLowerCase();
        s2 = s2.toLowerCase();
      
        let costs = new Array();
        for (let i = 0; i <= s1.length; i++) {
          let lastValue = i;
          for (let j = 0; j <= s2.length; j++) {
            if (i == 0)
              costs[j] = j;
            else {
              if (j > 0) {
                let newValue = costs[j - 1];
                if (s1.charAt(i - 1) != s2.charAt(j - 1))
                  newValue = Math.min(Math.min(newValue, lastValue),
                    costs[j]) + 1;
                costs[j - 1] = lastValue;
                lastValue = newValue;
              }
            }
          }
          if (i > 0)
            costs[s2.length] = lastValue;
        }
        return costs[s2.length];
      }

      #filterDuplicateUsers(outputUsers) {
        const ids = outputUsers.map(({ userId }) => userId);
        const filtered = outputUsers.filter(({ userId }, index) =>
        !ids.includes(userId, index + 1));

        return filtered;
      }

}