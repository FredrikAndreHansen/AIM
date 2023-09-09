import { popupDOMElement } from "../../index.js";
import { handlerView } from '../../view/handlers/handlerView.js';
import { LoadController } from './loadController.js';
import { SET_INNER_HTML_VALUE } from '../../helpers/helpers.js';

export class HandlerController {

    displayMessage(handlerOutputValues) {
        const { message, isError } = handlerOutputValues;

        this.#generateOutput(message, isError);
        
        this.#close();

        const loadController = new LoadController();
        loadController.removeLoading();
    }

    #generateOutput(message, isError) {
        SET_INNER_HTML_VALUE({set: popupDOMElement, to: 'clear'});
        const errorDOMElement = document.querySelector('#error');
        SET_INNER_HTML_VALUE({set: errorDOMElement, to: handlerView(message, isError)});
    }

    #close() {
        const errorDOMElement = document.querySelector('#error');
        errorDOMElement.addEventListener('click', function() {
            SET_INNER_HTML_VALUE({set: errorDOMElement, to: 'clear'});
        });
    }

    throwError(errorMessage) {
        const error = new Error(errorMessage);
        throw error.message;
    }

}