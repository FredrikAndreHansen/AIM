export class SelectDateModel {

    constructor(authDependencies, loadDependencies, handlerDependencies, helpers) {
        this.authDependencies = authDependencies;
        this.loadDependencies = loadDependencies;
        this.handlerDependencies = handlerDependencies;
        this.helpers = helpers;
    }

    outputSelectedDateData(meetingData) {
        this.authDependencies.validateIfLoggedIn();

        this.loadDependencies.removeLoading();

        this.#outputDates(meetingData);
    }

    addDate(date, meetingData) {
        if (this.#validateDate(date, meetingData)) {
            meetingData.dates.push(date);
        
            this.#outputDates(meetingData);
        }
    }

    #outputDates(meetingData) {
        const dateInfoDOMElement = document.querySelector('#date-info');
        const proceedDOMElement = document.querySelector('#proceed');

        this.helpers.SET_INNER_HTML_VALUE({ set: dateInfoDOMElement });

        if (meetingData.dates.length > 0) {
            if (proceedDOMElement.classList.contains('none')){
                proceedDOMElement.classList.remove('none');
            }

            for (let i = 0; i < meetingData.dates.length; i++) {
                dateInfoDOMElement.innerHTML += `<p class="date-container">${this.#formatDateOutput(meetingData.dates[i])} <img id="id${meetingData.dates[i]}" class="exit-icon-image-date" src="../../../graphic/exitIconWhite.svg" title="Remove Date"/></p>`;
            }
        } else {
            dateInfoDOMElement.innerHTML = `<p class="paragraph-center">No dates selected!</p>`;
            if (!proceedDOMElement.classList.contains('none')) {
                proceedDOMElement.classList.add('none');
            }
        }
    }

    #formatDateOutput(date) {
        const year = this.#setDateVariables(date).year;
        const month =  this.#setDateVariables(date).month;
        const day =  this.#setDateVariables(date).day;
        const allMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const currentMonth = allMonths[month-1];

        return currentMonth + ' ' + day + ', ' + year;
    }

    #setDateVariables(date) {
        const dateArray = date.split("-");

        const year = dateArray[0];
        const month = dateArray[1];
        const day = dateArray[2];

        return {
            year: year,
            month: month,
            day: day
        };
    }

    #validateDate(date, meetingData) {
        let error = false;

        for (let i = 0; i < meetingData.dates.length; i ++) {
            if (meetingData.dates[i] === date) {
                error = "You can't add the same date twice, please select a different date!";
            }
            if (meetingData.dates.length >= 3) {
                error = "You have added the maximum number of dates!";
            }
        }
        
        if(this.#dateIsInThePast(date)) {
            error = "The date can't be in the past!";
        }

        if(this.#dateIsToFarInTheFuture(date)) {
            error = "The date is too far in the future!";
        }

        if (error === false) {
            return true;
        } else {
            this.handlerDependencies.displayMessage({message: error, isError: true});
            return false;
        }
    }

    #dateIsInThePast(date) {
        const year = this.#setDateVariables(date).year;
        const month =  this.#setDateVariables(date).month;
        const day =  this.#setDateVariables(date).day;

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        const currentDay = currentDate.getDate();
        
        if (year < currentYear) {
            return true;
        }

        if (year == currentYear && month < currentMonth) {
            return true;
        }

        if (year == currentYear && month == currentMonth && day < currentDay) {
            return true;
        }

        return false;
    }

    #dateIsToFarInTheFuture(date) {
        const year = this.#setDateVariables(date).year;

        const currentDate = new Date();
        const futureYear = currentDate.getFullYear() + 5;

        if (year > futureYear) {
            return true;
        }

        return false;
    }

    removeDate(id, meetingData) {
        meetingData.dates = meetingData.dates.filter((date) => {
            return date !== id;
        });

        this.#outputDates(meetingData);
    }

}