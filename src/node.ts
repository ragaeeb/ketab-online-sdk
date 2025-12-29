/**
 * Node.js-specific exports for ketab-online-sdk.
 * These functions require Node.js filesystem APIs and will not work in browsers.
 *
 * @module ketab-online-sdk/node
 */
import fs from 'node:fs/promises';
import { getBookContents } from './index';

// Re-export everything from the main entry for convenience
export * from './index';

/**
 * Downloads the book with the given ID and saves it to the specified output file.
 * This function requires Node.js filesystem APIs and will not work in browsers.
 *
 * @param {number} id - The ID of the book to download.
 * @param {string} outputFile - The path where the book should be saved.
 * @returns {Promise<string>} A promise that resolves with the path to the output file.
 */
export const downloadBook = async (id: number, outputFile: string): Promise<string> => {
    const contents = await getBookContents(id);
    await fs.writeFile(outputFile, JSON.stringify(contents));
    return outputFile;
};
