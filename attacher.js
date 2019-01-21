const puppeteer = require('puppeteer');
const path = require('path');
var robot = require("robotjs");
var childProcess = require('child_process');
let constants = require('./constants');

const targetTextArea = constants.targetTextArea;
const targetUploadPH = constants.targetUploadPH;


//Caution: Must set target by manually setting upload window to file location
const robotTargetImage = (numberOfDowns) => {
    numberOfDowns = numberOfDowns || 1;
    console.log('keytapdown');
    robot.keyTap("down");
    
    setTimeout(()=> {
        console.log('keytapEnter');
        robot.keyTap("enter");
        console.log('robotTargetImage--finished');
    }, 500);    
}

const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const focusToChromium = () => {    
    childProcess.exec('./refocus.sh',function (err,stdout,stderr) {
        if (err) {
            console.log("\n"+stderr);
        } else {
            console.log(stdout);
        }
    });
}

let count = 0;

const botStart = async () => {
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
    // const loadingDelay = 6000; 
    // const reloadDelay = 8000;
    
    //random delay for human like results
    const loadingDelay = getRandomInt(6000, 7000); 
    const reloadDelay = getRandomInt(loadingDelay + 600000, loadingDelay + 900000);
    // const osType = process.env.osType || 'mac' //Unless given type, the defualt will be a mac (Not used yet)
    // console.log(pages);    
    let page = pages[0];
    const viewport = { width: 1200, height: 900 };
    page.setViewport(viewport)    
    
    let divIndex = 0;
    
    setTimeout(async () => {                
        // console.log('browser endpoint ' + browserWSEndpoint);
                
        if (browserWSEndpoint) {                        
            // page.on('console', (log) => console[log._type](log._text)); 

            console.log(targetTextArea);
            const myElementText = await page.evaluateHandle(({targetTextArea, divIndex}) => {
                // Must check if have this class everytime (responsive dynamic class)
                let commentEl = document.querySelectorAll(targetTextArea)[divIndex];
                console.log(document.querySelectorAll(targetTextArea));
                console.log(divIndex)
                console.log('commentEl')
                console.log(commentEl)
                return commentEl;   
            },{targetTextArea, divIndex});

            const myElementPhotoLink = await page.evaluateHandle(({targetUploadPH ,divIndex}) => {
                let photoLink = document.querySelectorAll(targetUploadPH)[divIndex];
                console.log('photoLink')
                console.log(photoLink)
                return photoLink;
            }, {targetUploadPH ,divIndex});
            
            await myElementPhotoLink.click();            
            console.log('Photo link clicked');
            await myElementText.focus();
            console.log('text focus');

            setTimeout(async () => {
                robotTargetImage(1);
            }, 1000);

            setTimeout(async () => {                
                await page.keyboard.press('Enter');
                console.log('keyboard press enter');
            }, loadingDelay);

            setTimeout(async () => {
                console.log('bot reload');
                //Caution: Must Reload Manually first (to avoid reload confirmation popup)
                await page.reload();
                botStart();
            }, reloadDelay);
                        
            // To Disconnect browser
            // browser.disconnect();

        } else {
            console.log('no browserWSEndpoint given');
        }
    }, 3000)
}

botStart();