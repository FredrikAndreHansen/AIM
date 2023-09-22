export function individualTeamView(teamName, memberQuantity, membersOutput) {
    return `
        <div class="content-section">
            <h1 class="header">${teamName}</h1>
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