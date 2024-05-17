export class GetOutputByVoiceController {
    constructor(getOutputByVoiceModel) {
        this.getOutputByVoiceModel = getOutputByVoiceModel;
    }

    setView(voiceOutput) {
        this.getOutputByVoiceModel.getClosestUsers(voiceOutput);
    }
}