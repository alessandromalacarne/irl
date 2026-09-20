import axios from "axios";
import type { ResolveUrlResponse, SendUrlResponse } from "../../types";

async function sendUrl(url: string): Promise<SendUrlResponse> {
    const config = useRuntimeConfig()
    const response = await axios.post(`${config.public.apiUrl}api/insert`, {
        url
    });

    return response.data
}

async function resolveUrl(id: string): Promise<ResolveUrlResponse> {
    const config = useRuntimeConfig()
    const response = await axios.get(`${config.public.apiUrl}api/urls/${id}`);

    return response.data
}

export default {
    sendUrl,
    resolveUrl,
}
