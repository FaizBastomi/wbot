import { Item } from 'ytsr';

/**
 * Search on YouTube
 * @param {String} query your query to search on YouTube
 * @param {String} type filter
 */
declare function search(query: string, type: 'short' | 'long'): Promise<Item>;

/**
 * Download Audio from YouTube
 * @param url YouTube url video
 */
declare function yta(url: string): Promise<{
    title: string;
    filesize: number;
    filesizeF: string;
    id: string;
    thumb: string;
    q: string;
    dl_link: string
}>;

/**
 * Download Video from YouTube
 * @param url YouTube url video
 */
declare function ytv(url: string): Promise<{
    title: string;
    filesize: number;
    filesizeF: string;
    id: string;
    thumb: string;
    q: string;
    dl_link: string
}>;

export { search, yta, ytv };
