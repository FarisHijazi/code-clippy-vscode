import * as vscode from 'vscode';
import CSConfig from './config';
import { fetchCodeCompletionTexts } from './utils/fetchCodeCompletions';

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand(
		'extension.code-clippy-settings',
		() => {
			vscode.window.showInformationMessage('Show settings');
		}
	);

	context.subscriptions.push(disposable);

	const provider: vscode.CompletionItemProvider = {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		provideInlineCompletionItems: async (document, position, context, token) => {
			// Grab the api key from the extension's config
			const configuration = vscode.workspace.getConfiguration('', document.uri);
			// if (!USE_FAUXPILOT) {
			const MODEL_NAME = configuration.get("conf.resource.modelName", "");
			const API_KEY = configuration.get("conf.resource.APIKey", "");
			const API_URL = configuration.get("conf.resource.APIUrl", "");
			const API_FORMAT = configuration.get("conf.resource.APIFormat", "");
			// const USE_GPU = configuration.get("conf.resource.useGPU", false);


			// vscode.comments.createCommentController
			const textBeforeCursor = document.getText();
			if (textBeforeCursor.trim() === "") {
				return { items: [] };
			}
			const currLineBeforeCursor = document.getText(
				new vscode.Range(position.with(undefined, 0), position)
			);

			// Check if user's state meets one of the trigger criteria
			if (CSConfig.SEARCH_PHARSE_END.includes(textBeforeCursor[textBeforeCursor.length - 1]) || currLineBeforeCursor.trim() === "") {
				let rs;

				try {
					// Fetch the code completion based on the text in the user's document
					rs = await fetchCodeCompletionTexts(textBeforeCursor, document.fileName, MODEL_NAME, API_URL, API_KEY, API_FORMAT);
				} catch (err) {

					if (err instanceof Error) {
						// Check if it is an issue with API token and if so prompt user to enter a correct one
						if (err.toString() === "Error: Bearer token is invalid" || err.toString() === "Error: Authorization header is invalid, use 'Bearer API_TOKEN'") {
							vscode.window.showInputBox(
								{ "prompt": "Please enter your HF API key in order to use Code Clippy", "password": true }
							).then(apiKey => configuration.update("conf.resource.APIKey", apiKey));

						}
						vscode.window.showErrorMessage(err.toString());
					}
					return { items: [] };
				}

				if (rs == null) {
					return { items: [] };
				}

				// Add the generated code to the inline suggestion list
				const items: any[] = [];
				for (let i = 0; i < rs.completions.length; i++) {
					items.push({
						insertText: rs.completions[i],
						range: new vscode.Range(position.translate(0, rs.completions.length), position),
						trackingId: `snippet-${i}`,
					});
				}
				return { items };
			}
			return { items: [] };
		},
	};

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	vscode.languages.registerInlineCompletionItemProvider({ pattern: "**" }, provider);
}
