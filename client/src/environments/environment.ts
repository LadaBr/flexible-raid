// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  api: {
    baseUrl: "http://127.0.0.1:3000/api",
    ws: "ws://localhost:3000/api/ws"
  },
  discord: {
    clientId: "1010124488303714367",
    api: {
      baseUrl: "https://discord.com/api/",
      version: 10,
      imageBaseUrl: "https://cdn.discordapp.com/",
    }
  },
  raidHelper: {
    token: "U2FsdGVkX1/I/r113e1gCX8ZvdGb2Wfz7lCNY8QatrP36bV3GK1HbsMNFPv87dRy"
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
