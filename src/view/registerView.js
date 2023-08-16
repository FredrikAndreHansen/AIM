export const registerView = `
<div class="register-section">
    <h1 class="header">REGISTER</h1>
    <form>
        <input type="text" id="name" placeholder="Full name" class="input" maxlength="64" required />
        <input type="email" id="email" placeholder="Email" class="input" maxlength="66" required />
        <input type="text" id="company" placeholder="Company" class="input" maxlength="64" required />
        <input type="password" id="password" placeholder="Password" class="input" minlength="6" maxlength="140" required />
        <input type="password" id="confirm-password" placeholder="Confirm password" class="input" minlength="6" maxlength="140" required />
        <button id="register-button-navigate" class="btn">REGISTER</button>
    </form>
    <hr class="hr">
    <div class="center"><a class="link-text" id="sign-in-navigate">Sign In</a> <span class="span-text">-</span> <a class="link-text" id="password-reset-navigate">Forgot Password?</a></div>
</div>
`;