export class SelectTimeController {
    
    constructor(helpers, views, selectTimeModel) {
        this.helpers = helpers;
        this.views = views;
        this.selectTimeModel = selectTimeModel;
    }

    setView(meetingData) {
        this.#generateOutput(meetingData);

        this.#setTimeEventListener(meetingData);
    }

    #generateOutput(meetingData) {
        this.helpers.SET_INNER_HTML_VALUE({set: this.views.viewDOMElement, to: this.views.selectTimeView(meetingData)});

        this.selectTimeModel.outputSelectedTimesDate(meetingData);
    }

    #setTimeEventListener(meetingData) {
        for(let i = 0; i < meetingData.dates.length; i++) {
            const id = meetingData.dates[i].date;
            const timeDomElement = document.querySelector('.time-' + id);

            document.querySelector('#id' + id).addEventListener('click', () => {
                this.selectTimeModel.addTime(id, timeDomElement.value, meetingData);

                this.#setTimeEventListener(meetingData);
            });
        }
        this.#removeTime(meetingData);

        this.#goBack(meetingData);
    }

    #removeTime(meetingData) {
        for (let i = 0; i < meetingData.dates.length; i++) {
            for (let j = 0; j < meetingData.dates[i].time.length; j++) {
                const time = meetingData.dates[i].time[j];
                const timeTrim = this.helpers.REMOVE_SEMICOLON(time);
                const date = meetingData.dates[i].date;
                const individualTimeDomElement = document.querySelector('#id' + date + "-" + timeTrim);

                individualTimeDomElement.addEventListener('click', () => {
                    this.selectTimeModel.removeTime(date, time, meetingData);

                    this.#setTimeEventListener(meetingData);
                });
            }
        }
    }

    #goBack(meetingData) {
        const backArrowIconDOMElement = document.querySelector('.backarrow-icon');

        backArrowIconDOMElement.addEventListener('click', () => {
            this.helpers.initApp('meeting', meetingData, 1);
        });
    }

}