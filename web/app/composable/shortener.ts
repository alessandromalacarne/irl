import { nanoid } from "nanoid";

function shorten(url: string): string {
    const id = nanoid(6);

    localStorage.setItem(id, url);

    return `Shortening: ${url} for ${id}`
}


export default shorten;
