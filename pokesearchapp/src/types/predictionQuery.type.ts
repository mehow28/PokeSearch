export interface ConversationItem {
    id: string;
    text: string;
    modality: string;
    language: string;
    participantId: string;
}

export interface AnalysisInput {
    conversationItem: ConversationItem;
}

export interface Parameters {
    projectName: string;
    verbose: boolean;
    deploymentName: string;
    stringIndexType: string;
}

export interface RootObject {
    kind: string;
    analysisInput: AnalysisInput;
    parameters: Parameters;
}

