export function errorView(errorMessage) { 
return `
    <div class="error-box-container"></div>
    
    <div class="error-box">
        <h1 class="header">Error</h1>
        <img class="error-icon" src="../../graphic/exitIcon.svg" />
        <p class="paragraph-center">${errorMessage}</p>
        <button class="btn" id="error-button">OK</button>
    </div>
`};