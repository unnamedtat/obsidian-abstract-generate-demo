import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, RequestUrlParam, Setting, requestUrl } from 'obsidian';

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class AbstractGeneratePlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Generate Summary',async (evt: MouseEvent) => {
			const activeView = getActiveViewMD.call(this);
			if (!activeView) {
				new Notice('No active Markdown view.');
				return;
			}
			const activeFile=activeView.file;
			// get file or its content && title
			// const filePath = activefile.vault.adapter.getFullPath(activefile.path);
			const activeFileTitle=activeFile.basename;
			const activeFilecontent=await this.app.vault.cachedRead(activeFile)
			const payloadActiveContent = {
				content: activeFilecontent,
				title: activeFileTitle
			};
			// get response from backend
			const response = await runPrompt(payloadActiveContent);
			console.log(response);
			if(response){
				new Notice('Summary Generated✨!');
				const generatedJSON=JSON.parse(response.json);
				typeWord(activeView.editor,generatedJSON.result);
			}else{
				new Notice('Summary Generatation Failed!😭');
			}
			
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		// this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
		// 	console.log('click', evt);
		// });

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
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
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: AbstractGeneratePlugin;

	constructor(app: App, plugin: AbstractGeneratePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}

// getActiveViewMD returns the active MarkdownView
function getActiveViewMD() {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);

    return activeView;
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
	try{
	const response = await requestUrl(options)
	const data = await response;
	return data;
	}catch(e){
		console.error(e);
	}
}
// getActiveCursor returns the active cursor
function typeWord(editor: Editor, text: string) {
	let cursor = editor.getCursor(); 
	editor.replaceRange(text, cursor); 
}


// function typeWord2(editor: Editor) {
// 	let enableCursor = true;  // 启用光标效果
// 	let char_index = 0;
// 	let text = 'Hello, World';
//     let cursor = editor.getCursor();
//     let docValue = editor.getValue();

//     //移除原有的光标
//     if (enableCursor && docValue.endsWith('|')) {
//         docValue = docValue.slice(0, -1);
//     }

//     if (char_index < text.length) {
//         let cursorChar = enableCursor ? "|" : "";
//         editor.setValue(docValue + text.charAt(char_index) + cursorChar);
//         editor.setCursor({line: cursor.line, ch: cursor.ch + 1}) //移动光标
//         char_index++;
//         // setTimeout(typeWord2, 1000/5);  // 打字机速度控制, 每秒5个字
//     }
// }



// function run_prompt() {
//     // 调用服务端的流式接口, 修改为自己的服务器地址和端口号
//     fetch('http://<server address>:8000/eb_stream', {
//       method: 'post',
//       headers: {'Content-Type': 'text/plain'},
//       body: JSON.stringify({'prompt': inputValue})
//     })
//     .then(response => {
//       return response.body;
//     })
//     .then(body => {
//       const reader = body.getReader();
//       const decoder = new TextDecoder();
//       function read() {
//         return reader.read().then(({ done, value }) => {
//           if (done) { // 读取完成
//             return;
//           }
//           data = decoder.decode(value, { stream: true });
//           text += JSON.parse(data).result;
//           type();  // 打字机效果输出
//           return read();
//         });
//       }
//       return read();
//     })
//     .catch(error => {
//       console.error('发生错误:', error);
//     });
//   }

