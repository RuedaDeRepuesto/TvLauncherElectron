import { IpcRendererEvent } from "electron";
import { TvApp } from "../app/types/app";
import { ElectronAPIBridge } from "./types/api.bridge";

const { contextBridge, ipcRenderer } = require('electron')

console.info('preload script loaded!');

let apiDefinition:ElectronAPIBridge = {
    appClose: () => ipcRenderer.send('app-close'),
    openUrl: (app:TvApp) => ipcRenderer.send('open-url',app),
    receive: <Out>(channel: string, callback: (output: Out) => void) => {
		ipcRenderer.on(channel, (_event: IpcRendererEvent, ...parameters: any[]) =>
			callback(parameters[0])
		);
	}
}

contextBridge.exposeInMainWorld('electronAPI', apiDefinition);