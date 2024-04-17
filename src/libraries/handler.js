import { popupDOMElement, errorDOMElement } from "../index.js";
import { handlerView, confirmView } from "../view/handlers/handlerView.js";
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
    CLOSE_MODAL([errorBtnDOMElement, errorBoxContainerDomElement], errorDOMElement);

    removeLoading();
}

function generateOutput(message, isError, confirm = false) {
    SET_INNER_HTML_VALUE({set: popupDOMElement, to: 'clear'});
    if (confirm === false) {
        SET_INNER_HTML_VALUE({set: errorDOMElement, to: handlerView(message, isError)});
    } else {
        SET_INNER_HTML_VALUE({set: errorDOMElement, to: confirmView(message)});
    }
}

export function throwError(errorMessage) {
    const error = new Error(errorMessage);
    throw error.message;
}

export function confirmMessage(handlerOutputValues, confirm) {
    const { message, isError } = handlerOutputValues;

    return new Promise((resolve, reject) => {
        try {
            generateOutput(message, isError, confirm);

            removeElements();
        
            const errorBtnDOMElement = document.querySelector('#error-button');
        
            errorBtnDOMElement.addEventListener('click', () => {
                if (confirm.key === 'deleteTeam') {
                    resolve(true);
                } else {
                    reject(false);
                }
            });
        } catch(error) {
            displayMessage({message: error, isError: true});
        }
    });



}