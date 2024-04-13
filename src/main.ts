import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

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
			try {
			const activeFilecontent=await this.app.vault.cachedRead(activeFile)
			const payloadActiveContent = {
				activeFilecontent: activeFilecontent,
				activeFileTitle: activeFileTitle
			};
			    // 使用fetch发送内容
			const response = await fetch('http://your-api-url.com', {
					method: 'POST',
					headers: {
					'Content-Type': 'application/json',
					},
					body:  JSON.stringify(payloadActiveContent)
				});
				if (!response.ok) {
					throw new Error(response.statusText);
				}
				  // get response from server
				return await response.json();
				} catch (error) {
				console.error('Error:', error);
				throw error;
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
// async function sendDataToBackend(yourData) {
// 	try {
// 	  const response = await fetch('http://your-api-url.com', {
// 		method: 'POST',
// 		headers: {
// 		  'Content-Type': 'application/json',
// 		},
// 		body: JSON.stringify(yourData)
// 	  });
// 	  if (!response.ok) throw new Error(response.statusText);
// 	  const data = await response.json();
// 	  return data;
// 	} catch (error) {
// 	  console.error('错误:', error);
// 	  // 这里可以处理错误，或者将错误抛出供函数调用者处理
// 	  throw error;
// 	}
//   }
