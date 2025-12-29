import { type UnzippedEntry, unzipFromUrl } from './io';
import { BOOKS_CDN_URL } from './network';

/**
 * Downloads the raw book content entries for a given book ID.
 *
 * @param id - The ID of the book to download.
 * @returns A promise that resolves with the extracted entries.
 */
export const downloadBookContents = async (id: number): Promise<UnzippedEntry[]> => {
    const entries = await unzipFromUrl(`${BOOKS_CDN_URL}/${id}/${id}.data.zip`);
    return entries;
};
