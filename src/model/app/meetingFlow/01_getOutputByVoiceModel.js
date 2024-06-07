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
            try {
              this.helpers.GLOBAL_CONFIG('MAXIMUM_PEOPLE_PER_TEAM').then((MAXIMUM_PEOPLE_PER_TEAM) => {
                this.helpers.SALT().then((salt) => {
                  const decrypt = this.encryptDependencies.decipher(salt);
                  const decryptedCurrentUserId = decrypt(LoggedInUserId);
                  
                  this.helpers.GET_DB_USERS_INFO(dbRef, decryptedCurrentUserId).then((loggedInUser) => {
                    const userData = this.helpers.GET_VALUE(loggedInUser);
                    const isUserSubscribed = userData.configuration.isSubscribed;

                    if (this.helpers.IF_EXISTS(loggedInUser)) {
                      this.helpers.GET_DB_ALL_USERS_INFO(dbRef).then(users => {
                        const allUsers = this.helpers.GET_VALUE(users);

                        let outputUsers = [];
                        for (let i = 0; voiceInput.length > i; i++) {
                          
                          if (voiceInput[i].person) {
                            outputUsers.push(this.#checkForClosestUser(allUsers, voiceInput[i].person.name, voiceInput[i].person.company, decryptedCurrentUserId));
                          }
                        }

                        outputUsers = this.#filterDuplicateUsers(outputUsers);

                        if (this.#validateOutputUsers(outputUsers, MAXIMUM_PEOPLE_PER_TEAM, isUserSubscribed) === false) {
                          resolve(outputUsers);
                        } else {
                          const errorMessage = this.#validateOutputUsers(outputUsers, MAXIMUM_PEOPLE_PER_TEAM, isUserSubscribed);
                          reject(this.handlerDependencies.displayMessage({message: errorMessage, isError: true}));
                        }
                      });
                    }else {
                      reject(this.handlerDependencies.throwError("No data available!"));
                    }
                  });
                });  
              });
            } catch(error) {
                reject(this.handlerDependencies.displayMessage({ message: error, isError: true }));
            }
        });
    }

    #validateOutputUsers(outputUsers, MAXIMUM_PEOPLE_PER_TEAM, isUserSubscribed) {
      if (outputUsers.length > 0 && outputUsers.length < MAXIMUM_PEOPLE_PER_TEAM && isUserSubscribed === false) {
        return false;
      }

      if (isUserSubscribed === true && outputUsers.length > 0) {
        return false;
      }

      if(outputUsers.length === 0) {
        return 'An unknown error occured, please try again!';
      }

      if (outputUsers.length >= MAXIMUM_PEOPLE_PER_TEAM && isUserSubscribed === false) {
        return `You can only add a maximum of ${MAXIMUM_PEOPLE_PER_TEAM} people!`;
      }

      return 'An unknown error occured, please try again!';
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

      getAllUsers(people) {
        return new Promise((resolve, reject) => {

          let outputAllUsers = '';
          this.helpers.SALT().then((salt) => {
            try {
              const encrypt = this.encryptDependencies.cipher(salt);

              for (let i = 0; i < people.length; i++) {
                  const decryptedUserId = encrypt(people[i].userId);
                  
                  outputAllUsers += this.views.outputUsersView(decryptedUserId, people[i].username, people[i].company); 
                }
                
              resolve(outputAllUsers);
            } catch(error) {
              reject(this.handlerDependencies.displayMessage({ message: error, isError: true }));
            }
          });
        });
      }

      getClosestDatesAndTimes(voiceInput) {
        return new Promise((resolve, reject) => {

          try {
            let meetings = [];

            for (let i = 0; i < voiceInput.length; i++) {
              if (voiceInput[i].meeting) {
                const date = voiceInput[i].meeting.date;
    
                const formattedMonth = this.#getClosestMonth(date)[0];
                const month = this.#getClosestMonth(date)[1];
                const formattedDay = this.#getClosestDay(date, month)[0];
                const day = this.#getClosestDay(date, month)[1];
    
                const year = this.#getYear(month, day);

                let times = [];
                for (let j = 0; j < voiceInput[i].meeting.time.length; j++) {
                  times.push(this.#formatTime(voiceInput[i].meeting.time[j]));
                }
    
                meetings.push({
                  date: formattedMonth + ' ' + formattedDay + ', ' + year,
                  times: times
                });
              }
            }

            if (this.#validateMeetings(meetings) === false) {
              resolve(this.#generateMeetingsHTML(meetings));
            } else {
              const errorMessage = this.#validateMeetings(meetings);
              reject(this.handlerDependencies.displayMessage({ message: errorMessage, isError: true }));
            }

          } catch(error) {
            reject(this.handlerDependencies.displayMessage({ message: error, isError: true }));
          }
        });
      }

      #generateMeetingsHTML(meetings) {
        let meetingsHTML = '';

        for (let i = 0; i < meetings.length; i++) {

          let timesHTML = '';
          for (let j = 0; j < meetings[i].times.length; j++) {
            if (meetings[i].times[j]) {
              timesHTML += `<p class="date-container">${meetings[i].times[j]}</p>`
            }
          }
          meetingsHTML += `
            <div class="settings-members-wrapper"><p class="paragraph-center" style="font-weight: bold;">${meetings[i].date}</p>${timesHTML}</div><div class="space-medium"></div>`;
        }

        return meetingsHTML;
      }

      #validateMeetings(meetings) {
        if (meetings.length === 0) {
          return 'An unknown error occured, please try again!';
        }

        for (let i = 0; i < meetings.length; i++) {
          for(let j = 0; j < meetings.length; j++) {
            if (meetings[i].date === meetings[j].date && i !== j) {
              return 'An unknown error occured, please try again!';
            }
          }
        }

        return false;
      }

      #formatTime(time) {
        time = this.helpers.REMOVE_FULLSTOP(time);

        // If the time is military time
        if(!time.includes('AM') && !time.includes('PM')){
          if (!time.includes(':')) {
            time = this.#getClosestTimeHour(time, true);
            time += ':00';
            time = time.replaceAll(' ', '');
          } else {
            
          }
        }

        return time;
      }

      #getClosestTimeHour(time, militaryTime = false) {
        let score = 0;
        let returnedTime = '';

        if(militaryTime === true) {
          for (let i = 0; i < 23; i++) {
            const newScore = this.#similarity(time, i.toString());
            if (newScore > score) {
              score = newScore;
              returnedTime = i.toString();
            }
          }
        }

        return returnedTime;
      }

      #getClosestMonth(date) {
        const allMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        let score = 0;
        let returnedDate = '';
        let month = 0;

        for (let i = 0; i < allMonths.length; i++) {
          const newScore = this.#similarity(date, allMonths[i]);
          if (newScore > score) {
            score = newScore;
            returnedDate = allMonths[i];
            month = i + 1;
          }
        }

        return [returnedDate, month];
      }

      #getClosestDay(date, month) {
        let score = 0;
        let returnedDay = 0;

        for (let i = 1; i < 31; i++) {
          const newScore = this.#similarity(date, i.toString());
          if (newScore > score) {
            score = newScore;

            returnedDay = i;

            if (returnedDay >= this.#daysInMonth(month, i)) {
              returnedDay = this.#daysInMonth(month, i);
            }
          }
        }
        return [this.#formatReturnedDay(returnedDay), returnedDay];
      }

      #formatReturnedDay(returnedDay) {
        if (returnedDay < 10) {
          returnedDay = '0' + returnedDay.toString();
        } else {
          returnedDay.toString();
        }

        return returnedDay;
      }

      #daysInMonth(month, day) {
        const date = new Date();
        let year = date.getFullYear();
        const currentMonth = date.getMonth() + 1;
        const currentDay = date.getDate();
        
        if (month === currentMonth) {
          if (day < currentDay) {
            year = date.getFullYear() + 1;
          }
        }

        if (month < currentMonth) {
          year = date.getFullYear() + 1;
        }

        const totalDays = new Date(year, month, 0).getDate();
        
        return totalDays;
      }

      #getYear(month, day) {
        const date = new Date();
        let year = date.getFullYear();
        const currentMonth = date.getMonth() + 1;
        const currentDay = date.getDate();

        if (currentMonth > month) {
          year += 1;
        }
        if (currentMonth === month && currentDay > day) {
          year += 1;
        }

        return year;
      }
}