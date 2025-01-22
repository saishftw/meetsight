// 'use server'

// import * as fs from 'fs/promises'; // For asynchronous file system access

// const sessionDirectoryPath = '/insights';

// export async function getSessionList(): Promise<string[]> {
//     try {
//         const directoryEntries = await fs.readdir(sessionDirectoryPath, { withFileTypes: true });

//         const folderNames: string[] = [];
//         for (const entry of directoryEntries) {
//             if (entry.isDirectory()) {
//                 folderNames.push(entry.name);
//             }
//         }

//         return folderNames;
//     } catch (error) {
//         console.error('Error fetching folder names:', error);
//         return [];
//     }
// }

// export async function getSession(sessionId: number): Promise<string> {
//     try {
//         const data = await fs.readFile(`${sessionDirectoryPath}/${sessionId}`, encoding);
//         return data.toString();
//     } catch (error) {
//         throw new Error(`Error reading file "${filePath}": ${error.message}`);
//     }
// }
