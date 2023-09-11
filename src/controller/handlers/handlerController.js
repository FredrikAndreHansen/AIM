import { popupDOMElement, errorDOMElement } from "../../index.js";
import { handlerView } from '../../view/handlers/handlerView.js';
import { LoadController } from './loadController.js';
import { SET_INNER_HTML_VALUE, CLOSE_MODAL } from '../../helpers/helpers.js';

export class HandlerController {

    displayMessage(handlerOutputValues) {
        const { message, isError } = handlerOutputValues;

        this.#generateOutput(message, isError);

        const errorBtnDOMElement = document.querySelector('#error-button');
        const errorBoxContainerDomElement = document.querySelector('#error-box-container');
        CLOSE_MODAL([errorBtnDOMElement, errorBoxContainerDomElement], errorDOMElement);

        const loadController = new LoadController();
        loadController.removeLoading();
    }

    #generateOutput(message, isError) {
        SET_INNER_HTML_VALUE({set: popupDOMElement, to: 'clear'});
        SET_INNER_HTML_VALUE({set: errorDOMElement, to: handlerView(message, isError)});
    }

    throwError(errorMessage) {
        const error = new Error(errorMessage);
        throw error.message;
    }

}