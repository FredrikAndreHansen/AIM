export class MeetingModel {

    constructor(loadDependencies, handlerDependencies, helpers) {
        this.loadDependencies = loadDependencies;
        this.handlerDependencies = handlerDependencies;
        this.helpers = helpers;
    }

    canProceed(ifUserCanProceed) {
        const proceedDOMElement = document.querySelector('#proceed');

        if (ifUserCanProceed === true) {
            if (proceedDOMElement.classList.contains('none')){
                proceedDOMElement.classList.remove('none');
            }
        } else {
            if (!proceedDOMElement.classList.contains('none')) {
                proceedDOMElement.classList.add('none');
            }
        }
    }

    formatDateOutput(date) {
        const year = this.setDateVariables(date).year;
        const month =  this.setDateVariables(date).month;
        const day =  this.setDateVariables(date).day;
        const allMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const currentMonth = allMonths[month-1];

        return currentMonth + ' ' + day + ', ' + year;
    }

    setDateVariables(date) {
        const dateArray = date.split("-");

        const year = dateArray[0];
        const month = dateArray[1];
        const day = dateArray[2];

        return {
            year: year,
            month: month,
            day: day
        };
    }

    addMeetingByVoice(microphoneDOMElement) {
        return new Promise((resolve, reject) => {
            navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then(() => { 
                if (!microphoneDOMElement.classList.contains('listen')) {
                    microphoneDOMElement.classList.add('listen');
                }

                window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

                const recognition = new window.SpeechRecognition();
                recognition.interimResults = true;
                recognition.continuous = false;

                recognition.lang = this.helpers.GET_LANGUAGE();

                recognition.addEventListener('result', (e) => {
                    const text = Array.from(e.results).map(result => result[0]).map(result => result.transcript).join('');
        
                    if(e.results[0].isFinal) {
                        this.loadDependencies.displayLoading();
                        const finalOutputText = this.#parseVoiceOutput(text);
                        resolve(finalOutputText);
                    }
                });

                microphoneDOMElement.addEventListener('click', () => {
                    this.helpers.MICROPHONE_STOP_LISTEN(recognition, microphoneDOMElement);
                })

                recognition.addEventListener('end', () => {
                    this.helpers.MICROPHONE_STOP_LISTEN(recognition, microphoneDOMElement);
                });

                setTimeout(() => {
                    recognition.start();  
                }, 500); 
            })
            .catch(() => {
                reject(this.handlerDependencies.displayMessage({message: 'You need to enable microphone permission!<br><br> Go to your browser settings and enable microphone.', isError: true}));
            });
        });
    }

    #parseVoiceOutput(text) {
        text += " end";
        const textInput = text.split(" ");
        let parse = [];
        let stringBuild = '';
        let reset = false;
        let fullReset = false;
        let isName = true;
        let name = '';
        let company = '';
        let dateString = '';
        let timeArray = [];
        let checkForDate = false;
        let date = false;
        let checkForTime = false;
        let time = false;

        for (let i = 0; i < textInput.length; i++) {
            if (textInput[0] !== "add" && textInput[0] !== "Add") { break; }
            if (textInput[i] === "from" || textInput[i] === "From") { reset = true; }
            if (textInput[i] === "and" && time === false || textInput[i] === "And" && time === false) { fullReset = true; reset = true; }
            if (textInput[i] === "and" && time === true || textInput[i] === "And" && time === true) { reset = true; }
            if (textInput[i] === "for" || textInput[i] === "For") { fullReset = true; reset = true; checkForDate = true; }
            if (textInput[i] === "at" || textInput[i] === "At") { reset = true; checkForTime = true; }
            if (textInput[i] === "end") { fullReset = true; reset = true; }

            if (reset === true) {
                if (isName === true && date === false && time === false) { name = stringBuild; } else { company = stringBuild; }
                if (date === true) {dateString = stringBuild;}
                if (time === true) {timeArray.push(stringBuild);}
                stringBuild = '';
                isName = !isName;
                reset = false;
                if (checkForTime === true) { time = true; date = false; checkForDate = false; checkForTime = false; }
                if (fullReset === false) { continue; }
            }

            if (fullReset === true) {
                if (date === false && time === false) {parse.push({person: {name: name, company: company}});}
                if (time === true) {parse.push({meeting: {date: dateString, time: timeArray}})}
                name = '';
                company = '';
                timeArray = [];
                dateString = '';
                fullReset = false;
                reset = false;
                isName = true;
                if (checkForDate === true) { date = true; time = false; checkForTime = false; checkForDate = false; }
                continue;
            }

            if (reset === false && i !== 0) {
                stringBuild += textInput[i] + " ";
            }
            
        }
        return parse;
    }

}