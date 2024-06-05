export class GetOutputByVoiceController {
    
    constructor(loadDependencies, helpers, views, getOutputByVoiceModel) {
        this.loadDependencies = loadDependencies;
        this.helpers = helpers
        this.views = views
        this.getOutputByVoiceModel = getOutputByVoiceModel;
    }

    setView(voiceOutput, meetingData) {
        this.getOutputByVoiceModel.getClosestUsers(voiceOutput).then((people) => {
            this.getOutputByVoiceModel.getClosestDatesAndTimes(voiceOutput);
            this.#outputUsers(people);

            this.#goBack(meetingData);

            this.loadDependencies.removeLoading();
        });
    }

    #outputUsers(people) {
        this.helpers.SET_INNER_HTML_VALUE({ set: this.views.viewDOMElement, to: this.views.meetingByVoiceView(people.length) });

        this.getOutputByVoiceModel.getAllUsers(people).then((allUsers) => {
            const userListDOMElement = document.querySelector('#user-list');
            this.helpers.SET_INNER_HTML_VALUE({set: userListDOMElement, to: allUsers});
    
            const allUsersDOMElement = document.querySelectorAll("#all-users");
            this.helpers.ANIMATE_FADE_IN(allUsersDOMElement);
        });
    }

    #goBack(meetingData) {
        const backArraowIconDOMElement = document.querySelector('.backarrow-icon');

        backArraowIconDOMElement.addEventListener('click', () => {
            this.helpers.initApp('meeting', meetingData);
        });
    }
}