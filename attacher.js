const puppeteer = require('puppeteer');
const path = require('path');
const robot = require("robotjs");
const childProcess = require('child_process');
const constants = require('./constants');
const cryptoJS = require('crypto-js');
const cluster = require('cluster');


const targetTextArea = constants.targetTextArea;
const targetUploadPH = constants.targetUploadPH;
const targetCommentBox = constants.targetCommentBox;
let errorCount = 0;
// const randomNumberMaximum = constants.maxImg;
// const randomNumberMinimum = 1;

// const randomnumber = Math.floor(Math.random() * (randomNumberMaximum - randomNumberMinimum + 1)) + randomNumberMinimum;



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

    //random delay for human like results
    // const loadingDelay = getRandomInt(30, 40); 
    // const reloadDelay = getRandomInt(loadingDelay + 20, loadingDelay + 23);
    // const osType = process.env.osType || 'mac' //Unless given type, the defualt will be a mac (Not used yet)
    // console.log(pages);    
    let page = pages[0];

    if (count == 1) {
        await page.reload();
    }

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




if (cluster.isMaster) {
    cluster.fork();

    cluster.on('exit', function (worker, code, signal) {
        cluster.fork();
    });
}

if (cluster.isWorker) {
    if (cryptoJS.MD5(process.env.username).toString() === constants.md5CheckUser) {
        botStart();
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
    })

    
}



