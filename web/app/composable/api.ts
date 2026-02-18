import axios from "axios";
import type { SendUrlResponse } from "../../types";

async function sendUrl(url: string): Promise<SendUrlResponse> {
    const response = await axios.post('http://localhost:3000/api/insert', {
        url
    });

    return response.data
}

export default {
    sendUrl,
}
