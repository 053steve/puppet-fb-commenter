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

let FB_Groups = null;
let FB_Msgs = null;


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
    const selectedMsg = FB_Msgs[getRandomInt(1, FB_Msgs.length)];
    const selectedGroup = FB_Groups[getRandomInt(1, FB_Groups.length)];

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
        await page.reload();
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
            //Caution: Must Reload Manually first (to avoid reload confirmation popup)
            await page.reload();
            botStart();


            // To Disconnect browser
            // browser.disconnect();
        } catch (e) {
            console.log('something failed');
            throw new Error('something bad happened');
            // console.log(e);
            
            
            // throw new Error('something bad happened');

        }


    } else {
        console.log('no browserWSEndpoint given');
    }
}


const populateData = async () => {
    console.log('fetching data from speadsheet');
    FB_Groups = await dataUtils.getGroups();
    FB_Msgs = await dataUtils.getCommentTxts();

    // console.log(FB_Groups);
    // console.log(FB_Msgs);

    if(!FB_Msgs.length && !FB_Groups.length) {
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
            const checkToken = await dataUtils.checkToken();            
            if(checkToken){                            
                try {
                    await populateData();
                    botStart();
                } catch (err) {
                    throw new Error(err); 
                }
                
            } else {
                console.log('something not working');
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
            console.log('errorCount' + errorCount);
            process.exit(1)
        });
    
        process.on('uncaughtException',  async (err) => {
            robot.keyTap('escape');
            await sleep(5);
            console.error((new Date).toUTCString() + ' uncaughtException:', err.message)
            console.error(err.stack)
            errorCount++;
            console.log('errorCount' + errorCount);
            process.exit(1)
        });
    }
    
})()





