export const passwordResetView = `
<div class="sign-in-section">
    <h1 class="header">Forgot Password?</h1>
    <p class="paragraph-center">Enter your email address and we'll email you a link to reset your password.</p>
    <form>
        <input type="email" id="email" placeholder="Email" class="input" maxlength="66" required />
        <button id="password-reset-button" class="btn">RESET PASSWORD</button>
    </form>
    <hr class="hr">
    <div class="center"><a class="link-text" id="sign-in-navigate">Sign In</a> <span class="span-text">-</span> <a class="link-text" id="register-navigate">Register</a></div>
</div>
`;