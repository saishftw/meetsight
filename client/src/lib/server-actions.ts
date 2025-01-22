'use server'

import path from "path";
import fs from 'fs';
import { gptApiBaseUrl } from "./config";
import { BotResponse, ImportMetadata, Insights } from "./domains";

const collectionNamePrefix = "insightsbot"
const insightsFolderName = "insights"

export const generateInsights = async (transcript: string, train: boolean, meetingId: string): Promise<Insights> => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const data = JSON.stringify({
        "transcript": transcript,
        "train": train,
        "collectionName": `${collectionNamePrefix}-${meetingId}`
    });

    const requestOptions: RequestInit = {
        method: "POST",
        headers: myHeaders,
        body: data,
        redirect: "follow"
    };

    return fetch(`${gptApiBaseUrl}/generateInsights`, requestOptions)
        .then((response) => response.json())
        .then((result) => result)
        .catch((error) => console.error(error));
}

export const startConversation = async (): Promise<string> => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const requestOptions: RequestInit = {
        method: "POST",
        headers: myHeaders,
        redirect: "follow"
    };

    return fetch(`${gptApiBaseUrl}/conversation/start`, requestOptions)
        .then((response) => response.json())
        .then((result) => result.conversationId)
        .catch((error) => console.error(error));
}

export const sendUserQuery = async (query: string, conversationId: string, meetingId: string): Promise<BotResponse> => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const requestOptions: RequestInit = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow",
    };

    const collectionName = `${collectionNamePrefix}-${meetingId}`

    return fetch(`${gptApiBaseUrl}/document/query?conversationId=${conversationId}&query=${query}&collectionName=${collectionName}`, requestOptions)
        .then((response) => response.json())
        .then((result) => result)
        .catch((error) => {
            console.error(error)
            throw error
        });
}

export const saveFile = (data: ImportMetadata): boolean => {
    const folderPath = path.join(process.cwd(), insightsFolderName);

    // Create the data folder if it doesn't exist
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    const filePath = path.join(folderPath, `${data.meetingId}.json`);

    try {
        // Save the data to the file
        fs.writeFileSync(filePath, JSON.stringify(data));
        return true
    } catch (err) {
        console.error(err);
        return false
    }
}

export const getMeetingFile = async (meetingId: string): Promise<ImportMetadata> => {
    return new Promise((resolve, reject) => {
        const folderPath = path.join(process.cwd(), insightsFolderName);
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }
        const filePath = path.join(folderPath, `${meetingId}.json`);
        // const fullPath = path.resolve(filePath);

        fs.access(filePath, fs.constants.R_OK, (err) => {
            if (err) {
                reject(new Error(`Cannot access file ${filePath}: ${err.message}`));
                return;
            }

            fs.readFile(filePath, (err, data) => {
                if (err) {
                    reject(new Error(`Error reading file ${filePath}: ${err.message}`));
                } else {
                    let meetingDetails: ImportMetadata = JSON.parse(data.toString())
                    resolve(meetingDetails);
                }
            });
        });
    });
}  
