import fetch from "node-fetch";
import * as openai from 'openai';

export type FetchCodeCompletions = {
    completions: Array<string>
}

export function fetchCodeCompletionTexts(prompt: string, fileName: string, MODEL_NAME: string, API_URL: string, API_KEY: string, API_FORMAT: string): Promise<FetchCodeCompletions> {
    prompt = "Filename: " + fileName + "\n---\n" + prompt

    console.log(MODEL_NAME);
    // const API_URL = `http://127.0.0.1:8080/generate`;
    // Setup header with API key
    // eslint-disable-next-line @typescript-eslint/naming-convention
    return new Promise((resolve, reject) => {
        const fetchOpenAI = () => fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({
                "model": MODEL_NAME,
                "messages": [{"role": "user", "content": prompt}],
                "max_new_tokens": 16,
                "return_full_text": false,
                "do_sample": true,
                "temperature": 0.8,
                "top_p": 0.95,
                "max_time": 10.0,
                "num_return_sequences": 3
            }),
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${API_KEY}`
            },
        });

        
        const fetchHF = () => fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({
                "inputs": prompt,
                "parameters": {
                    "max_new_tokens": 16,
                    "return_full_text": false,
                    "do_sample": true,
                    "temperature": 0.8,
                    "top_p": 0.95,
                    "max_time": 10.0,
                    "num_return_sequences": 3
                }
            }),
            headers: {
              'Content-Type': 'application/json',
              "Authorization": `Bearer ${API_KEY}`
            },
        });

        var fetchFunction = fetchHF;
        switch(API_FORMAT) {
            case "OpenAI":
                fetchFunction = fetchOpenAI;
            case "HuggingFace API":
                break;
            case "HuggingFace text-generation-inference":
                break;
            case "FauxPilot":
                throw Error("FauxPilot type not implemented, how did we even get in here?")
            default:
                break;
        }

        // Send post request to inference API
        return fetchFunction()
            .then((res: { json: () => any; }) => res.json())
            .then((json: any | any[]) => {
                if (!json) {
                    console.log('Got empty JSON response')
                    return
                }

                if (!Array.isArray(json)) {
                    if ("error" in json) {
                        console.log(json);
                        throw new Error(json["error"]);
                    }
                }

                switch(API_FORMAT) {
                    case "OpenAI":
                        json = [{"generated_text": json["choices"][0]["message"]["content"]}]
                    case "HuggingFace API":
                        break
                    case "HuggingFace text-generation-inference":
                        json = [json]
                        break
                    case "FauxPilot":
                        throw Error("FauxPilot type not implemented, how did we even get in here?")
                    default:
                        break;
                }

                const completions = Array<string>();
                for (let i = 0; i < json.length; i++) {
                    const completion = json[i].generated_text.trimStart();
                    if (completion.trim() === "") continue;

                    completions.push(
                        completion
                    );
                }
                console.log(completions);
                resolve({ completions });
            })
            .catch((err: any) => reject(err));
    });
}
