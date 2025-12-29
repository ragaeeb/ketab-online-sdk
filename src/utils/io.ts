import { unzipSync } from 'fflate';
import { httpsGet } from './network';

/**
 * Representation of an extracted archive entry containing raw bytes and filename metadata.
 */
export type UnzippedEntry = {
    /** Entry filename */
    name: string;
    /** Entry data as bytes */
    data: Uint8Array;
};

/**
 * Downloads and extracts a ZIP file from a given URL.
 *
 * @param url - The URL of the ZIP file to download and extract.
 * @returns A promise that resolves with the list of all extracted entries.
 */
export const unzipFromUrl = async (url: string): Promise<UnzippedEntry[]> => {
    const binary = await httpsGet<Uint8Array>(url);
    const dataToUnzip = binary instanceof Uint8Array ? binary : new Uint8Array(binary as ArrayBufferLike);

    try {
        const result = unzipSync(dataToUnzip);
        const entries = Object.entries(result).map(([name, data]) => ({ data, name }));
        return entries;
    } catch (error: any) {
        throw new Error(`Error processing URL: ${error.message}`);
    }
};
