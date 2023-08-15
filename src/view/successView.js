export function successView(successMessage) { 
    return `
        <div class="error-box-container"></div>
        
        <div class="error-box">
            <h1 class="header">Success</h1>
            <p class="paragraph-center">${successMessage}</p>
            <button class="btn" id="error-button">OK</button>
        </div>
    `};