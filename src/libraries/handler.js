import { popupDOMElement, errorDOMElement } from "../index.js";
import { handlerView } from "../view/handlers/handlerView.js";
import { removeLoading } from "./load.js";
import { SET_INNER_HTML_VALUE, CLOSE_MODAL } from "../helpers/helpers.js";

export function displayMessage(handlerOutputValues) {
    const { message, isError } = handlerOutputValues;

    generateOutput(message, isError);

    const errorBtnDOMElement = document.querySelector('#error-button');
    const errorBoxContainerDomElement = document.querySelector('#error-box-container');
    CLOSE_MODAL([errorBtnDOMElement, errorBoxContainerDomElement], errorDOMElement);

    removeLoading();
}

function generateOutput(message, isError) {
    SET_INNER_HTML_VALUE({set: popupDOMElement, to: 'clear'});
    SET_INNER_HTML_VALUE({set: errorDOMElement, to: handlerView(message, isError)});
}

export function throwError(errorMessage) {
    const error = new Error(errorMessage);
    throw error.message;
}