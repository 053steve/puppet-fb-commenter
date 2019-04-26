const puppeteer = require('puppeteer');
const path = require('path');
const robot = require("robotjs");
const childProcess = require('child_process');
const constants = require('./constants');
const cryptoJS = require('crypto-js');
const cluster = require('cluster');
const dataUtils = require('./dataUtils');


const targetTextArea = constants.targetTextArea;
const targetUploadPH = constants.targetUploadPH;
const targetCommentBox = constants.targetCommentBox;
let errorCount = 0;

let FB_Account = {};


//Caution: Must set target by manually setting upload window to file location
const robotTargetImage = async (numberOfDowns) => {
    numberOfDowns = numberOfDowns || 1;
    console.log('keytapdown');
    // robot.typeString('datab1.jpg');
    const randomnumber = getRandomInt(1, constants.maxImg);
    robot.typeString(`${randomnumber}.png`);
    //robot.keyTap("down");
    //robot.keyTap('right');
    await sleep(5)
    console.log('keytapEnter');    
    robot.keyTap("enter");
    console.log('robotTargetImage--finished');
}

const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const focusToChromium = () => {
    childProcess.exec('./refocus.sh', function (err, stdout, stderr) {
        if (err) {
            console.log("\n" + stderr);
        } else {
            console.log(stdout);
        }
    });
}

const sleep = time => new Promise(resolve => setTimeout(resolve, (time || 1) * 1000));

let count = 0;

const botStart = async () => {
    const selectedMsg = await dataUtils.getCommentTxt();
    const selectedGroup = await dataUtils.getGroup();

    
    console.log(selectedMsg);
    console.log(selectedGroup);

    // console.log('Get ready, Focus to chromium screen in 3 seconds else things will fuck up!');
    // focusToChromium();
    console.log('Currently while script is running chromeium must be focus at all times');
    console.log(`Current Memory Usage >>> ${JSON.stringify(process.memoryUsage())}`);
    console.log('Starting....');

    
    


    count++;
    console.log(`Counter >>> ${count}`);
    console.log('constants >>> ' + JSON.stringify(constants));
    const browserWSEndpoint = process.env.wsURL || null;
    const browser = await puppeteer.connect({ browserWSEndpoint, slowMo: 150 });
    const pages = await browser.pages();

    

    // For quick test    
    const loadingDelay = 10;
    const reloadDelay = 20;

    // random delay for human like results
    // const loadingDelay = 10;
    // const reloadDelay = 900;
    // const osType = process.env.osType || 'mac' //Unless given type, the defualt will be a mac (Not used yet)
    // console.log(pages);    
    let page = pages[0];
    if (count == 1) {
        try {
            await page.waitFor('#userNav');
        } catch (err) {            
            //login sequence (only at first time when start script)
            await page.goto('https://www.facebook.com', {waitUntil: 'networkidle2'});    
            await page.waitFor('#email');            
            await page.$eval('#email', (el, fb_user) => el.value = fb_user, FB_Account.fb_user);
            
            await page.click('#pass');    
            await page.$eval('#pass', (el, fb_pass ) => el.value = fb_pass, FB_Account.fb_pass);
            await page.click('#loginbutton');
            await page.waitFor('#userNav');
            robot.keyTap("escape");            
            await sleep(3);
            // await page.reload();            
        }
    }
    
    
    await page.goto(selectedGroup.groupUrl);

    const viewport = { width: 1200, height: 900 };
    page.setViewport(viewport)

    let divIndex = 0;

    // console.log('browser endpoint ' + browserWSEndpoint);
    await sleep(3);
    if (browserWSEndpoint) {
        // page.on('console', (log) => console[log._type](log._text)); 

        // console.log(targetTextArea);
        try {
            const myElementText = await page.evaluateHandle(({ targetTextArea, divIndex }) => {
                // Must check if have this class everytime (responsive dynamic class)
                let commentEl = document.querySelectorAll(targetTextArea)[divIndex];
                console.log(document.querySelectorAll(targetTextArea));
                console.log(divIndex)
                console.log('commentEl')
                console.log(commentEl)
                return commentEl;
            }, { targetTextArea, divIndex });

            const myElementPhotoLink = await page.evaluateHandle(({ targetUploadPH, divIndex }) => {
                let photoLink = document.querySelectorAll(targetUploadPH)[divIndex];
                console.log('photoLink')
                console.log(photoLink)
                return photoLink;
            }, { targetUploadPH, divIndex });
            // await myElementText.focus();
            // console.log('text focus');
            await myElementPhotoLink.click();
            console.log('Photo link clicked');
            await myElementText.focus();
            console.log('text focus');

            await sleep(1);
            await robotTargetImage(1);
            await sleep(3);
            const myElementText2 = await page.evaluateHandle(({ targetCommentBox, divIndex }) => {
                // Must check if have this class everytime (responsive dynamic class)
                let commentEl = document.querySelectorAll(targetCommentBox)[divIndex];
                console.log(document.querySelectorAll(targetCommentBox));
                console.log(divIndex)
                console.log('commentEl2');
                console.log(commentEl)
                return commentEl;
            }, { targetCommentBox, divIndex });

            await sleep(loadingDelay);


            await myElementText2.click();
            await sleep(1);
            await myElementText2.type(selectedMsg.msg ,{delay: 40});
            console.log('text focus');
            await page.keyboard.press('Enter');
            console.log('keyboard press enter');

            await sleep(reloadDelay);
            console.log('bot reload');
            await dataUtils.countSuccess();
            //Caution: Must Reload Manually first (to avoid reload confirmation popup)
            await page.reload();
            botStart();


            // To Disconnect browser
            // browser.disconnect();
        } catch (e) {
            console.log('something failed');
            throw new Error('something bad happened');            
        }


    } else {
        console.log('no browserWSEndpoint given');
    }
}


const populateData = async () => {
    FB_Account = await dataUtils.getAccount();
    console.log(FB_Account);   
    if(!FB_Account) {
        throw new Error('Cannot get populate data'); 
    }
            
}

(async () => {
    if (cluster.isMaster) {
        cluster.fork();
    
        cluster.on('exit', function (worker, code, signal) {
            cluster.fork();
        });
    }
    
    if (cluster.isWorker) {
        
        
        
        if (cryptoJS.MD5(process.env.username).toString() === constants.md5CheckUser) { //check for username                    
            try {
                
                const isConnect = await dataUtils.checkConnection();            
                if(isConnect){                                        
                    await populateData();
                    botStart()
                } else {
                    console.log('something not working');
                }
            } catch (err) {
                throw new Error(err); 
            }
        } else {        
            throw new Error('Incorrect Username'); 
        }    
    
        process.on('unhandledRejection',  async (err) => {
            robot.keyTap('escape');
            await sleep(5);
            console.error((new Date).toUTCString() + ' uncaughtException:', err.message)
            console.error(err.stack)
            errorCount++;
            await dataUtils.countError();

            console.log('errorCount' + errorCount);
            process.exit(1)
        });
    
        process.on('uncaughtException',  async (err) => {
            robot.keyTap('escape');
            await sleep(5);
            console.error((new Date).toUTCString() + ' uncaughtException:', err.message)
            console.error(err.stack)
            errorCount++;
            await dataUtils.countError();
            console.log('errorCount' + errorCount);
            process.exit(1)
        });
    }
    
})()





