import { sortTeams } from "./teamsView.js";

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