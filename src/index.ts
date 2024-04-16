import { BrowserView, BrowserWindow, app, ipcMain } from "electron";
import { TvApp } from "./app/types/app";
import { ElectronBlocker } from "@cliqz/adblocker-electron";
const url = require('url');
const path = require('path');


export class AppWindow{

    private win:BrowserWindow;
    appWebview: BrowserView|undefined;
    constructor(){
        this.win = new BrowserWindow({
            width: 1280,
            height: 800,
            title:'Angular Electron App',
            fullscreen:true,
            titleBarStyle:'hidden',
            webPreferences:{
                webviewTag:true,
                preload:AppWindow.fPath('./electron/preload.js')
            }
        });
        
        let isServed = false;
        if(process.argv.find(i => i.includes('--serve'))){
            isServed = true;
        }
    
        if(!isServed){
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


    private addElectronEvents(){
        ipcMain.on('app-close',(e:any) =>{
            app.exit();
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

