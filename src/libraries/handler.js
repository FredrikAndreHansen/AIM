import { popupDOMElement, errorDOMElement } from "../index.js";
import { handlerView, confirmView } from "../view/handlers/handlerView.js";
import { removeLoading } from "./load.js";
import { SET_INNER_HTML_VALUE, CLOSE_MODAL, DISABLE_SCROLL } from "../helpers/helpers.js";

export function displayMessage(handlerOutputValues, confirm = false) {
    const { message, isError } = handlerOutputValues;

    generateOutput(message, isError, confirm);

    DISABLE_SCROLL();

    const errorBtnDOMElement = document.querySelector('#error-button');
    const errorBoxContainerDomElement = document.querySelector('#error-box-container');
    CLOSE_MODAL([errorBtnDOMElement, errorBoxContainerDomElement], errorDOMElement);

    removeLoading();
}

function generateOutput(message, isError, confirm) {
    SET_INNER_HTML_VALUE({set: popupDOMElement, to: 'clear'});
    if (confirm === false) {
        SET_INNER_HTML_VALUE({set: errorDOMElement, to: handlerView(message, isError)});
    } else {
        SET_INNER_HTML_VALUE({set: errorDOMElement, to: confirmView(message)});
        confirmMessageOnClick(confirm);
    }
}

export function throwError(errorMessage) {
    const error = new Error(errorMessage);
    throw error.message;
}

function confirmMessageOnClick(confirm) {
    const errorBtnDOMElement = document.querySelector('#error-button');
    errorBtnDOMElement.addEventListener('click', () => {
        if (confirm.key === 'deleteTeam') {
            // Create a export function and return a promise! When the promise is returned true, then the function in the controller can be executed!
        }
    });
}