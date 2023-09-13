export const teamsView = `
    <div class="content-section">
        <h1 class="header">Manage Teams</h1>
        <form>
            <input type="text" id="new-team" placeholder="Give the new team a name!" class="input" maxlength="24" required />
            <button id="create-team-button" class="btn-green">CREATE TEAM</button>
        </form>
        <div class="space-medium"></div>
        <hr class="hr-small">
        <div class="space-x-big"></div>
        <table id="teams-list"></table>
    </div>
`;

export function teamsOutputView(teamInfo) {
    const {encryptedKey, team, usersInTeam} = teamInfo;
    
    return `                        
        <tr id="all-teams" data-id="${encryptedKey}">
            <td class="team-td"><img class="user-icon" src="../../graphic/teamsIcon.svg" /></td>
            <td>
                <p class="paragraph-center">${team}</p>
                <hr class="hr-x-small" style="margin-top: -8px;" />
                <p class="paragraph-center-small" style="margin-top: -6px;">${usersInTeam} ${usersInTeam === 1 ? ' User' : ' Users'}</p>
            </td>
        </tr>
    `;
}

export const noTeams = `
    <p class="paragraph-center">You have no teams!</p>
    <p class="paragraph-center-small">You can either create a new team or be invited to one</p>
    <img class="sad-icon" src="../../graphic/sadIcon.svg" />
`;