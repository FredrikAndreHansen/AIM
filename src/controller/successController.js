import { successView } from '../view/successView.js';
import { removeLoading } from './loadController.js';

export function displaySuccessMessage(successMessage) {
    const errorDOMElement = document.querySelector('#error');
    errorDOMElement.innerHTML = successView(successMessage);
    removeLoading();
}

// Close the error message
const errorDOMElement = document.querySelector('#error');

errorDOMElement.addEventListener('click', function() {
    errorDOMElement.innerHTML = '';
});