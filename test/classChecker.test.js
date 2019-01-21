const puppeteer = require('puppeteer');
const assert = require('assert');
var should = require('chai').should() //actually call the function


// Settings for testing here
const targetTextArea = '._65td';
const targetUploadPH = '[data-tooltip-content="Attach a photo or video"]';
const browserWSEndpoint = 'ws://127.0.0.1:51475/devtools/browser/a6ef20e1-5348-4c1e-9a0f-5be2623ab544';
const divIndex = 0;

let page;
before( async () => {    
    const browser = await puppeteer.connect({ browserWSEndpoint });    
    const pages = await browser.pages();                        
    page = pages[0];


    const viewport = { width: 1200, height: 900 };
    page.setViewport(viewport)            
});

describe('Checking for targetTextArea', () => {
    it('targetTextArea should not be undefined', async () => {
        const myElementText = await page.evaluateHandle(({targetTextArea, divIndex}) => {
            
            // Must check if have this class everytime (responsive dynamic class)
            let commentEl = document.querySelectorAll(targetTextArea)[divIndex];                
            return commentEl;   
        }, {targetTextArea, divIndex});
        should.exist(myElementText);        
    });
});

describe('Checking for targetUploadPH', () => {    
    it('targetUploadPH should not be undefined', async () => {
        const myElementPhotoLink = await page.evaluateHandle(({targetUploadPH ,divIndex}) => {
            let photoLink = document.querySelectorAll(targetUploadPH)[divIndex];                
            return photoLink;
        }, {targetUploadPH ,divIndex});    
        should.exist(myElementPhotoLink);                
    });
});

