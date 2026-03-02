import axios from "axios";
import type { SendUrlResponse } from "../../types";

async function sendUrl(url: string): Promise<SendUrlResponse> {
    const config = useRuntimeConfig()
    const response = await axios.post(`${config.public.apiUrl}api/insert`, {
        url
    });

    return response.data
}

export default {
    sendUrl,
}
