export function headerView(isLoggedIn) { 
    if (isLoggedIn === true) {
        return `
            <menu class="main-menu">
                <menuitem title="Upcoming Meetings" id="main-menu-logo"></menuitem>
                <menuitem title="Manage Users" id="main-menu-users"></menuitem>
                <menuitem title="Manage Teams" id="main-menu-teams"></menuitem>
                <menuitem title="Schedule a Meeting" id="main-menu-meeting"></menuitem>
                <menuitem title="Sign Out" id="main-menu-sign-out"></menuitem>
            </menu>
        `;
    } else {
        return `
            <img class="header-icon" src="./graphic/logo.png" />
        `;
    }
}