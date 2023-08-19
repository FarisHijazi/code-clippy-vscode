"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchCodeCompletionTextsFaux = exports.fetchCodeCompletionTexts = void 0;
const node_fetch_1 = require("node-fetch");
const openai = require("openai");
function fetchCodeCompletionTexts(prompt, fileName, MODEL_NAME, API_KEY, USE_GPU) {
    console.log(MODEL_NAME);
    const API_URL = `http://127.0.0.1:8080/generate`;
    // Setup header with API key
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const headers = { "Authorization": `Bearer ${API_KEY}` };
    return new Promise((resolve, reject) => {
        // Send post request to inference API
        return (0, node_fetch_1.default)(API_URL, {
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
            json = [json];
            if (Array.isArray(json)) {
                const completions = Array();
                for (let i = 0; i < json.length; i++) {
                    const completion = json[i].generated_text.trimStart();
                    if (completion.trim() === "")
                        continue;
                    completions.push(completion);
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
exports.fetchCodeCompletionTexts = fetchCodeCompletionTexts;
function fetchCodeCompletionTextsFaux(prompt) {
    console.log('fastertransformer');
    return new Promise((resolve, reject) => {
        const oa = new openai.OpenAIApi(new openai.Configuration({
            apiKey: "dummy",
            basePath: "http://localhost:5000/v1",
        }));
        const response = oa.createCompletion({
            model: "fastertransformer",
            prompt: prompt,
            stop: ["\n\n"],
        });
        return response
            .then(res => res.data.choices)
            .then(choices => {
            var _a;
            if (Array.isArray(choices)) {
                const completions = Array();
                for (let i = 0; i < choices.length; i++) {
                    const completion = (_a = choices[i].text) === null || _a === void 0 ? void 0 : _a.trimStart();
                    if (completion === undefined)
                        continue;
                    if ((completion === null || completion === void 0 ? void 0 : completion.trim()) === "")
                        continue;
                    completions.push(completion);
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
exports.fetchCodeCompletionTextsFaux = fetchCodeCompletionTextsFaux;
