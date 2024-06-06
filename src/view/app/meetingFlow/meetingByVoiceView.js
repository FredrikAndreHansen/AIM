export function meetingByVoiceView(peopleQuantity) {
    return `
        <div class="content-section">
            <h1 class="header">Schedule a Meeting</h1>
            <hr class="hr-small">
            <div class="space-medium"></div>
            
            <div id="time-info"></div>

            <h1 class="header-small">People (${peopleQuantity})</h1>
            <table id="user-list"></table>

            <img title="Go Back" class="backarrow-icon" src="../../../graphic/backArrowIcon.svg" />
        </div>
    `;
}

export function outputUsersView(id, username, company) {
    return `
        <tr class="tr" id="all-users" data-id="${id}">
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