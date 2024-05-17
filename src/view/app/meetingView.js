import { sortTeams } from "./teamsView.js";
import { PRINT_CURRENT_DATE } from "../../helpers/helpers.js";

export function meetingView() {
    return `
        <div class="content-section">
            <h1 class="header">Schedule a Meeting</h1>
            <div class="index-section-fadein"></div>
            <div class="space-medium"></div>
            <div class="wrapper">
                <button id="meeting-with-team" class="btn-green-small-float">Schedule With a Team</button>
                <button id="meeting-with-people" class="btn-blue-small-float">Schedule With People</button>
                <div class="clear"></div>
                <hr class="hr-small">
                <span class="loader"><img class="microphone-icon" src="../../graphic/microphoneIcon.svg" title="Schedule Meeting By Voice" /></span>
                <p class="paragraph-center">Schedule By Voice</p>
                <p class="paragraph-center-small"><span style="font-weight: bold">Add</span> person <span style="font-weight: bold">From</span> company <span style="font-weight: bold">For</span> date <span style="font-weight: bold">At</span> time</p>
                <p class="paragraph-center-small">E.g: Add Bob from Company Co and John Doe for June 5th at 1 and 2 and 3 for June 6th at 2:30</p>
            </div>
            <div class="space-medium"></div>
        </div>
    `;
}

export function meetingViewTeam(sortTeamsObjectData, totalTeams) { 
    return `
        <div class="content-section">
            <h1 class="header">Choose a Team</h1>
 
            ${sortTeams(sortTeamsObjectData, totalTeams)}
            <table id="teams-list"></table>
            <img title="Go Back" class="backarrow-icon" src="../../../graphic/backArrowIcon.svg" />
        </div>
    `;
}

export function calendarView() {
    return `
        <img class="tea-icon" src="../../graphic/calendarBigIcon.svg" />
    `;
}

export function selectDateView(meetingData) {
    const { teamName } = meetingData;

    return `
        <div class="content-section">
            <h1 class="header">Add Date(s)</h1>
            <p class="paragraph-center">${teamName}</p>
            <div class="space-medium"></div>
            <input type="date" id="date" name="date" value="${PRINT_CURRENT_DATE()}" min="${PRINT_CURRENT_DATE()}" />
            <div class="circle-blue" id="select-date" title="Add Date">
                <img class="circle-img-inner" src="../../graphic/plusIcon.svg" />
            </div>
            <hr class="hr-small">
            <div class="space-medium"></div>
            <div id="date-info"></div>
            <img title="Go Back" class="backarrow-icon" src="../../../graphic/backArrowIcon.svg" />
        </div>
        <div id="proceed"><p class="paragraph-absolute-center-proceed">Proceed</p></div>
    `;
}

export function selectTimeView(meetingData) {
    const { teamName } = meetingData;

    return `
        <div class="content-section">
            <h1 class="header">Add Time(s)</h1>
            <p class="paragraph-center">${teamName}</p>
            <hr class="hr-small">
            <div class="space-medium"></div>
            <div id="time-info"></div>
            <img title="Go Back" class="backarrow-icon" src="../../../graphic/backArrowIcon.svg" />
        </div>
        <div id="proceed"><p class="paragraph-absolute-center-proceed">Proceed</p></div>
    `;
}