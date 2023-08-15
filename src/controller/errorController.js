import { errorView } from '../view/errorView.js';
import { removeLoading } from './loadController.js';

export function displayErrorMessage(errorMessage) {
    const errorDOMElement = document.querySelector('#error');
    errorDOMElement.innerHTML = errorView(errorMessage);
    removeLoading();
}

// Close the error message
const errorDOMElement = document.querySelector('#error');

errorDOMElement.addEventListener('click', function() {
    errorDOMElement.innerHTML = '';
});