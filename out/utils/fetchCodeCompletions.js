"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchCodeCompletionTextsOpenAI = exports.fetchCodeCompletionTexts = void 0;
const node_fetch_1 = require("node-fetch");
const openai = require("openai");
function fetchCodeCompletionTexts(prompt, fileName, MODEL_NAME, API_URL, API_KEY, API_FORMAT, USE_GPU) {
    prompt = "Filename: " + fileName + "\n---\n" + prompt;
    // if (API_FORMAT.valueOf() === "OpenAI") {
    //     return fetchCodeCompletionTextsOpenAI(prompt, MODEL_NAME, API_URL, API_KEY, USE_GPU)
    // }
    console.log(MODEL_NAME);
    // const API_URL = `http://127.0.0.1:8080/generate`;
    // Setup header with API key
    // eslint-disable-next-line @typescript-eslint/naming-convention
    return new Promise((resolve, reject) => {
        const fetchOpenAI = () => (0, node_fetch_1.default)(API_URL, {
            method: "POST",
            body: JSON.stringify({
                "model": MODEL_NAME,
                "messages": [{ "role": "user", "content": prompt }],
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
        const fetchHF = () => (0, node_fetch_1.default)(API_URL, {
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
        switch (API_FORMAT) {
            case "OpenAI":
                fetchFunction = fetchOpenAI;
            case "HuggingFace API":
                break;
            case "HuggingFace text-generation-inference":
                break;
            case "FauxPilot":
                throw Error("FauxPilot type not implemented, how did we even get in here?");
            default:
                break;
        }
        // Send post request to inference API
        return fetchFunction()
            .then((res) => res.json())
            .then((json) => {
            if (!json) {
                console.log('Got empty JSON response');
                return;
            }
            if (!Array.isArray(json)) {
                if ("error" in json) {
                    console.log(json);
                    throw new Error(json["error"]);
                }
            }
            switch (API_FORMAT) {
                case "OpenAI":
                    json = [{ "generated_text": json["choices"][0]["message"]["content"] }];
                case "HuggingFace API":
                    break;
                case "HuggingFace text-generation-inference":
                    json = [json];
                    break;
                case "FauxPilot":
                    throw Error("FauxPilot type not implemented, how did we even get in here?");
                default:
                    break;
            }
            const completions = Array();
            for (let i = 0; i < json.length; i++) {
                const completion = json[i].generated_text.trimStart();
                if (completion.trim() === "")
                    continue;
                completions.push(completion);
            }
            console.log(completions);
            resolve({ completions });
        })
            .catch((err) => reject(err));
    });
}
exports.fetchCodeCompletionTexts = fetchCodeCompletionTexts;
function fetchCodeCompletionTextsOpenAI(prompt, MODEL_NAME, API_URL, API_KEY, USE_GPU) {
    console.log('fastertransformer');
    return new Promise((resolve, reject) => {
        const oa = new openai.OpenAIApi(new openai.Configuration({
            apiKey: API_KEY,
            basePath: API_URL.replace("/chat/completions", ""),
        }));
        const response = oa.createCompletion({
            model: MODEL_NAME,
            prompt: prompt,
            stop: ["\n\n"],
            // "max_new_tokens": 16,
            // "return_full_text": false,
            // "do_sample": true,
            "temperature": 0.8,
            "top_p": 0.95,
            // "max_time": 10.0,
            // "num_return_sequences": 3
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
exports.fetchCodeCompletionTextsOpenAI = fetchCodeCompletionTextsOpenAI;
