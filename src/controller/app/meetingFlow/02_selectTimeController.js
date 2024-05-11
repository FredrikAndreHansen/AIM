export class SelectTimeController {
    
    constructor(helpers, views) {
        this.helpers = helpers;
        this.views = views;
    }

    setView(meetingData) {
        this.helpers.SET_INNER_HTML_VALUE({set: this.views.viewDOMElement, to: this.views.selectTimeView(meetingData)});

        this.#goBack(meetingData)
    }

    #goBack(meetingData) {
        const backArrowIconDOMElement = document.querySelector('.backarrow-icon');

        backArrowIconDOMElement.addEventListener('click', () => {
            this.helpers.initApp('meeting', meetingData, 1);
        });
    }

}