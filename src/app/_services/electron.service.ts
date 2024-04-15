import { Injectable, NgZone } from '@angular/core';
import { ElectronAPIBridge } from '../../electron/types/api.bridge';
import { TvApp } from '../types/app';

declare global {
	interface Navigator {
	  connection: any;
	  mozConnection: any;
	  webkitConnection: any;
	}
}

@Injectable({providedIn: 'root'})
export class ElectronService{

	
    private _bridge:ElectronAPIBridge = (window as any).electronAPI;
    constructor(private zone: NgZone) {
		
	}

    appClose(){
        this._bridge.appClose();
    }
    

    openUrl(app:TvApp){
        this._bridge.openUrl(app);
    }

    public receive<Out>(channel: string, callback: (output: Out) => void): void {
		if (this._bridge) {
			this._bridge.receive<Out>(channel, (output) => {
				console.log(`Received from main process channel [${channel}]`, output);

				this.zone.run(() => {
					callback(output);
				});
			});
		}else{
			console.error('bridge no disponible?')
		}
	}
}

