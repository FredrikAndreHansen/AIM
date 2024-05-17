export class GetOutputByVoiceModel {

    constructor(authDependencies, loadDependencies, handlerDependencies, encryptDependencies, helpers, views) {
        this.authDependencies = authDependencies;
        this.loadDependencies = loadDependencies;
        this.handlerDependencies = handlerDependencies;
        this.encryptDependencies = encryptDependencies;
        this.helpers = helpers;
        this.views = views;
    }

    getClosestUser(userName = 'frederick', company = 'co') {
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
                        resolve(console.log(this.#checkForClosestUser(allUsers, userName, company, decryptedCurrentUserId)));
                    });
                });
            } catch(error) {
                reject(this.handlerController.displayMessage({message: error, isError: true}));
            }
        });
    }

    #checkForClosestUser(allUsers, userName, company, LoggedInUserId) {
        let allUsersData = [];
        for (const key in allUsers) {
            if (key === LoggedInUserId) { continue; }
            const getUserName = allUsers[key].username;
            const getCompany= allUsers[key].company;
            const getKey = key;
            
            const mostSimilarUsername = this.#similarity(userName, getUserName);
            const mostSimilarCompany = this.#similarity(company, getCompany);
            const mostSimilar = mostSimilarUsername + mostSimilarCompany;

            allUsersData.push({userId: getKey, username: getUserName, company: getCompany, score: mostSimilar});
        }

        return this.#returnClosestUserData(allUsersData);
    }

    #returnClosestUserData(allUsersData) {
        let returnedFilteredUser = {};
        for (let i = 0; allUsersData.length > i; i++) {
            if (i === 0) { returnedFilteredUser = allUsersData[i]; continue;}

            if (allUsersData[i].score > returnedFilteredUser.score) {
                returnedFilteredUser = allUsersData[i];
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

}