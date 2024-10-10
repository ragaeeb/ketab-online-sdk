import { BookFileApiResponse } from './types/api/bookFile';
import { getFileJson } from './utils/network';

export const getBookFile = async (id: number) => {
    const file: BookFileApiResponse = (await getFileJson(`/${id}.json`)) as BookFileApiResponse;
};

export const search = async (id: number) => {
    const file: BookFileApiResponse = (await getFileJson(`/${id}.json`)) as BookFileApiResponse;
};
