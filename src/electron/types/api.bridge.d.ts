import { TvApp } from "../../app/types/app";

export interface ElectronAPIBridge{
    appClose: ()=>void;
    openUrl:(app:TvApp) => void;
    receive<Out>(channel: string, callback: (output: Out) => void): void;
}