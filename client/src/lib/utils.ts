import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { ImportMetadata, Insights } from "./domains";
import { Message } from "../lib/domains";
import { v4 as uuidv4 } from 'uuid';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// export async function downloadHTMLAndCSS() {
//   const html = `<!DOCTYPE html>\n${document.documentElement.outerHTML}`;

//   // Fetch external stylesheets
//   const stylesheets = [];
//   const links = document.querySelectorAll('link[rel="stylesheet"]');
//   for (const link of links) {
//     const response = await fetch(link.href);
//     if (response.ok) {
//       const css = await response.text();
//       stylesheets.push(`<style>${css}</style>`);
//     } else {
//       console.error(`Failed to fetch stylesheet: ${link.href}`);
//     }
//   }

//   const documentHTML = `${html}\n${stylesheets.join('\n')}`;

//   const link = document.createElement('a');
//   link.href = URL.createObjectURL(new Blob([documentHTML], { type: 'text/html' }));
//   const now = new Date()
//   link.download = `insights-${now.toISOString()}.html`; // Change 'page.html' to your desired filename

//   link.click();
//   URL.revokeObjectURL(link.href); // Revoke the temporary URL after download
// }

// export async function downloadPageResources() {
//   const html = `<!DOCTYPE html>\n${document.documentElement.outerHTML}`;

//   // Fetch external stylesheets
//   const stylesheets = [];
//   const links = document.querySelectorAll('link[rel="stylesheet"]');
//   for (const link of links) {
//     const response = await fetch(link.href);
//     if (response.ok) {
//       const css = await response.text();
//       stylesheets.push(`<style>${css}</style>`);
//     } else {
//       console.error(`Failed to fetch stylesheet: ${link.href}`);
//     }
//   }

//   const documentHTML = `${html}\n${stylesheets.join('\n')}`;

//   // Download HTML
//   const blob = new Blob([documentHTML], { type: 'text/html' });
//   const url = URL.createObjectURL(blob);
//   const htmlLink = document.createElement('a');
//   htmlLink.href = url;
//   htmlLink.download = 'page.html';
//   htmlLink.click();
//   URL.revokeObjectURL(url);

//   // Prompt user for JavaScript download
//   const jsContent: BlobPart | null = document.querySelectorAll('script')[0].textContent; // Assuming first script tag contains the page JS
//   const confirmDownload = confirm('Download JavaScript file?');
//   if (confirmDownload) {
//     const jsBlob = new Blob([jsContent], { type: 'text/javascript' });
//     const jsUrl = URL.createObjectURL(jsBlob);
//     const jsLink = document.createElement('a');
//     jsLink.href = jsUrl;
//     jsLink.download = 'page.js';
//     jsLink.click();
//     URL.revokeObjectURL(jsUrl);
//   }
// }

const insightsKey = 'INSIGHTS'
const transcriptsKey = 'TRANSCRIPTS'
const meetingIdKey = 'MEETING_ID'
const meetingTitleKey = 'MEETING_TITLE'
const readonlyKey = 'READONLY'
const transcriptsCustomSeparator = "|"
const conversationIdKey = "CONVERSATION_ID"
const messagesKey = "MESSAGES"
const meetingIdUrlParamKey = "meetingId"

function saveToLocalStorage(key: string, value: any) {
  if (value && typeof window !== 'undefined' && window.localStorage)
    window.localStorage.setItem(key, value)
}

function getFromLocalStorage(key: string) {
  if (typeof window !== 'undefined' && window.localStorage) {
    let value = window.localStorage.getItem(key)
    return value
  }
  else return null
}

export function saveInsightsToLocalStorage(data: Insights) {
  saveToLocalStorage(insightsKey, JSON.stringify(data))
}

export function saveTranscriptsToLocalStorage(data: string[]) {
  if (data.length !== 0) saveToLocalStorage(transcriptsKey, JSON.stringify(data))
}

export function getInsightsFromLocalStorage() {
  let insights = getFromLocalStorage(insightsKey)
  if (insights) return JSON.parse(insights)
  else return insights
}

export function getTranscriptsFromLocalStorage(): string[] {
  let transcriptsStr = getFromLocalStorage(transcriptsKey)
  if (transcriptsStr) return JSON.parse(transcriptsStr)
  else return []
}

export function saveMeetingIdToLocalStorage(meetingId: string) {
  saveToLocalStorage(meetingIdKey, meetingId)
}

export function getMeetingIdFromLocalStorage(): string | null {
  let meetingId = getFromLocalStorage(meetingIdKey)
  return meetingId
}

export function saveReadonlyToLocalStorage(readonly: boolean) {
  saveToLocalStorage(readonlyKey, readonly)
}

export function getReadonlyFromLocalStorage() {
  return Boolean(getFromLocalStorage(readonlyKey)) ?? false
}

export function getMeetingTitleFromLocalStorage(): string | null {
  let meetingTitle = getFromLocalStorage(meetingTitleKey)
  return meetingTitle
}

export function saveMeetingTitleToLocalStorage(meetingTitle: string) {
  saveToLocalStorage(meetingTitleKey, meetingTitle)
}

type SchemaType = string | number | boolean | object | Array<any>;

interface PropertySchema {
  type: string;
  properties?: { [key: string]: SchemaType };
  items?: SchemaType;
}

export function schemaToText(schema: SchemaType, indent = ""): string {
  // Handle different schema types
  if (typeof schema === "string") {
    return `${indent}- ${schema}\n`;
  } else if (Array.isArray(schema)) {
    return schema.map((item) => schemaToText(item, indent + "  ")).join("");
  } else if (typeof schema === "object") {
    const text = Object.entries(schema as PropertySchema)
      .map(([key, value]) => `${indent}- ${key}:\n` + schemaToText(value, indent + "  "))
      .join("");
    return text.length > 0 ? text : `${indent}- {}\n`;
  } else {
    return `${indent}- ${schema}\n`;
  }
}

enum FileType {
  TXT = "txt",
  JSON = "json"
}

function download(filename: string, fileType: FileType, text: string): void {
  // Create a Blob object with the text data and specify the MIME type
  let blobType
  if (fileType == FileType.TXT) blobType = "text/plain;charset=utf-8"
  else if (fileType == FileType.JSON) blobType = "application/json"

  const blob = new Blob([text], { type: blobType });

  // Create a temporary URL for the Blob object
  const url: string = window?.URL.createObjectURL(blob);

  // Create a link element to trigger the download
  const link: HTMLAnchorElement = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";

  // Append the link to the document body and simulate a click to initiate download
  document.body.appendChild(link);
  link.click();

  // Clean up resources by removing the link and revoking the object URL
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function getMeetingIdUrlParam() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(meetingIdUrlParamKey);
}

function setMeetingIdUrlParam(meetingId: string) {
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set(meetingIdUrlParamKey, meetingId);
  window.history.replaceState({}, '', currentUrl.toString());
}

export function generateMeetingId() {
  return uuidv4()
}

export function getMeetingId() {
  let meetingId = getMeetingIdFromLocalStorage()

  if (!meetingId) {
    // generates a new meeting id
    meetingId = generateMeetingId()
    saveMeetingIdToLocalStorage(meetingId)
    // setMeetingIdUrlParam(meetingId)
  }

  return meetingId
}

function getMeetingTitle() {
  let meetingTitle = getMeetingTitleFromLocalStorage()

  if (!meetingTitle) {
    // generates a new meeting id
    meetingTitle = prompt("What do you want to call this meeting?") ?? ""
    saveMeetingTitleToLocalStorage(meetingTitle)
  }

  return meetingTitle
}

export function prepareMeetingDetails(): ImportMetadata {
  const meetingId = getMeetingId()
  const meetingTitle = getMeetingTitle()
  const transcript = getTranscriptsFromLocalStorage()
  const insights = getInsightsFromLocalStorage()
  const messages = getMessagesFromLocalStorage()
  const readonly = true

  const details: ImportMetadata = {
    transcript,
    insights,
    messages,
    meetingId,
    meetingTitle,
    readonly
  }

  return details
}

export function saveInsights() {

  const meetingDetails = prepareMeetingDetails()
  let insightsText = ""
  if (meetingDetails.insights) insightsText = schemaToText(meetingDetails.insights)

  const date = new Date()
  if (meetingDetails.transcript) download(`transcript-${date.toLocaleString()}`, FileType.TXT, meetingDetails.transcript.join("\n"))
  if (insightsText) download(`insights-${date.toLocaleString()}`, FileType.TXT, insightsText)
  if (meetingDetails) download(`metadata-${date.toLocaleString()}`, FileType.JSON, JSON.stringify(meetingDetails))
  // if (insightsText) download(`insights-json-${date.toLocaleString()}`, JSON.stringify(insights))
}

export function clearLocalStorage() {
  localStorage.clear()
}

export function saveConversationIdToLocalStorage(data: string) {
  if (data.length !== 0 && typeof window !== 'undefined' && window.localStorage)
    window.localStorage.setItem(conversationIdKey, data)
}

export function getConversationIdFromLocalStorage() {
  if (typeof window !== 'undefined' && window.localStorage)
    return window.localStorage.getItem(conversationIdKey)
  else return null
}

export function saveMessagesToLocalStorage(data: Message[]) {
  if (data.length !== 0 && typeof window !== 'undefined' && window.localStorage)
    window.localStorage.setItem(messagesKey, JSON.stringify(data))
}

export function getMessagesFromLocalStorage(): Message[] {
  if (typeof window !== 'undefined' && window.localStorage) {
    let messages = window.localStorage.getItem(messagesKey)
    if (messages)
      return JSON.parse(messages)
    else return []
  }
  else return []
}

// export function saveMeetingToLocalStorage(meetingDetails: ImportMetadata) {
//   saveTranscriptsToLocalStorage(meetingDetails.transcript)
//   saveInsightsToLocalStorage(meetingDetails.insights)
//   saveMessagesToLocalStorage(meetingDetails.messages)
//   saveMeetingIdToLocalStorage(meetingDetails?.meetingId)
//   saveMeetingTitleToLocalStorage(meetingDetails?.meetingTitle)
//   saveReadonlyToLocalStorage(meetingDetails?.readonly)

//   // window.location.reload()
// }

export function generateShareLink(meetingId: string) {
  const currentURL = window.location.href;
  const url = new URL(currentURL);
  url.searchParams.set(meetingIdUrlParamKey, meetingId)

  return url.toString()
}

export async function copyLink(link: string) {
  try {
    await navigator.clipboard.writeText(link);
    alert('Link copied to clipboard');
  } catch (err) {
    console.error('Failed to copy link:', err);
  }
};

