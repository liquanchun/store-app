import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { GlobalState } from '../global.state';
@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private _state: GlobalState) {

    }
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let url: string = state.url;
        this._state.notifyDataChanged('newurl', url);
        return true;
    }
}