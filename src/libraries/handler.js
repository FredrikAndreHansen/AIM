import { popupDOMElement, errorDOMElement } from "../index.js";
import { handlerView, warningView } from "../view/handlers/handlerView.js";
import { removeLoading } from "./load.js";
import { SET_INNER_HTML_VALUE, CLOSE_MODAL, DISABLE_SCROLL } from "../helpers/helpers.js";

export function displayMessage(handlerOutputValues) {
    const { message, isError } = handlerOutputValues;

    generateOutput(message, isError);

    removeElements();
}

function removeElements() {
    DISABLE_SCROLL();

    const errorBtnDOMElement = document.querySelector('#error-button');
    const errorBoxContainerDomElement = document.querySelector('#error-box-container');
    let allElements = [errorBtnDOMElement, errorBoxContainerDomElement];

    if (document.querySelector('#remove-button')) {
        const removeBtnDOMElement = document.querySelector('#remove-button');
        allElements.push(removeBtnDOMElement);
    }
    
    CLOSE_MODAL(allElements, errorDOMElement);

    removeLoading();
}

function generateOutput(message, isError, confirm = false) {
    SET_INNER_HTML_VALUE({set: popupDOMElement, to: 'clear'});
    if (confirm === false) {
        SET_INNER_HTML_VALUE({set: errorDOMElement, to: handlerView(message, isError)});
    } else {
        SET_INNER_HTML_VALUE({set: errorDOMElement, to: warningView(message)});
    }
}

export function throwError(errorMessage) {
    const error = new Error(errorMessage);
    throw error.message;
}

export function confirmMessage(message) {
    return new Promise((resolve, reject) => {
        try {
            generateOutput(message, false, true);

            removeElements();
        
            const confirmBtnDOMElement = document.querySelector('#error-button');
        
            confirmBtnDOMElement.addEventListener('click', () => {
                resolve(true);
            });
        } catch(error) {
            reject(displayMessage({message: error, isError: true}));
        }
    });

}