export function meetingByVoiceView() {
    return `
        <div class="content-section">
            <h1 class="header">Schedule Meeting</h1>
            <table id="user-list"></table>
        </div>
    `;
}

export function outputUsersView(id, username, company) {
    return `
        <tr class="tr tr-not-self" id="all-users" data-id="${id}">
            <td class="user-td">
                <img class="user-icon" src="../../graphic/userIcon.svg" />
            </td>
            <td>
                <p class="paragraph-center">${username}</p>
                <hr class="hr-x-small" style="margin-top: -8px;" />
                <p class="paragraph-center-small" style="margin-top: -6px;">${company}</p>
            </td>
        </tr>
    `;
}