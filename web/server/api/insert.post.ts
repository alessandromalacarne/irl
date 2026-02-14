import { nanoid } from "nanoid";
import type { SendUrlResponse } from "../../types";

export default defineEventHandler(async (event) => {
    const id = nanoid(6);

    const body = await readBody(event);

    const response: SendUrlResponse = {
        id,
        url: body.url
    }

    return response
}
)
