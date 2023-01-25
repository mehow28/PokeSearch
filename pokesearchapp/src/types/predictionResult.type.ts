 export interface Intent {
    category: string;
    confidenceScore: number;
}

export interface ExtraInformation {
    extraInformationKind: string;
    key: string;
}

export interface Entity {
    category: string;
    text: string;
    offset: number;
    length: number;
    confidenceScore: number;
    extraInformation: ExtraInformation[];
}

export interface Prediction {
    topIntent: string;
    projectKind: string;
    intents: Intent[];
    entities: Entity[];
}

export interface Result {
    query: string;
    prediction: Prediction;
}

export interface RootObject {
    kind: string;
    result: Result;
}
