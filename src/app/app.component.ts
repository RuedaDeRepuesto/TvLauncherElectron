import { AfterViewInit, Component, ElementRef, HostListener, NO_ERRORS_SCHEMA, OnInit, ViewChild, ViewEncapsulation, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ElectronService } from './_services/electron.service';
import { interval, lastValueFrom, timeout, timer } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TvApp } from './types/app';
import { WebviewTag } from 'electron';
import { applyEffect } from "fluent-reveal-effect"
import { BatteryInfo, Device } from '@capacitor/device';
import { Network } from '@capacitor/network';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  encapsulation:ViewEncapsulation.None,
  schemas:[NO_ERRORS_SCHEMA]
})
export class AppComponent implements OnInit,AfterViewInit {



  apps:TvApp[]=[
    {name:'Youtube',bkColor:'#FF0000',url:'https://youtube.com',icon:'https://static.vecteezy.com/system/resources/previews/018/930/572/non_2x/youtube-logo-youtube-icon-transparent-free-png.png',defaultUA:'Mozilla/5.0 (PS4; Leanback Shell) Gecko/20100101 Firefox/65.0 LeanbackShell/01.00.01.75 Sony PS4/ (PS4, , no, CH)'},
    {name:'Netflix',bkColor:'#000000',url:'https://netflix.com',icon:'https://cdn-icons-png.flaticon.com/512/5977/5977590.png'},
    {name:'Disney+',bkColor:'#12277c',url:'https://disneyplus.com',icon:'https://www.svgrepo.com/show/464719/disney-plus.svg'},
    {name:'VideoTest',bkColor:'#000000',url:'https://shaka-player-demo.appspot.com/',icon:''}
  ];
  electronSrv = inject(ElectronService);
  title = 'TVLauncher';
  currentTime:Date = new Date();
  openedApp:TvApp|undefined;
  currentEdit:{
    name:string;
    url:string;
    icon:string;
    defaultUA:string;
    bkColor:string;
    show:boolean
  }={
    name: '',
    url: '',
    icon: '',
    defaultUA: '',
    bkColor: '',
    show:false
  };
  currentApp:TvApp|undefined;
  batteryIcon:string  = 'battery_unknown';
  batteryLevel:string = '';
  signalIcon = 'wifi_off';

  batteryIcons =[
    'battery_alert',
    'battery_1_bar',
    'battery_2_bar',
    'battery_3_bar',
    'battery_4_bar',
    'battery_5_bar',
    'battery_6_bar',
    'battery_full',
  ]

  ngOnInit(): void {
      interval(100).subscribe(() =>{
        this.currentTime = new Date();
      });

      interval(2500).subscribe( async () =>{
        const energy = await Device.getBatteryInfo();
        if(energy.isCharging){
          this.batteryIcon = 'battery_charging_full';
        }else{
          const batteryLevel = (energy.batteryLevel??0)*100;
          const sizes = this.batteryIcons.length;
          const cindex = Math.round(sizes*batteryLevel/100);

          this.batteryIcon = this.batteryIcons[cindex];
        }
        this.batteryLevel = Math.round((energy.batteryLevel??0)*100)+'%';
        const network = await Network.getStatus();
        if(network.connected){
          if(network.connectionType == 'cellular'){
            this.signalIcon = 'signal_cellular_alt';
          }else{
            this.signalIcon = 'wifi';
          }
        }else{
          this.signalIcon = 'wifi_off';
        }
      });

      this.electronSrv.receive('on-app-closed',async (e)=>{
        console.log(e);
      });


      this.electronSrv.receive('browser-window-focus',async ()=>{
        console.log('window focus!');
      })

      //this.addApp();
      
  }

  ngAfterViewInit(): void {
    applyEffect(".btn-container", {
      clickEffect: true,
      lightColor: "rgba(255,255,255,0.6)",
      gradientSize: 80,
      isContainer: true,
      children: {
        borderSelector: ".btn-border",
        elementSelector: ".btn",
        lightColor: "rgba(255,255,255,0.3)",
        gradientSize: 150
      }
    })
  }
  

  async open(a:TvApp){
    a.opened = true;
    this.currentApp = a;
    if(!a.running){
      await lastValueFrom(timer(1000));
      a.running = true;
      await lastValueFrom(timer(1000));
      a.webView = document.getElementById('wv-'+a.name) as WebviewTag;
    }
  }


  async goHome(){
    const cw = this.currentApp?.webView!;
    this.currentApp = undefined;
    this.apps.forEach(a => a.opened = false);
    cw.setAudioMuted(true);
  }

  async refresh(a:TvApp){
    const webView = document.getElementById('wv-'+a.name) as WebviewTag;
    webView.reload();
  }

  async closeApp(){
    const app = this.currentApp!;
    app.webView?.stop();
    app.opened = false;
    app.running = false;
    app.firstLoad = false;
  }


  async addApp(){
    this.currentEdit = {
      name:'newApp',
      url:'',
      icon:'',
      bkColor : '#000000',
      defaultUA:'',
      show:true
    }
  }
}
