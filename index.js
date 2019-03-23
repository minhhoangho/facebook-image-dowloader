const downloader = require('image-downloader')
const puppeteer = require('puppeteer')
const fs = require('fs')
const {
    SECRET
} = require('./secret')
const options = {
    url: '',
    dest: './images',
    done: (err, filename, image) => {
        try {
            if (err) {
                throw err;
            }
            console.log('>>>File save to: ', filename);
        } catch (error) {
            throw error;
        }

    }
};

const ID = {
    login: '#email',
    pass: '#pass'
};

const loginFacebook = async (page) => {
    await page.goto('https://www.facebook.com/', {
        waitUntil: 'networkidle2'
    });
    await page.waitForSelector(ID.login);
    console.log("Login to account: ", SECRET.user);

    await page.type(ID.login, SECRET.user);

    await page.type(ID.pass, SECRET.pass);

    await page.click("#loginbutton")
    console.log("login done");
    await page.waitForNavigation();
}
const main = async (url) => {
    const browser = await puppeteer.launch({
        // headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    try {
        const outputFolder = './images'
        console.log("Script is running ...");
        const page = await browser.newPage();
        await loginFacebook(page);
        await page.goto(url, {
            waitUntil: 'networkidle2'
        });
        const srcs = await page.evaluate(() => {
            const arr = Array.from(document.getElementsByClassName('uiMediaThumbImg'))
            const src = arr.map(e => e.style.backgroundImage.slice(4, -1))
            return src;
        })

        if (!fs.existsSync(outputFolder)) {
            fs.mkdirSync(outputFolder)
        }
        srcs.forEach(e => {
            setTimeout(() => {
                e = e.slice(1, -1)
                options.url = e;
                downloader(options)
                console.log('Downloading ...');
            }, 2000)
        })


    } catch (error) {
        throw (error)
    } finally {
        await browser.close();
    }
}

main(SECRET.pageUrl)