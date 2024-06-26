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

                const timesFilterDuplicate = times.filter(function(item, pos) {
                  return times.indexOf(item) === pos;
                });
    
                meetings.push({
                  date: formattedMonth + ' ' + formattedDay + ', ' + year,
                  times: timesFilterDuplicate
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
        time = this.#formatTimeSaidConventional(time);
        time = time.replaceAll(' ', '');
        
        const date = new Date(Date.UTC(2012, 11, 12, 3, 0, 0));
        const dateString = date.toLocaleTimeString();

        // If the time is not military time
        if (dateString.match(/am|pm/i) || date.toString().match(/am|pm/i) ) {

        } 
        // If the time is millitary time
        else {
          time = this.#formatTimeCheckForSemicolon(time);
        }

        return time;
      }

      #formatTimeCheckForSemicolon(time) {
        if (!time.includes(':')) {
          time = this.#changeToConvenientTime(time);
          time = this.#formatTimeToMilitary(time);
          time = this.#getClosestTimeHour(time, true);
          time += ':00';
        } else {
          const timeSplitArr = time.split(':');
          let formatHour = this.#changeToConvenientTime(timeSplitArr[0], timeSplitArr[1]);
          formatHour = this.#formatTimeToMilitary(formatHour, timeSplitArr[1]);
          formatHour = this.#getClosestTimeHour(formatHour, true);
          const formatMinute = this.#getClosestTimeMinute(timeSplitArr[1]);
          time = formatHour + ":" + formatMinute;
        }

        return time;
      }

      #changeToConvenientTime(time, checkForAMPM = '') {
        if (!time.includes('pm') && !time.includes('PM') && !checkForAMPM.includes('pm') && !checkForAMPM.includes('PM') && !time.includes('am') && !time.includes('AM') && !checkForAMPM.includes('am') && !checkForAMPM.includes('AM')) {
          if (time === "1") {time = "13";}
          if (time === "2") {time = "14";}
          if (time === "3") {time = "15";}
          if (time === "4") {time = "16";}
          if (time === "5") {time = "17";}
          if (time === "6") {time = "18";}
          if (time === "7") {time = "19";}
        }

        return time;
      }

      #formatTimeToMilitary(time, checkForAMPM = '') {
        if (time.includes('pm') || time.includes('PM') || checkForAMPM.includes('pm') || checkForAMPM.includes('PM')) {
          time = time.replaceAll('pm', '');
          time = time.replaceAll('PM', '');

          if (time === "1") {time = "13";}
          if (time === "2") {time = "14";}
          if (time === "3") {time = "15";}
          if (time === "4") {time = "16";}
          if (time === "5") {time = "17";}
          if (time === "6") {time = "18";}
          if (time === "7") {time = "19";}
          if (time === "8") {time = "20";}
          if (time === "9") {time = "21";}
          if (time === "10") {time = "22";}
          if (time === "11") {time = "23";}
          if (time === "12") {time = "0";}
        }

        if (time.includes('am') || time.includes('AM')) {
          time = time.replaceAll('am', '');
          time = time.replaceAll('AM', '');
        }

        return time;
      }

      #getClosestTimeHour(time, militaryTime = false) {
        let score = 0;
        let returnedTime = '0';

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

      #getClosestTimeMinute(minute) {
        let score = 0;
        let returnedMinute = '00';

        for (let i = 0; i < 60; i++) {
          const newScore = this.#similarity(minute, i.toString());
          if (newScore > score) {
            score = newScore;
            if (i <= 9) {
              returnedMinute = "0" + i.toString();
            } else {
              returnedMinute = i.toString();
            }
          }
        }

        return returnedMinute;
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

      #formatTimeSaidConventional(time) {
        let ampm = '';

        if (time.includes('am') || time.includes('AM')) {
          time = time.replaceAll('am', '');
          time = time.replaceAll('AM', '');
          ampm = 'AM';
        }

        if (time.includes('pm') || time.includes('PM')) {
          time = time.replaceAll('pm', '');
          time = time.replaceAll('PM', '');
          ampm = 'PM';
        }

        let minute = '0';

        const timeArr = time.split(' ');
        const timeArrFilterEmpty = timeArr.filter(filter => {
          return filter !== "";
        });

        let checkMinutes = '';
        for (let i = 0; i < timeArrFilterEmpty.length - 1; i ++) {
          checkMinutes += timeArrFilterEmpty[i];
        }

        let hour = timeArrFilterEmpty[timeArrFilterEmpty.length - 1];
        hour = this.#setHour(hour);

        if (checkMinutes.includes('past')) {
          minute = this.#setMinute(checkMinutes, true);
        }

        if (!checkMinutes.includes('past')) {
          if (checkMinutes.includes('half')) {
            minute = '30';
            +hour--;
            hour.toString();
          }
        }

        if (checkMinutes.includes('to')) {
          minute = this.#setMinute(checkMinutes, false);  

          +hour--;
          hour.toString();
        }
        
        if (minute !== '0') {
          time = hour + ':' + minute;
        }

        return time + ampm;
      }

      #setHour(hour) {
        if (hour.includes('one') || hour.includes('1:00') || hour.includes('13:00')) {hour = '1';}
        if (hour.includes('two') || hour.includes('2:00') || hour.includes('14:00')) {hour = '2';}
        if (hour.includes('three') || hour.includes('3:00') || hour.includes('15:00')) {hour = '3';}
        if (hour.includes('four') || hour.includes('4:00') || hour.includes('16:00')) {hour = '4';}
        if (hour.includes('five') || hour.includes('5:00') || hour.includes('17:00')) {hour = '5';}
        if (hour.includes('six') || hour.includes('6:00') || hour.includes('18:00')) {hour = '6';}
        if (hour.includes('seven') || hour.includes('7:00') || hour.includes('19:00')) {hour = '7';}
        if (hour.includes('eight') || hour.includes('8:00') || hour.includes('20:00')) {hour = '8';}
        if (hour.includes('nine') || hour.includes('9:00') || hour.includes('21:00')) {hour = '9';}
        if (hour.includes('ten') || hour.includes('10:00') || hour.includes('22:00')) {hour = '10';}
        if (hour.includes('eleven')|| hour.includes('11:00') || hour.includes('23:00')) {hour = '11';}
        if (hour.includes('twelve') || hour.includes('12:00') || hour.includes('0:00')) {hour = '12';}
 
        return hour;
      }

      #setMinute(checkMinutes, after) {
        let minute = '0';

        if (checkMinutes.includes('1') || checkMinutes.includes('one') || checkMinutes.includes('1:00')) {
          if (after === true) {minute = '1'} else {minute = '59';}
        }
        if (checkMinutes.includes('2') || checkMinutes.includes('two') || checkMinutes.includes('2:00')) {
          if (after === true) {minute = '2'} else {minute = '58';}
        }
        if (checkMinutes.includes('3') || checkMinutes.includes('three') || checkMinutes.includes('3:00')) {
          if (after === true) {minute = '3'} else {minute = '57';}
        }
        if (checkMinutes.includes('4') || checkMinutes.includes('four') || checkMinutes.includes('4:00')) {
          if (after === true) {minute = '4'} else {minute = '56';}
        }
        if (checkMinutes.includes('5') || checkMinutes.includes('five') || checkMinutes.includes('5:00')) {
          if (after === true) {minute = '5'} else {minute = '55';}
        }
        if (checkMinutes.includes('6') || checkMinutes.includes('six') || checkMinutes.includes('6:00')) {
          if (after === true) {minute = '6'} else {minute = '54';}
        }
        if (checkMinutes.includes('7') || checkMinutes.includes('seven') || checkMinutes.includes('7:00')) {
          if (after === true) {minute = '7'} else {minute = '53';}
        }
        if (checkMinutes.includes('8') || checkMinutes.includes('eight') || checkMinutes.includes('8:00')) {
          if (after === true) {minute = '8'} else {minute = '52';}
        }
        if (checkMinutes.includes('9') || checkMinutes.includes('nine') || checkMinutes.includes('9:00')) {
          if (after === true) {minute = '9'} else {minute = '51';}
        }
        if (checkMinutes.includes('10') || checkMinutes.includes('ten') || checkMinutes.includes('10:00')) {
          if (after === true) {minute = '10'} else {minute = '50';}
        }
        if (checkMinutes.includes('11') || checkMinutes.includes('eleven') || checkMinutes.includes('11:00')) {
          if (after === true) {minute = '11'} else {minute = '49';}
        }
        if (checkMinutes.includes('12') || checkMinutes.includes('twelve') || checkMinutes.includes('12:00')) {
          if (after === true) {minute = '12'} else {minute = '48';}
        }
        if (checkMinutes.includes('13') || checkMinutes.includes('thirteen') || checkMinutes.includes('13:00')) {
          if (after === true) {minute = '13'} else {minute = '47';}
        }
        if (checkMinutes.includes('14') || checkMinutes.includes('fourteen') || checkMinutes.includes('14:00')) {
          if (after === true) {minute = '14'} else {minute = '46';}
        }
        if (checkMinutes.includes('quarter') || checkMinutes.includes('15') || checkMinutes.includes('fifteen') || checkMinutes.includes('15:00')) {
          if (after === true) {minute = '15'} else {minute = '45';}
        }
        if (checkMinutes.includes('16') || checkMinutes.includes('sixteen') || checkMinutes.includes('16:00')) {
          if (after === true) {minute = '16'} else {minute = '44';}
        }
        if (checkMinutes.includes('17') || checkMinutes.includes('seventeen') || checkMinutes.includes('17:00')) {
          if (after === true) {minute = '17'} else {minute = '43';}
        }
        if (checkMinutes.includes('18') || checkMinutes.includes('eighteen') || checkMinutes.includes('18:00')) {
          if (after === true) {minute = '18'} else {minute = '42';}
        }
        if (checkMinutes.includes('19') || checkMinutes.includes('nineteen') || checkMinutes.includes('19:00')) {
          if (after === true) {minute = '19'} else {minute = '41';}
        }
        if (checkMinutes.includes('20') || checkMinutes.includes('twenty') || checkMinutes.includes('20:00')) {
          if (after === true) {minute = '20'} else {minute = '40';}
        }
        if (checkMinutes.includes('21') || checkMinutes.includes('twentyone') || checkMinutes.includes('21:00')) {
          if (after === true) {minute = '21'} else {minute = '39';}
        }
        if (checkMinutes.includes('22') || checkMinutes.includes('twentytwo') || checkMinutes.includes('22:00')) {
          if (after === true) {minute = '22'} else {minute = '38';}
        }
        if (checkMinutes.includes('23') || checkMinutes.includes('twentythree') || checkMinutes.includes('23:00')) {
          if (after === true) {minute = '23'} else {minute = '37';}
        }
        if (checkMinutes.includes('24') || checkMinutes.includes('twentyfour') || checkMinutes.includes('24:00')) {
          if (after === true) {minute = '24'} else {minute = '36';}
        }
        if (checkMinutes.includes('25') || checkMinutes.includes('twentyfive')) {
          if (after === true) {minute = '25'} else {minute = '35';}
        }
        if (checkMinutes.includes('26') || checkMinutes.includes('twentysix')) {
          if (after === true) {minute = '26'} else {minute = '34';}
        }
        if (checkMinutes.includes('27') || checkMinutes.includes('twentyseven')) {
          if (after === true) {minute = '27'} else {minute = '33';}
        }
        if (checkMinutes.includes('28') || checkMinutes.includes('twentyeight')) {
          if (after === true) {minute = '28'} else {minute = '32';}
        }
        if (checkMinutes.includes('29') || checkMinutes.includes('twentynine')) {
          if (after === true) {minute = '29'} else {minute = '31';}
        }
        if (checkMinutes.includes('half') || checkMinutes.includes('thirty') || checkMinutes.includes('30')) {
          minute = '30';
        }
        if (checkMinutes.includes('31') || checkMinutes.includes('thirtyone')) {
          if (after === true) {minute = '31'} else {minute = '29';}
        }
        if (checkMinutes.includes('32') || checkMinutes.includes('thirtytwo')) {
          if (after === true) {minute = '32'} else {minute = '28';}
        }
        if (checkMinutes.includes('33') || checkMinutes.includes('thirtythree')) {
          if (after === true) {minute = '33'} else {minute = '27';}
        }
        if (checkMinutes.includes('34') || checkMinutes.includes('thirtyfour')) {
          if (after === true) {minute = '34'} else {minute = '26';}
        }
        if (checkMinutes.includes('35') || checkMinutes.includes('thirtyfive')) {
          if (after === true) {minute = '35'} else {minute = '25';}
        }
        if (checkMinutes.includes('36') || checkMinutes.includes('thirtysix')) {
          if (after === true) {minute = '36'} else {minute = '24';}
        }
        if (checkMinutes.includes('37') || checkMinutes.includes('thirtyseven')) {
          if (after === true) {minute = '37'} else {minute = '23';}
        }
        if (checkMinutes.includes('38') || checkMinutes.includes('thirtyeight')) {
          if (after === true) {minute = '38'} else {minute = '22';}
        }
        if (checkMinutes.includes('39') || checkMinutes.includes('thirtynine')) {
          if (after === true) {minute = '39'} else {minute = '21';}
        }
        if (checkMinutes.includes('40') || checkMinutes.includes('fourty')) {
          if (after === true) {minute = '40'} else {minute = '20';}
        }
        if (checkMinutes.includes('41') || checkMinutes.includes('fourtyone')) {
          if (after === true) {minute = '41'} else {minute = '19';}
        }
        if (checkMinutes.includes('42') || checkMinutes.includes('fourtytwo')) {
          if (after === true) {minute = '42'} else {minute = '18';}
        }
        if (checkMinutes.includes('43') || checkMinutes.includes('fourtythree')) {
          if (after === true) {minute = '43'} else {minute = '17';}
        }
        if (checkMinutes.includes('44') || checkMinutes.includes('fourtyfour')) {
          if (after === true) {minute = '44'} else {minute = '16';}
        }
        if (checkMinutes.includes('45') || checkMinutes.includes('fourtyfive')) {
          if (after === true) {minute = '45'} else {minute = '15';}
        }
        if (checkMinutes.includes('46') || checkMinutes.includes('fourtysix')) {
          if (after === true) {minute = '46'} else {minute = '14';}
        }
        if (checkMinutes.includes('47') || checkMinutes.includes('fourtyseven')) {
          if (after === true) {minute = '47'} else {minute = '13';}
        }
        if (checkMinutes.includes('48') || checkMinutes.includes('fourtyeight')) {
          if (after === true) {minute = '48'} else {minute = '12';}
        }
        if (checkMinutes.includes('49') || checkMinutes.includes('fourtynine')) {
          if (after === true) {minute = '49'} else {minute = '11';}
        }
        if (checkMinutes.includes('50') || checkMinutes.includes('fifty')) {
          if (after === true) {minute = '50'} else {minute = '10';}
        }
        if (checkMinutes.includes('51') || checkMinutes.includes('fiftyone')) {
          if (after === true) {minute = '51'} else {minute = '9';}
        }
        if (checkMinutes.includes('52') || checkMinutes.includes('fiftytwo')) {
          if (after === true) {minute = '52'} else {minute = '8';}
        }
        if (checkMinutes.includes('53') || checkMinutes.includes('fiftythree')) {
          if (after === true) {minute = '53'} else {minute = '7';}
        }
        if (checkMinutes.includes('54') || checkMinutes.includes('fiftyfour')) {
          if (after === true) {minute = '54'} else {minute = '6';}
        }
        if (checkMinutes.includes('55') || checkMinutes.includes('fiftyfive')) {
          if (after === true) {minute = '55'} else {minute = '5';}
        }
        if (checkMinutes.includes('56') || checkMinutes.includes('fiftysix')) {
          if (after === true) {minute = '56'} else {minute = '4';}
        }
        if (checkMinutes.includes('57') || checkMinutes.includes('fiftyseven')) {
          if (after === true) {minute = '57'} else {minute = '3';}
        }
        if (checkMinutes.includes('58') || checkMinutes.includes('fiftyeight')) {
          if (after === true) {minute = '58'} else {minute = '2';}
        }
        if (checkMinutes.includes('59') || checkMinutes.includes('fiftynine')) {
          if (after === true) {minute = '59'} else {minute = '1';}
        }

        return minute;
      }
}