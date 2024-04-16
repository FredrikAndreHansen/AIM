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

export function confirmView(confirmMessage) {
    return `
        <div class="error-box-container" id="error-box-container"></div>
                
        <div class="error-box">
            <h1 class="header">${confirmMessage}</h1>
            <button class="btn" id="error-button">YES</button>
        </div>
    `;
}