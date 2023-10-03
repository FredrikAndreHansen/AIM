export function indexView(userInfo) { 
    const { userName, company } = userInfo;
    return `
        <div class="index-section">
            <h1 class="header">Welcome</h1><p class="paragraph-center">${userName}</p><p class="bullet-point-index">&#8226;</p><p class="paragraph-center-small" style="margin-top: -12px;">${company}</p>
            <hr class="hr-small">
            <div class="space-x-big"></div>
            <div id="alerts" class="index-section-fadein"></div>
            <table id="invited-users"></table>
        </div>
    `;
}

export function noAlertsView() {
    return `
        <p class="paragraph-center-big">No Upcoming Meetings!</p>
        <img class="tea-icon" src="../../graphic/teaIcon.svg" />
    `;
}

export function invitedUsersHeadingView(teamInvitesQuantity) {
    return `
        <h1 class="header-small">Team Invites (${teamInvitesQuantity})</h1>
    `;
}

export function invitedUsersView(invitedUserInfo) {
    const { userName, teamName, teamId, inviteId } = invitedUserInfo;
    const idsArr = [teamId, inviteId];

    return `
        <tr class="tr" id="all-invited-teams">
            <td class="alert-box">
                <img class="alert-icon" src="../../graphic/alertIcon.svg" />
                <p class="paragraph-center"><span style="font-weight: bold;">${userName}</span> has invited you to join <span style="font-weight: bold;">${teamName}</span>!</p>
                <div class="center-align">
                    <button id="accept-button" class="btn-alert" data-id="${idsArr}"><img class="inside-btn-icon-image" src="../../../graphic/acceptIcon.svg" /> ACCEPT</button>
                    <button id="decline-button" class="btn-alert" data-id="${idsArr}"><img class="inside-btn-icon-image" src="../../../graphic/declineIcon.svg" /> DECLINE</button>
                </div>
            </td>
        </tr>
    `;
}

export function menuAlertsView(quantity) {
    return `
        <p class="menu-alerts"><span>${quantity}</span></p>
    `;
}