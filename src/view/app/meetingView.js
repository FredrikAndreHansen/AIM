import { sortTeams } from "./teamsView.js";
import { PRINT_CURRENT_DATE } from "../../helpers/helpers.js";

export function meetingView(sortTeamsObjectData, totalTeams) { 
    return `
        <div class="content-section">
            <h1 class="header">Schedule a Meeting</h1>
            <div class="index-section-fadein"></div>
 
            ${sortTeams(sortTeamsObjectData, totalTeams)}
            <table id="teams-list"></table>
        </div>
    `;
}

export function calendarView() {
    return `
        <img class="tea-icon" src="../../graphic/calendarBigIcon.svg" />
        <p class="paragraph-center">Choose a team</p>
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
            <img title="Go back" class="backarrow-icon" src="../../../graphic/backArrowIcon.svg" />
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
            <img title="Go back" class="backarrow-icon" src="../../../graphic/backArrowIcon.svg" />
        </div>
        <div id="proceed"><p class="paragraph-absolute-center-proceed">Proceed</p></div>
    `;
}