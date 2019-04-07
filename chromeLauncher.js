const path = require('path');
const puppeteer = require('puppeteer');
const cryptoJS = require('crypto-js');

const browserWSEndpoint = process.env.wsURL || null;


(async() => {

  if (!browserWSEndpoint) {
    const browser = await puppeteer.launch({
      handleSIGINT: false, // so Chrome doesn't exit when we quit Node.
      headless: false // to see what's happening
    });

    console.log('1. Quit this script (cmd/ctrl+C).');
    console.log('2. Chrome will still be running.');
    console.log('4. Re-return the script with:');
    console.log(`   $env:wsURL="${browser.wsEndpoint()}" $env="username=[add secret user here]" node attacher.js`);
    console.log('5. Puppeteer will reconnect to the existing Chrome instead of launching a new browser.');
    return;
  }
  
})();
