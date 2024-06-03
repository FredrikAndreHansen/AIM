import { sortTeams } from "../teamsView.js";

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