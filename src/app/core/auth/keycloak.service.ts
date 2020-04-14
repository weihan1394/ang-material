import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';
import KeycloakJson from '../../../assets/keycloak.json';

declare var Keycloak: any;

@Injectable()
export class KeycloakService {

    static auth: any = {};
    static redirectUrl: string;

    /**
     * Initialized keycloak client
     */
    static init(): Promise<any> {
        console.log("0");
        let keycloakAuth: any = new Keycloak(KeycloakJson);
        console.log("0.1");
        KeycloakService.auth.loggedIn = false;
        console.log("0.2");

        return new Promise((resolve, reject) => {
            keycloakAuth.init({ onLoad: 'check-sso' })
                .success(() => {
                    console.log("1");
                    KeycloakService.auth.loggedIn = true;
                    console.log("2");
                    KeycloakService.auth.authz = keycloakAuth;
                    console.log("3");
                    KeycloakService.auth.registerUrl = KeycloakService.auth.authz.createRegisterUrl();
                    console.log("4");
                    KeycloakService.auth.logoutUrl = keycloakAuth.authServerUrl + "/realms/" + environment.keycloakRealm + "/protocol/openid-connect/logout?redirect_uri=" + environment.baseUrl + "/index.html";
                    console.log("5");

                    resolve();
                })
                .error(() => {
                    reject();
                });
        });
    }

    /**
     * Checks if the logged user is a member of the specified group
     * 
     * @param groupName group name defined in keycloak
     */
    static hasGroup(groupName: string): boolean {
        return KeycloakService.auth.authz != null && KeycloakService.auth.authz.authenticated && KeycloakService.auth.authz.idTokenParsed.groups.indexOf("/" + groupName) !== -1 ? true : false;
    }

    /**
     * Checks if the logged user is a member of the specified groups
     * 
     * @param groupNames a list of group names defined in keycloak
     */
    static hasGroups(groupNames: string[]): boolean {
        if (!groupNames) {
            return false;
        }
        return groupNames.some(e => {
            if (typeof e === "string") {
                return KeycloakService.hasGroup(e);
            }
        });
    }

    /**
     * Checks if the logged user has the role specified
     * 
     * @param roleName The name of the role
     * @param resource The keycloak client
     */
    static hasRole(roleName: string, resource?: string): boolean {
        return KeycloakService.auth.authz.hasRealmRole(roleName) || KeycloakService.auth.authz.hasResourceRole(roleName) || KeycloakService.auth.authz.hasResourceRole(roleName, resource);
    }

    /**
     * Logout the current user
     */
    static logout() {
        console.log('*** LOGOUT');
        KeycloakService.auth.authz.logout({ redirectUri: KeycloakService.auth.logoutUrl });
        KeycloakService.auth.loggedIn = false;
        KeycloakService.auth.authz = null;
    }

    /**
     * Redirects to keycloak login page
     */
    static login() {
        KeycloakService.auth.authz.login();
    }

    /**
     * Returns the token of the currently logged user
     */
    static getToken(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (KeycloakService.auth.authz.token) {
                KeycloakService.auth.authz.updateToken(5)
                    .success(() => {
                        resolve(<string>KeycloakService.auth.authz.token);
                    })
                    .error(() => {
                        reject('Failed to refresh token');
                    });
            }
        });
    }

    /**
     * Returns true if the current user is logged in
     */
    static isLogged(): boolean {
        return KeycloakService.auth.authz != null && KeycloakService.auth.authz.authenticated;
    }

    /**
     * Returns keycloak registration url
     */
    static createRegisterUrl() {
        return KeycloakService.auth.registerUrl;
    }
}