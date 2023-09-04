export const usersView = `
    <div class="index-section">
        <h1 class="header">Manage Users</h1>
        <form>
            <input type="text" id="search-user" placeholder="Find users by name or company" class="input" maxlength="64" required />
            <button id="search-users-button" class="btn">SEARCH</button>
        </form>
        <div class="space-medium"></div>
        <hr class="hr-small">
        <div class="space-x-big"></div>
        <table id="user-list"></table>
    </div>
`;