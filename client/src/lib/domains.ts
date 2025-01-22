export interface Insights {
    summary: string,
    topics: string[],
    sentiment: number,
    issue_tracker: IssueTracker[],
    action_items: string[]
}

export interface IssueTracker {
    issue: string,
    potential_root_cause: string,
    flagged_behaviour: string,
    solutions_by_human: {
        solution: string,
        score: number,
    }[],
    solutions_by_ai: {
        solution: string,
        score: number,
    }[],
}

export interface SessionCreate {
    sessionId: string,
    name: string,
    extractorId: number,
}

export interface Message {
    id?: string,
    body: string,
    sender: Sender
    metadata?: BotResponseMetadata
}

export enum Sender {
    BOT = 'bot',
    HUMAN = 'human'
}

export interface BotResponse {
    response: string,
    metadata: BotResponseMetadata
}

interface BotResponseMetadata {
    sources: DocumentRetrievalSource[];
}

export interface DocumentRetrievalSource {
    name: string,
    pageNumber?: number,
    link?: string,
    docContent: string
}

export interface ImportMetadata {
    transcript: string[],
    insights: any,
    messages: Message[],
    meetingId: string,
    meetingTitle: string,
    readonly: boolean
}

export interface WordRecognized {
    isFinal: boolean;
    text: string;
}
