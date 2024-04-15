import { WebviewTag } from "electron";

export interface TvApp{
    running?: boolean;
    name:string;
    url:string;
    icon:string;
    opened?:boolean;
    loading?:boolean;
    defaultUA?:string;
    firstLoad?:boolean;
    webView?:WebviewTag;
    disableAdBlock?:boolean;
    bkColor:string;
}