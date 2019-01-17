const puppeteer = require('puppeteer');
const path = require('path');
var robot = require("robotjs");


//Caution: Must set target by manually setting upload window to file location
const robotTargetImage = () => {
    console.log('keytapdown');
    robot.keyTap("down");
    console.log('keytapEnter');
    robot.keyTap("enter");
    console.log('robotTargetImage--finished');
}

const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let count = 0;

const botStart = async () => {
    console.log('Get ready, Focus to chromium screen in 3 seconds else things will fuck up!');
    console.log('Current;y while script is running chromeium must be focus at all times');    
    console.log(`Current Memory Usage >>> ${JSON.stringify(process.memoryUsage())}`);
    console.log('Starting....');

    count++;
    console.log(`Counter >>> ${count}`);
    const browserWSEndpoint = process.env.wsURL || null;
    const browser = await puppeteer.connect({ browserWSEndpoint, slowMo: 150 });
    const pages = await browser.pages();
    
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

            
            const myElementText = await page.evaluateHandle((divIndex) => {
                let commentEl = document.querySelectorAll('._65td')[divIndex];
                console.log('commentEl')
                console.log(commentEl)
                return commentEl;   
            },divIndex);

            const myElementPhotoLink = await page.evaluateHandle((divIndex) => {
                let photoLink = document.querySelectorAll('[data-tooltip-content="Attach a photo or video"]')[divIndex];
                console.log('photoLink')
                console.log(photoLink)
                return photoLink;
            }, divIndex);
            
            await myElementPhotoLink.click();
            await myElementText.focus();

            setTimeout(async () => {
                robotTargetImage();
            }, 1000);

            setTimeout(async () => {                
                await page.keyboard.press('Enter');                
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

// (async () => {
    

// })();

