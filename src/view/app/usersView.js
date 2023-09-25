export function usersView(hasBlockedUsers, displayInTeam) {
    return `
        <div class="content-section">
            ${displayInTeam === false ? '<h1 class="header">Manage Users</h1>' : '<h1 class="header">Invite To Team</h1><img class="backarrow-icon" src="../../../graphic/backArrowIcon.svg" />'}
            <input type="text" id="search-user" placeholder="Search" class="input-cut-right" maxlength="24" required />
            <div class="btn-cut-left-blue">
                <img class="icon-btn-cut" src="../../graphic/MagnifyingGlassIcon.svg" />
            </div>
            ${hasBlockedUsers === true ? '<button id="has-blocked-users-button" class="btn-grey"><img class="inside-btn-icon-image" src="../../../graphic/userBlockIcon.svg" />BLOCKED USERS</button>' : ''}
            <div class="space-medium"></div>
            <hr class="hr-small">
            <div class="space-x-big"></div>
            <table id="user-list"></table>
        </div>
    `;
}

export function userOutputView(encryptedKey, users, key, isBlocked, isSelf = false) {
    return `                        
        <tr ${isSelf === false ? 'class="tr tr-not-self"' : 'class="tr"'} id="all-users" data-id="${encryptedKey}">
            <td class="${isBlocked === true ? 'user-td-blocked' : isSelf === false ? 'user-td' : 'user-td-self'}"><img class="user-icon" src="../../graphic/userIcon.svg" /></td>
            <td>
                <p ${isSelf === false ? '' : 'style="font-weight: bold;"'} class="paragraph-center">${users[key].username}</p>
                <hr class="hr-x-small" style="margin-top: -8px;" />
                <p class="paragraph-center-small" style="margin-top: -6px;">${users[key].company}</p>
            </td>
        </tr>
    `;
}

export function userSearchOutput(searchQuery = false) {
    if (searchQuery !== false) {
        return `<p class="paragraph-absolute-center">Results for: ${searchQuery}</p><br>`;
    } else {
        return '<p class="paragraph-center">No results!</p>';
    }
}