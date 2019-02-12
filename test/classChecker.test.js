const puppeteer = require('puppeteer');
const assert = require('assert');
var should = require('chai').should() //actually call the function
// import config from '../config';
const constants = require('../constants');
const expect = require('chai').expect;



// Settings for testing here
const targetTextArea = constants.targetTextArea;
const targetUploadPH = constants.targetUploadPH;
const browserWSEndpoint = 'ws://127.0.0.1:61558/devtools/browser/b3e87241-87e8-43c7-a3d8-3b42933c956c';
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
        
        try {
            await page.waitForSelector(targetTextArea);
        } catch (error) {
            console.log(error);
            console.log("The element didn't appear.")
            assert.fail();
        }        
    });
});

describe('Checking for targetUploadPH', () => {    
    it('targetUploadPH should not be undefined', async () => {        

        try {
            await page.waitForSelector(targetUploadPH);
        } catch (error) {
            console.log(error);
            console.log("The element didn't appear.")
            assert.fail();
        }   

    });
});

