import { BrowserView, BrowserWindow, app, ipcMain, shell } from "electron";
import { TvApp } from "./app/types/app";
import { ElectronBlocker } from "@cliqz/adblocker-electron";
const url = require('url');
const path = require('path');


export class AppWindow{

    private win:BrowserWindow;
    appWebview: BrowserView|undefined;


    appSettings: {
        isServed: boolean;
        windowed: boolean;
    };

    constructor(){
        this.appSettings = this.getConfig();
        this.win = new BrowserWindow({
            width: 1280,
            height: 800,
            title:'Angular Electron App',
            fullscreen:!this.appSettings.windowed,
            titleBarStyle:'hidden',
            webPreferences:{
                webviewTag:true,
                preload:AppWindow.fPath('./electron/preload.js')
            }
        });
        
     
    
        if(!this.appSettings.isServed){
            this.win.loadURL(url.format({      
                pathname: path.join(
                    __dirname,
                    './index.html'),       
                protocol: 'file:',      
                slashes: true     
            }));
        }else{
            this.win.loadURL('http://localhost:4200');
        }
        this.addElectronEvents();

        ElectronBlocker.fromPrebuiltAdsAndTracking(fetch).then((blocker) => {
            blocker.enableBlockingInSession(this.win.webContents.session);
        });
    }

    private getConfig(){
        let config = {
            windowed:false,
            isServed:false
        };
        if(process.argv.find(i => i.includes('--serve'))){
            config.isServed = true;
        }

        if(process.argv.find(i => i.includes('--windowed'))){
            config.windowed = true;
        }
        return config;
    }


    private addElectronEvents(){
        ipcMain.on('app-close',(e:any) =>{
            app.exit();
        });

        ipcMain.on('open-url',(e:any,payload:TvApp) =>{
            console.log(e);
            shell.openExternal(payload.url);
        });
    }

    public static fPath(f:string){
        return path.join(__dirname,f);
    }


    private sendEvent(eventName:string,obj:any = null){
		this.win.webContents.send(eventName,obj);
	}
}




app.on('ready', async ()=> {
    //await components.whenReady();
    let appWindow = new AppWindow();
});

