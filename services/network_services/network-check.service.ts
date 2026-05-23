import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Network } from '@capacitor/network';

@Injectable({
  providedIn: 'root'
})

export class NetworkCheckService {

  private _isConnected = new BehaviorSubject<boolean>(true);
  public isConnected$ = this._isConnected.asObservable();

  constructor() { 
    this.initializeNetworkEvents();
  }

  async initializeNetworkEvents() {
    const status = await Network.getStatus();
    this._isConnected.next(status.connected);

    Network.addListener('networkStatusChange', (status) => {
      this._isConnected.next(status.connected);
    });
  }

  // Optional method for direct status retrieval
  async getCurrentStatus(): Promise<boolean> {
    const status = await Network.getStatus();
    return status.connected;
  }

}