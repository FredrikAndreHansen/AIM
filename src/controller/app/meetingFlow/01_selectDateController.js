export class SelectDateController {

    constructor(helpers, views, selectDateModel) {
        this.helpers = helpers;
        this.views = views;
        this.selectDateModel = selectDateModel;
    }

    setView(meetingData) {
        this.helpers.SET_INNER_HTML_VALUE({set: this.views.viewDOMElement, to: this.views.selectDateView(meetingData)});

        this.selectDateModel.outputSelectedDateData(meetingData);

        this.#addDate(meetingData);

        this.#setDateEventListener(meetingData);
    }

    #addDate(meetingData) {
        const selectDateDOMElement = document.querySelector('#select-date');

        selectDateDOMElement.addEventListener('click', () => {
            const dateDomElement = document.querySelector('#date');

            this.selectDateModel.addDate(this.helpers.GET_DOM_VALUE(dateDomElement), meetingData);

            this.#setDateEventListener(meetingData);
        });
    }

    #setDateEventListener(meetingData) {
        for(let i = 0; i < meetingData.dates.length; i++) {
            const id = meetingData.dates[i];

            document.querySelector('#id' + id).addEventListener('click', () => {
                this.selectDateModel.removeDate(id, meetingData);

                this.#setDateEventListener(meetingData);
            });
        }

        this.#goBack(meetingData);
    }

    #goBack(meetingData) {
        const backArrowIconDOMElement = document.querySelector('.backarrow-icon');

        backArrowIconDOMElement.addEventListener('click', () => {
            this.helpers.initApp('meeting', meetingData);
        });
    }
}