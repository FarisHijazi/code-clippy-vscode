import fetch from "node-fetch";
import * as openai from 'openai';

export type FetchCodeCompletions = {
    completions: Array<string>
}

export function fetchCodeCompletionTexts(prompt: string, fileName: string, MODEL_NAME: string, API_KEY: string, USE_GPU: boolean): Promise<FetchCodeCompletions> {
    console.log(MODEL_NAME);
    const API_URL = `http://127.0.0.1:8080/generate`;
    // Setup header with API key
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const headers = { "Authorization": `Bearer ${API_KEY}` };
    return new Promise((resolve, reject) => {
        // Send post request to inference API
        return fetch(API_URL, {
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
        })
            .then(res => res.json())
            .then(json => {
                json = [json]
                if (Array.isArray(json)) {
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
                }
                else {
                    console.log(json);
                    throw new Error(json["error"]);
                }
            })
            .catch(err => reject(err));
    });
}

export function fetchCodeCompletionTextsFaux(prompt: string): Promise<FetchCodeCompletions> {
    console.log('fastertransformer');
    return new Promise((resolve, reject) => {
        const oa = new openai.OpenAIApi(
            new openai.Configuration({
                apiKey: "dummy",
                basePath: "http://localhost:5000/v1",
            }),
        );
        const response = oa.createCompletion({
            model: "fastertransformer",
            prompt: prompt as openai.CreateCompletionRequestPrompt,
            stop: ["\n\n"],
        });
        return response
            .then(res => res.data.choices)
            .then(choices => {
                if (Array.isArray(choices)) {
                    const completions = Array<string>();
                    for (let i = 0; i < choices.length; i++) {
                        const completion = choices[i].text?.trimStart();
                        if (completion === undefined) continue;
                        if (completion?.trim() === "") continue;

                        completions.push(
                            completion
                        );
                    }
                    console.log(completions);
                    resolve({ completions });
                }
                else {
                    console.log(choices);
                    throw new Error("Error");
                }
            })
            .catch(err => reject(err));
    });
}



