export class SelectDateModel {

    constructor(authDependencies, loadDependencies, handlerDependencies, helpers, meetingModel) {
        this.authDependencies = authDependencies;
        this.loadDependencies = loadDependencies;
        this.handlerDependencies = handlerDependencies;
        this.helpers = helpers;
        this.meetingModel = meetingModel;
    }

    outputSelectedDateData(meetingData) {
        this.authDependencies.validateIfLoggedIn();

        this.loadDependencies.removeLoading();

        this.#outputDates(meetingData);
    }

    addDate(date, meetingData) {
        if (this.#validateDate(date, meetingData)) {
            meetingData.dates.push({
                date: date,
                time: []
            });
        
            this.#outputDates(meetingData);
        }
    }

    #outputDates(meetingData) {
        const dateInfoDOMElement = document.querySelector('#date-info');

        this.helpers.SET_INNER_HTML_VALUE({ set: dateInfoDOMElement });

        if (meetingData.dates.length > 0) {
            this.meetingModel.canProceed(true);

            for (let i = meetingData.dates.length; i > 0; i--) {
                dateInfoDOMElement.innerHTML += this.#generateDateHTML(meetingData, i);
            }
        } else {
            dateInfoDOMElement.innerHTML = `<p class="paragraph-center">No dates selected!</p>`;
            this.meetingModel.canProceed(false);
        }
    }

    #generateDateHTML(meetingData, i) {
        return `
            <p class="date-container">${this.meetingModel.formatDateOutput(meetingData.dates[i-1].date)} <img id="id${meetingData.dates[i-1].date}" class="exit-icon-image-date" src="../../../graphic/exitIconWhite.svg" title="Remove Date"/></p>
        `;
    }

    #validateDate(date, meetingData) {
        let error = false;

        for (let i = 0; i < meetingData.dates.length; i ++) {
            if (meetingData.dates[i].date === date) {
                error = "You can't add the same date twice, please select a different date!";
            }
            if (meetingData.dates.length >= 10) {
                error = "You have added the maximum amount of dates!";
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
        const year = this.meetingModel.setDateVariables(date).year;
        const month =  this.meetingModel.setDateVariables(date).month;
        const day =  this.meetingModel.setDateVariables(date).day;

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
        const year = this.meetingModel.setDateVariables(date).year;

        const currentDate = new Date();
        const futureYear = currentDate.getFullYear() + 5;

        if (year > futureYear) {
            return true;
        }

        return false;
    }

    removeDate(id, meetingData) {
        let filterDates = [];
        for (let i = 0; meetingData.dates.length > i; i++) {
            if (meetingData.dates[i].date !== id) {
                filterDates = [...filterDates, meetingData.dates[i]];
            }
        }
        meetingData.dates = filterDates;

        this.#outputDates(meetingData);
    }

}