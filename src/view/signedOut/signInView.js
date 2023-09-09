export const signInView = `
    <div class="sign-in-section">
        <h1 class="header">SIGN IN</h1>
        <form>
            <input type="email" id="email" placeholder="Email" class="input" maxlength="66" required />
            <input type="password" id="password" placeholder="Password" class="input" minlength="6" maxlength="140" required />
            <button id="sign-in-button-navigate" class="btn">SIGN IN</button>
        </form>
        <hr class="hr">
        <div class="center"><a class="link-text" id="register-navigate">Register</a> <span class="span-text">-</span> <a class="link-text" id="password-reset-navigate">Forgot Password?</a></div>
    </div>
`;