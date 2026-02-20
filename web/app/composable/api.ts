import axios from "axios";
import type { SendUrlResponse } from "../../types";

async function sendUrl(url: string): Promise<SendUrlResponse> {
    const serverUrl = `${useRuntimeConfig().public.apiUrl}/api/insert`;
    const response = await axios.post(serverUrl, {
        url
    });

    return response.data
}

export default {
    sendUrl,
}
