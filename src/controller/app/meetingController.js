import { AppController } from "../appController.js";

export class MeetingController extends AppController {

    constructor(selectTeamController, selectDateController, selectTimeController, meetingModel) {
        super(selectTeamController, selectDateController, selectTimeController, meetingModel)
    }

    setView(meetingData) {
        this.#meetingMenuHighlight();

        this._helpers.SET_INNER_HTML_VALUE({set: this._views.viewDOMElement, to: this._views.meetingView()});

        const indexSectionFadeInDOMElement = document.querySelector('.index-section-fadein');
        this._helpers.SET_INNER_HTML_VALUE({set: indexSectionFadeInDOMElement, to: this._views.calendarView()});

        this.#goToSelectTeams(meetingData);

        this.#createMeetingByVoiceOnClick()
    }

    navigateMeetingForTeam(meetingData, page) {
        this.#meetingMenuHighlight();

        if (page === 1) {
            this.selectTeamController.setView(meetingData);
        }

        if (page === 2) {
            this.selectDateController.setView(meetingData);
        }

        if (page === 3) {
            this.selectTimeController.setView(meetingData);
        }
    }

    #goToSelectTeams(meetingData) {
        const meetingWithTeamDOMElement = document.querySelector("#meeting-with-team");

        meetingWithTeamDOMElement.addEventListener('click', () => {
            if (meetingData.meetingType === 'meetingTeam') {
                this._helpers.initApp('meetingTeam', meetingData, 1);
            } else {
                this._helpers.initApp('meetingTeam', false, 1);
            }
        });
    }

    #createMeetingByVoiceOnClick() {
        const microphoneDOMElement = document.querySelector('.microphone-icon');

        microphoneDOMElement.addEventListener('click', () => {
            this.getOutputByVoiceModel.getClosestUser();
            if (!microphoneDOMElement.classList.contains('listen')) {
                this.meetingModel.addMeetingByVoice(microphoneDOMElement).then((voiceOutput) => {
                    try {
                        console.log(voiceOutput);
                        alert(voiceOutput)
                    } catch(error) {
                        this._handlerController.displayMessage({message: error, isError: true});
                    }
                });
            }
        });
    }

    #meetingMenuHighlight() {
        const mainMenuMeetingDOMElement = document.querySelector('#main-menu-meeting');
        this._helpers.SET_MENU_HIGHLIGHT(mainMenuMeetingDOMElement);
    }
}