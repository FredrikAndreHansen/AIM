export class SelectTimeModel {

    constructor(authDependencies, loadDependencies, handlerDependencies, helpers, meetingModel) {
        this.authDependencies = authDependencies;
        this.loadDependencies = loadDependencies;
        this.handlerDependencies = handlerDependencies;
        this.helpers = helpers;
        this.meetingModel = meetingModel;
    }

    outputSelectedTimesDate(meetingData) {
        this.authDependencies.validateIfLoggedIn();

        this.loadDependencies.removeLoading();

        this.#outputTimes(meetingData);
    }

    #outputTimes(meetingData) {
        const timeInfoDOMElement = document.querySelector('#time-info');

        this.helpers.SET_INNER_HTML_VALUE({ set: timeInfoDOMElement });

        let canProceed = false;
        let datesThatHaveSelectedTime = 0;

        for (let i = meetingData.dates.length; i > 0; i--) {

            const allSelectedTimesHTML = this.#generateAllIndividualTimes(meetingData, i);

            timeInfoDOMElement.innerHTML += this.#generateAllTimesHTML(meetingData, allSelectedTimesHTML, i);
            
            datesThatHaveSelectedTime += this.#checkIfDatesHasSelectedTime(meetingData, i);
        }

        if (datesThatHaveSelectedTime === meetingData.dates.length) {
            canProceed = true;
        }

        this.meetingModel.canProceed(canProceed);
    }

    #generateAllTimesHTML(meetingData, allSelectedTimesHTML, i) {
        return `
            <div class="settings-members-wrapper">
                <p class="paragraph-center" style="font-weight: bold;">${this.meetingModel.formatDateOutput(meetingData.dates[i-1].date)}</p>
                <input type="time" id="date" class="time-${meetingData.dates[i-1].date}" name="time" value="${this.helpers.PRINT_TIME_ONE_HOUR_AHEAD()}" />
                <div class="circle-blue" id="id${meetingData.dates[i-1].date}" title="Add Time">
                    <img class="circle-img-inner" src="../../graphic/plusIcon.svg" />
                </div>
                ${allSelectedTimesHTML}
            </div>
            <div class="space-medium"></div>
        `;
    }

    #generateAllIndividualTimes(meetingData, i) {
        let allSelectedTimesHTML = '';
        for(let j = meetingData.dates[i-1].time.length; j > 0; j--) {
            allSelectedTimesHTML += this.#generateIndividualTimeHTML(meetingData, i ,j);
        }

        return allSelectedTimesHTML;
    }

    #generateIndividualTimeHTML(meetingData, i, j) {
        const individualTime = meetingData.dates[i-1].time[j-1];
        const individualTimeTrim = this.helpers.REMOVE_SEMICOLON(individualTime);
        const date = meetingData.dates[i-1].date;
        return `
            <p class="date-container">${individualTime}<img id="id${date}-${individualTimeTrim}" class="exit-icon-image-date" src="../../../graphic/exitIconWhite.svg" title="Remove Time"/></p>
        `;
    }

    #checkIfDatesHasSelectedTime(meetingData, i) {
        let countIfDateElementsHasTime = 0;

        if (meetingData.dates[i-1].time.length > 0) {
            countIfDateElementsHasTime = 1;
        }

        return countIfDateElementsHasTime;
    }

    addTime(date, time, meetingData) {
        for (let i = 0; i < meetingData.dates.length; i++) {
            if (meetingData.dates[i].date === date) {
                meetingData.dates[i].time.push(time);
            }
        }

        this.#outputTimes(meetingData);
    }

    removeTime(date, time, meetingData) {
        let filterTimes = [];
        let getDate = -1;

        for (let i = 0; i < meetingData.dates.length; i++) {
            if (meetingData.dates[i].date === date) {
                for (let j = 0; j < meetingData.dates[i].time.length; j++) {
                    if (meetingData.dates[i].time[j] !== time) {
                        filterTimes = [...filterTimes, meetingData.dates[i].time[j]];
                    } else {
                        getDate = i;
                    }
                }
            }
        }
        
        if (getDate !== -1) {
            meetingData.dates[getDate].time = filterTimes;
        }
        
        this.#outputTimes(meetingData);
    }

}