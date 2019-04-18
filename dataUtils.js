const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const constants = require('./constants');
const request = require('request-promise');


module.exports = {    

    checkConnection: () => {        
        return new Promise((resolve, reject) => {
            const options = {
                uri: `${constants.host}/testconnection`,
                method: 'GET',
                json: true // Automatically parses the JSON string in the response                                
            };
    
            // console.log(options);
            request(options)
                .then(result => {
                    // console.log(JSON.stringify(result));
                    if(result.status) {
                        resolve(true);
                    } else {
                        reject(false);
                    }
                })
                .catch(err => {
                    console.log('cannot connect to host server');
                    reject(false);
                });  
        });
        
    },
    
    getAccount: () => {        
        return new Promise((resolve, reject) => {
            const formData = {
                botId: constants.botId
            }
            const options = {
                uri: `${constants.host}/assignUser`,
                method: 'POST',
                body: formData,                            
                json: true // Automatically parses the JSON string in the response                                
            };
    
            // console.log(options);
            request(options)
                .then(result => {
                    // console.log(JSON.stringify(result));
                    if(result.status) {
                        resolve(result.selectedAcc);
                    } else {
                        reject(err);
                    }
                })
                .catch(err => {
                    console.log('cannot connect to host server');
                    reject(err);
                });  
        });
        
    },

    countSuccess: () => {        
        return new Promise((resolve, reject) => {
            const formData = {
                botId: constants.botId
            }
            const options = {
                uri: `${constants.host}/addSuccess`,
                method: 'POST',
                body: formData,                            
                json: true // Automatically parses the JSON string in the response                                
            };
    
            // console.log(options);
            request(options)
                .then(result => {
                    // console.log(JSON.stringify(result));
                    if(result.status) {
                        console.log(result);
                        resolve();
                    } else {
                        reject(err);
                    }
                })
                .catch(err => {
                    console.log('cannot connect to host server');
                    reject(err);
                });  
        });
        
    },

    countError: () => {        
        return new Promise((resolve, reject) => {
            const formData = {
                botId: constants.botId
            }
            const options = {
                uri: `${constants.host}/addError`,
                method: 'POST',
                body: formData,                            
                json: true // Automatically parses the JSON string in the response                                
            };
    
            // console.log(options);
            request(options)
                .then(result => {
                    // console.log(JSON.stringify(result));
                    if(result.status) {
                        console.log(result);
                        resolve();
                    } else {
                        reject(err);
                    }
                })
                .catch(err => {
                    console.log('cannot connect to host server');
                    reject(err);
                });  
        });
        
    },
    
    getGroup: () => {
        return new Promise((resolve, reject) => {
            const formData = {
                botId: constants.botId
            }
            const options = {
                uri: `${constants.host}/getGroup`,
                method: 'GET',
                body: formData,                            
                json: true // Automatically parses the JSON string in the response                                
            };
    
            // console.log(options);
            request(options)
                .then(result => {
                    // console.log(JSON.stringify(result));
                    if(result.status) {
                        resolve(result.selectedGroup);
                    } else {
                        reject(err);
                    }
                })
                .catch(err => {
                    console.log('cannot connect to host server');
                    reject(err);
                });  
        });
    },
    
    
    getCommentTxt: () => {
        return new Promise((resolve, reject) => {
            const formData = {
                botId: constants.botId
            }
            const options = {
                uri: `${constants.host}/getText`,
                method: 'GET',
                body: formData,                            
                json: true // Automatically parses the JSON string in the response                                
            };
    
            // console.log(options);
            request(options)
                .then(result => {
                    // console.log(JSON.stringify(result));
                    if(result.status) {
                        resolve(result.selectedComment);
                    } else {
                        reject(err);
                    }
                })
                .catch(err => {
                    console.log('cannot connect to host server');
                    reject(err);
                });  
        });
    } 
}

