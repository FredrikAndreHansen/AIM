export function usersView(hasBlockedUsers) {
    return `
        <div class="index-section">
            <h1 class="header">Manage Users</h1>
            <form>
                <input type="text" id="search-user" placeholder="Find users by name or company" class="input" maxlength="24" required />
                <button id="search-users-button" class="btn">SEARCH</button>
            </form>
            ${hasBlockedUsers === true ? '<button id="has-blocked-users-button" class="btn-red">BLOCKED USERS</button>' : ''}
            <div class="space-medium"></div>
            <hr class="hr-small">
            <div class="space-x-big"></div>
            <table id="user-list"></table>
        </div>
    `;
}

export function userOutputView(encryptedKey, users, key, isBlocked) {
    return `                        
        <tr id="all-users" data-id="${encryptedKey}">
            <td class="${isBlocked === true ? 'user-td-blocked' : 'user-td'}"><img class="user-icon" src="../../graphic/userIcon.svg" /></td>
            <td>
                <p class="paragraph-center">${users[key].username}</p>
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