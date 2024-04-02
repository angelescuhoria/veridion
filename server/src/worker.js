import puppeteer from "puppeteer";
import { expose } from "threads/worker";
const crawlAndExtractText = async (page) => {
    const content = await page.evaluate(() => document.body.innerText.trim());
    let text = content.replace(/\n/g, " ");
    text = text.replace(/\s{2,}/g, " ");
    return [text.trim()];
};
const processDomain = async (domain) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    try {
        const response = await page.goto(`https://${domain}`, {
            waitUntil: "domcontentloaded",
            timeout: 30000,
        });
        if (response && response.status() !== 200) {
            console.error(`Page at ${domain} returned an error: ${response.status()}`);
            return [];
        }
        const textContents = [];
        textContents.push(...(await crawlAndExtractText(page)));
        const hrefs = await page.$$eval("a", (as) => as.map((a) => a.href));
        const urls = [...new Set(hrefs)];
        const filteredURLs = urls.filter((url) => url.includes(`${domain}`) &&
            !url.includes("/#") &&
            !url.includes("tel:") &&
            !url.includes("mailto:"));
        for (const url of filteredURLs) {
            await page.goto(url);
            textContents.push(...(await crawlAndExtractText(page)));
        }
        return textContents;
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error occurred while accessing ${domain}`);
        }
        else {
            console.error(`Error processing ${domain}:`, error);
        }
        return [];
    }
    finally {
        await page.close();
        await browser.close();
    }
};
const allContents = {};
expose(async function run(domains) {
    for (const domain of domains) {
        const textContent = await processDomain(domain);
        allContents[domain] = textContent;
    }
    return allContents;
});
