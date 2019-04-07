const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';
let credentials = null;

module.exports = {
    connect: () => {
        return new Promise((resolve, reject) => {
            fs.readFile('credentials.json', (err, content) => {
                if (err) return console.log('Error loading client secret file:', err);
                // Authorize a client with credentials, then call the Google Sheets API.  
                const credentials = JSON.parse(content);    
                const { client_secret, client_id, redirect_uris } = credentials.installed;
                const oAuth2Client = new google.auth.OAuth2(
                    client_id, client_secret, redirect_uris[0]);
            
                // Check if we have previously stored a token.
                fs.readFile(TOKEN_PATH, (err, token) => {
                    if (err) {
                        reject(err);
                    };
                    
                    oAuth2Client.setCredentials(JSON.parse(token));
                    resolve(oAuth2Client);
                });
            });   
        });
        
    },
    
    checkToken: () => {
        return new Promise((resolve, reject) => {
            fs.readFile('credentials.json', (err, content) => {
                if (err) {
                    console.log('Error loading client secret file:', err);
                    reject(false);
                }
                // Authorize a client with credentials, then call the Google Sheets API.  
                const credentials = JSON.parse(content);
            
                const { client_secret, client_id, redirect_uris } = credentials.installed;
                const oAuth2Client = new google.auth.OAuth2(
                    client_id, client_secret, redirect_uris[0]);
            
                // Check if we have previously stored a token.
                fs.readFile(TOKEN_PATH, (err, token) => {
                    if (err) {
                        console.log('need token file');
                        reject(false);
                    }
                    resolve(true);
                    
                });
            });   
        });
        
    },
    
    getGroups: () => {
        return new Promise( async (resolve, reject) => {
            const auth = credentials || await module.exports.connect();
            const sheets = google.sheets({ version: 'v4', auth });
    
            sheets.spreadsheets.values.get({
                spreadsheetId: '1P-rm68K3OsdSpwLefqUvEsOrL1AcLLhWV6bvrMyQD_U', // Add id of the spread sheet here!
                range: 'FB_GP!A2:C', // Setup Range here!
            }, (err, res) => {
                if (err) return console.log('The API returned an error: ' + err);
                const rows = res.data.values;
                if (rows.length) {
                    
                    // Print columns A and E, which correspond to indices 0 and 4.
                    const resGroup = rows.map((row) => {            
                        return {index: row[0], groupName: row[1], groupUrl: row[2]};
                    });
    
                    // console.log(resGroup);
                    resolve(resGroup);
                } else {                                
                    reject('No data found.');
                }
            }); 
        });
    },
    
    
    getCommentTxts: () => {
        return new Promise(async (resolve, reject) => {
            const auth = credentials || await module.exports.connect();
            const sheets = google.sheets({ version: 'v4', auth });
        
            sheets.spreadsheets.values.get({
                spreadsheetId: '1y7MlCIBqk5_U8-OQcVz-iI54BDrvKZHvF5oGLFxu63w', // Add id of the spread sheet here!
                range: 'Txt!A2:B', // Setup Range here!
            }, (err, res) => {
                if (err) return console.log('The API returned an error: ' + err);
                const rows = res.data.values;
                if (rows.length) {            
                    // Print columns A and E, which correspond to indices 0 and 4.
                    const resCommentTxts = rows.map((row) => {                
                        return {index: row[0], msg: row[1].replace(/(\r\n|\n|\r)/gm,"")};
                    });
                    resolve(resCommentTxts);
                } else {                
                    reject('no data found');
                }
            });
        });
    } 
}

