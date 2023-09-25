export function individualTeamView(teamName, memberQuantity, isAdmin) {
    return `
        <div class="content-section">
            <h1 class="header">${teamName}</h1>
            <img class="backarrow-icon" src="../../../graphic/backArrowIcon.svg" />
            ${isAdmin === true ? '<img class="cogwheel-icon" src="../../../graphic/cogwheelIcon.svg" />' : ''}
            <button id="invite-members-button" class="btn-grey"><img class="inside-btn-icon-image" src="../../../graphic/userInviteIcon.svg" />INVITE USERS</button>
            <div class="space-medium"></div>
            <hr class="hr-small">
            <div class="space-x-big"></div>
            <h1 class="header-small">Members (${memberQuantity})</h1>
            <div class="space-x-big"></div>
            <table id="user-list"></table>
        </div>
    `;
}

export function inviteUsersView(teamName) {
    return `
        <div class="content-section">
            <h1 class="header">Invite to</h1>
            <h2 class="header-small">${teamName}</h2>
            <img class="backarrow-icon" src="../../../graphic/backArrowIcon.svg" />
            <div class="space-medium"></div>
            <hr class="hr-small">
            <div class="space-x-big"></div>
            <table id="user-list"></table>
        </div>
    `;
}