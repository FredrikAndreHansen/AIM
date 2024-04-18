export function handlerView(message, isError) {
    if (isError === true) {
        return `
            <div class="error-box-container" id="error-box-container"></div>
            
            <div class="error-box">
                <h1 class="header">Error</h1>
                <img class="error-icon" src="../../graphic/exitIconWhite.svg" />
                <p class="paragraph-center">${message}</p>
                <button class="btn" id="error-button">OK</button>
            </div>
        `;
    } else {
        return `
            <div class="error-box-container" id="error-box-container"></div>
            
            <div class="error-box">
                <h1 class="header">Success</h1>
                <p class="paragraph-center">${message}</p>
                <button class="btn" id="error-button">OK</button>
            </div>
        `;
    }
}

export function warningView(confirmMessage) {
    return `
        <div class="error-box-container" id="error-box-container"></div>
                
        <div class="error-box">
        <div class="exit-icon" id="remove-button">
            <img class="exit-icon-image" src="../../graphic/exitIcon.svg" />
        </div>
        <h1 class="header">Warning</h1>
        <p class="paragraph-center">${confirmMessage}</p>
            <button class="btn-red" id="error-button">DELETE</button>
        </div>
    `;
}