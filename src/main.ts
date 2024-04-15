import { App, Editor, EditorPosition, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, RequestUrlParam, Setting, requestUrl } from 'obsidian';
import { styleSettingOptions } from './constSetting'

interface AbstractGPluginSettings {
	defaultStyle: string;
	isStreamOpen: boolean;
	LLMModel: string;
	defaultLength: number;
}

const DEFAULT_SETTINGS: AbstractGPluginSettings = {
	defaultStyle: "normal_promot",
	isStreamOpen: false,
	LLMModel: "ERNIE_35_8K",
	defaultLength: 200
}

export default class AbstractGeneratePlugin extends Plugin {
	settings: AbstractGPluginSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('book-heart', 'Generate Summary', () => {
			generateSummary.call(this, this.app.workspace.getActiveViewOfType(MarkdownView), {
				style: this.settings.defaultStyle,
				isStreamOpen: this.settings.isStreamOpen,
				LLMModel: this.settings.LLMModel, length:
					this.settings.defaultLength
			})
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('abstract-generate-icon');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		//shortcuts for gernate different style content		
		for (const [key, value] of Object.entries(styleSettingOptions)) {
			this.addCommand({
				id: `${key}_generate`,
				name: `生成${value}摘要`,
				editorCallback: (editor: Editor, view: MarkdownView) => {
					generateSummary.call(this, view, {
						style: key,
						isStreamOpen: this.settings.isStreamOpen,
						LLMModel: this.settings.LLMModel, length: this.settings.defaultLength
					})
				}
			});
		}

		// This adds a simple command that can be triggered anywhere
		// this.addCommand({
		// 	id: 'open-sample-modal-simple',
		// 	name: 'Open sample modal (simple)',
		// 	callback: () => {
		// 		new SampleModal(this.app).open();
		// 	}
		// });
		// This adds an editor command that can perform some operation on the current editor instance
		// this.addCommand({
		// 	id: 'sample-editor-command',
		// 	name: 'Sample editor command',
		// 	editorCallback: (editor: Editor, view: MarkdownView) => {
		// 		console.log(editor.getSelection());
		// 		editor.replaceSelection('Sample Editor Command');
		// 	}
		// });
		// // This adds a complex command that can check whether the current state of the app allows execution of the command
		// this.addCommand({
		// 	id: 'open-sample-modal-complex',
		// 	name: 'Open sample modal (complex)',
		// 	checkCallback: (checking: boolean) => {
		// 		// Conditions to check
		// 		const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
		// 		if (markdownView) {
		// 			// If checking is true, we're simply "checking" if the command can be run.
		// 			// If checking is false, then we want to actually perform the operation.
		// 			if (!checking) {
		// 				new SampleModal(this.app).open();
		// 			}

		// 			// This command will only show up in Command Palette when the check function returns true
		// 			return true;
		// 		}
		// 	}
		// });

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new PromotSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		// this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
		// 	console.log('click', evt);
		// });

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		// this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class PromotSettingTab extends PluginSettingTab {
	plugin: AbstractGeneratePlugin;

	constructor(app: App, plugin: AbstractGeneratePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		// default style setting
		new Setting(containerEl)
			.setName('默认风格')
			.setDesc('选择摘要的生成风格')
			.addDropdown((dropdown) => {


				dropdown
					.addOptions(styleSettingOptions)
					.setValue(this.plugin.settings.defaultStyle)
					.onChange(async (value) => {
						this.plugin.settings.defaultStyle = value;
						await this.plugin.saveSettings();
					});
			});
		// is stream open setting
		new Setting(containerEl)
			.setName('是否开启流式生成')
			.setDesc('开启后，将会实时返回摘要结果')
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.isStreamOpen)
					.onChange(async (value) => {
						this.plugin.settings.isStreamOpen = value;
					});
			});
		// select LLM model
		new Setting(containerEl)
			.setName('选择模型')
			.setDesc('选择需要使用的模型')
			.addDropdown((dropdown) => {
				const settingOptions = {
					"ERNIE_35_8K": "ERNIE_3.5_8K",
					"ERNIE_35_8K_0205": "ERNIE_3.5_8K_0205",
					"ERNIE_40": "ERNIE_4.0",
					"ERNIE_40_8K_pre": "ERNIE_4.0_8K_preview",
					"ERNIE_40_8K_p": "ERNIE_40_8K_pre(抢占版)",
				}

				dropdown
					.addOptions(settingOptions)
					.setValue(this.plugin.settings.LLMModel)
					.onChange(async (value) => {
						this.plugin.settings.LLMModel = value;
						await this.plugin.saveSettings();
					});
			});
		// default length setting	
		new Setting(containerEl)
			.setName('摘要长度')
			.setDesc('摘要的长度设置')
			.addText(text => {
				text.setValue(this.plugin.settings.defaultLength.toString())
					.onChange(async (value) => {
						this.plugin.settings.defaultLength = parseInt(value);
						await this.plugin.saveSettings();
					});

			});
	}
}


// sendmdToBackend sends data to the backend
async function runPrompt(articleContent: object) {
	const options: RequestUrlParam = {
		// url: 'http://obsidian-abstract.vercel.app/api/',
		url: 'http://127.0.0.1:8000/api/',// for local testing
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(articleContent)
	};
	try {
		const response = await requestUrl(options)
		const data = await response;
		return data;
	} catch (e) {
		console.error(e);
	}
}
// getActiveCursor returns the active cursor
function typeWord(editor: Editor, cursor: EditorPosition, text: string) {
	editor.replaceRange(text, cursor);
}

// functions for stream type, but have not be implement 
// function typeWordStream(editor: Editor) {
// 	let char_index = 0;
// 	let text = 'Hello, World';
//     let cursor = editor.getCursor();
//     let docValue = editor.getValue();

//     if (docValue.endsWith('|')) {
//         docValue = docValue.slice(0, -1);
//     }

//     if (char_index < text.length) {
//         let cursorChar = "|" ;
//         editor.setValue(docValue + text.charAt(char_index) + cursorChar);
//         editor.setCursor({line: cursor.line, ch: cursor.ch + 1}) 
//         char_index++;
//         setTimeout(typeWordStream, 1000/5);  
//     }
// }

// generateSummary generates a summary
async function generateSummary(activeView: MarkdownView,
	args: { style: string, isStreamOpen: boolean, LLMModel: string, length: number } = {
		style: "normal_promot",
		isStreamOpen: false,
		LLMModel: "ERNIE_35_8K",
		length: 200
	},
) {
	if (!activeView) {
		new Notice('No active Markdown view.');
		return;
	}
	const activeFile = activeView.file;
	const activeEditor = activeView.editor;
	const activeCursor = activeEditor.getCursor();
	if (!activeFile) {
		new Notice('No active File.');
		return;
	}

	// const filePath = activefile.vault.adapter.getFullPath(activefile.path);
	const activeFileTitle = activeFile.basename;
	const activeFilecontent = await this.app.vault.cachedRead(activeFile)
	const payloadActiveContent = {
		content: activeFilecontent,
		title: activeFileTitle,
		style: args.style,
		isStreamOpen: args.isStreamOpen,
		LLMModel: args.LLMModel,
		length: args.length.toString()
	};
	// get response from backend for stream type. not implement yet
	// runPrompt(payloadActiveContent)
	// .then(response => response?.json)
	// .then(const reader = body.getReader();
	//       const decoder = new TextDecoder();
	//       ...)
	// .then(generatedJSON => {
	// 	typeWord(activeEditor, activeCursor, generatedJSON.result);
	// 	new Notice('Summary Generated Successfully!✨');
	// 	new Notice('tokens consumed: ' + generatedJSON.usage.total_tokens);
	// })
	// .catch(
	// 	e => {console.error(e);
	// 	new Notice('Summary Generatation Failed!😭');
	// }
	// );	
	const response = await runWithLoading(activeEditor, activeCursor, runPrompt, [payloadActiveContent]);
	if (response) {
		const generatedJSON = JSON.parse(response.json);
		typeWord(activeView.editor, activeCursor, generatedJSON.result);
		new Notice('Summary Generated Successfully!✨');
		new Notice('tokens consumed: ' + generatedJSON.usage.total_tokens);
	} else {
		new Notice('Summary Generatation Failed!😭');
	}

}
// add cute animation when waiting for the response
async function runWithLoading(editor: Editor, pos: EditorPosition, asyncFunc: Function, args: any[]) {
	let chars = ["|", "/", "-", "\\"];
	let i = 0;

	let loadingStrPos = { ...pos };
	editor.replaceRange(chars[i++ % chars.length], pos);

	// waiting for the function to finish
	let interval = setInterval(() => {
		let replacePos = { ...loadingStrPos };
		editor.replaceRange(chars[i++ % chars.length], replacePos, { line: replacePos.line, ch: replacePos.ch + 1 });
	}, 100);

	let result = await asyncFunc(...args);

	// clear the loading animation
	clearInterval(interval);
	editor.replaceRange('', loadingStrPos, { line: loadingStrPos.line, ch: loadingStrPos.ch + 1 });
	return result;
}
