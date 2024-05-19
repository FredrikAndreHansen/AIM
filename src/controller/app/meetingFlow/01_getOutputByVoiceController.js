export class GetOutputByVoiceController {
    
    constructor(loadDependencies, helpers, views, getOutputByVoiceModel) {
        this.loadDependencies = loadDependencies;
        this.helpers = helpers
        this.views = views
        this.getOutputByVoiceModel = getOutputByVoiceModel;
    }

    setView(voiceOutput) {
        this.getOutputByVoiceModel.getClosestUsers(voiceOutput).then((people) => {
            this.#outputUsers(people);

            this.loadDependencies.removeLoading();
        });
    }

    #outputUsers(people) {
        this.helpers.SET_INNER_HTML_VALUE({set: this.views.viewDOMElement, to: this.views.meetingByVoiceView()});

        this.getOutputByVoiceModel.getAllUsers(people).then((allUsers) => {
            const userListDOMElement = document.querySelector('#user-list');
            this.helpers.SET_INNER_HTML_VALUE({set: userListDOMElement, to: allUsers});
    
            const allUsersDOMElement = document.querySelectorAll("#all-users");
            this.helpers.ANIMATE_FADE_IN(allUsersDOMElement);
        });
    }
}