let cookieVals;
let browserContext;
let page;

const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ browser }) => {

    cookieVals = await getCookieVals();
    browserContext = await browser.newContext();
    // add cookie
    await browserContext.addCookies(cookieVals);
    // Open new page
    page = await browserContext.newPage();
});

test('Search Kazma', async ({ browser, baseURL }) => {
    // Příchod na Hlavní stránku a vyhledání výrazu Kazma, kontrola přesměrování a existence neprázdných výsledků (Nejlepší výsledek, Pořady, Videa)
    
    const SEARCHSTRING = 'kazma';
 
    // goto stream
    await page.goto('/');
    const searchFormInputLocator = page.locator('[placeholder="Zadejte\\, co chcete hledat"]');
    await searchFormInputLocator.click();
    await searchFormInputLocator.fill(SEARCHSTRING);
    await page.locator('[aria-label="Vyhledat"]').click();
    
    // check redirect URL
    await expect(page).toHaveURL(baseURL+'/hledani?dotaz='+SEARCHSTRING);
    
    // check results

    // check best result 
    await expect(page.locator('[data-dot="top_search_result"]')).toBeVisible();
    await expect(page.locator('//section[@data-dot="top_search_result"]//h2', { hasText: ' Nejlepší výsledek ' })).toBeVisible();

    //check channel
    await expect(page.locator('[data-dot="search_shows"]')).toBeVisible();
    await expect(page.locator('//section[@data-dot="search_shows"]//h2', { hasText: ' Pořady ' })).toBeVisible();
    // count should be greather than 0
    const countOfPorady = await page.locator('li[class="squircle-carousel__item"]').count();
    expect(countOfPorady).toBeGreaterThan(0);

    //check videos
    await expect(page.locator('[data-dot="search_episodes"]')).toBeVisible();
    await expect(page.locator('//section[@data-dot="search_episodes"]//h2', { hasText: ' Videa ' })).toBeVisible();
    // count of videos should be greather than 0
    const countOfVidea = await page.locator('li[class="search-episodes__item"]').count();
    expect(countOfVidea).toBeGreaterThan(0);

  });

 test('No results of search', async ({ browser, baseURL }) => {
    //Vyhledání neexistujícího výrazu, např. abcdsuperbullshit42 a kontrola vypsání upozorńující hlášky, že jsme nic nenašli
    
    const SEARCHSTRING = 'blabolnatreti111';

    // goto stream
    await page.goto('/');

    await page.locator('[placeholder="Zadejte\\, co chcete hledat"]').click();
    await page.locator('[placeholder="Zadejte\\, co chcete hledat"]').fill(SEARCHSTRING);
    await page.locator('[aria-label="Vyhledat"]').click();
    
    // check redirect URL
    await expect(page).toHaveURL(baseURL+'/hledani?dotaz='+SEARCHSTRING);
    
    // check results

    // check if no found best result - dodelat
    await expect(page.locator('//h2[@class="h h--search-empty"]', { hasText: ' Bohužel jsme nic nenašli ' })).toBeVisible();

});

test('Blank page without search', async ({ browser, baseURL }) => {
    //Příchod na prázdnou stránku vyhledávání (/hledani) a kontrola, že již neobsahuje nějaké výsledky, tedy čeká na zadání výrazu

    // goto stream
    await page.goto('/hledani');
       
    // check results

    // check page URL
    await expect(page).toHaveURL(baseURL+'/hledani');

    // check text of blank page
    await expect(page.locator('//h2[@class="h h--search-empty"]', { hasText: ' Zadejte, co chcete hledat ' })).toBeVisible();

    // check best result 
    //expect(page.locator('[data-dot="top_search_result"]')).not;
    expect(page.locator('//section[@data-dot="top_search_result"]//h2', { hasText: ' Nejlepší výsledek ' })).toHaveCount(0);

    //check channel
    expect(page.locator('//section[@data-dot="search_shows"]//h2', { hasText: ' Pořady ' })).toHaveCount(0);
    // count should 0
    const countOfPorady = await page.locator('li[class="squircle-carousel__item"]').count();
    expect(countOfPorady).toBe(0);

    //check videos
    // count of videos should be 0
    const countOfVidea = await page.locator('li[class="search-episodes__item"]').count();
    expect(countOfVidea).toBe(0);

});

test('Search Kazma and check next video button', async ({ browser, baseURL }) => {
    test.setTimeout(150000);
    // Zahledání z libovolné stránky výrazu Kazma, kontrola existence videí, klik na Načíst další videa a kontrola zdali načtení proběhlo správně a položky přibyly
    
    const SEARCHSTRING = 'kazma';
    const videosLocator = page.locator('//*[@class="search-episodes"]/ul/li');
    const searchFormInputLocator = page.locator('[placeholder="Zadejte\\, co chcete hledat"]');

    // goto stream
    await page.goto('/');
    await searchFormInputLocator.click();
    await searchFormInputLocator.fill(SEARCHSTRING);
    await page.locator('[aria-label="Vyhledat"]').click();
    
    //check videos
    await expect(page.locator('[data-dot="search_episodes"]')).toBeVisible();
    expect(await videosLocator.count()).toBeGreaterThanOrEqual(1);

    // check video existence
    const numberOfVideos = await videosLocator.count();
    const page1 = await browserContext.newPage();
    
    for (let i = 0; i < 5; i++) {
    //for (let i = 0; i < numberOfVideos; i++) {
        //console.log(i);
        var hrefLink = await videosLocator.nth(i).locator('//a[starts-with(@class,"search-card__link")]').nth(0).getAttribute('href');
        //console.log(hrefLink);

        await page1.goto(baseURL+ String(hrefLink));
        expect(await page1.locator('//div[@class="c-VideoPoster"]')).toBeVisible({ timeout: 250000 });
        //await page1.close();
    }

    // next videos functionality
    if (numberOfVideos > 0) {
        const nextVideosButton = await page.locator('text=Načíst další videa');        
        if (nextVideosButton) {
            await nextVideosButton.click();    
            const numberOfVideosAfterNext = await videosLocator.count();
            expect.soft(numberOfVideosAfterNext).toBeGreaterThan(numberOfVideos);
        }
    }
});


test('Filters test', async ({ browser, baseURL }) => {
    test.setTimeout(120000);
    // Libovolný test funkcionality filtrování výpisu videí
    
    const SEARCHSTRING = 'kazma';

    const searchFormInputLocator = page.locator('[placeholder="Zadejte\\, co chcete hledat"]');
    const videosLocator = page.locator('//*[@class="search-episodes"]/ul/li');
    
    await page.goto('/');
    await searchFormInputLocator.click();
    await searchFormInputLocator.fill(SEARCHSTRING);
    await page.locator('[aria-label="Vyhledat"]').click();

    //check videos
    await expect(page.locator('[data-dot="search_episodes"]')).toBeVisible();
    
    expect(await videosLocator.count()).toBeGreaterThanOrEqual(1);

    //check filters
    await page.locator('text=Filtry').click();

    // date
    const dateFiltersLocator = page.locator('//ul[@data-dot="published"]/ul/li/button');
    const numberOfDateFilters = await dateFiltersLocator.count();
    //await page.locator('text=Dnes').click();

    var numberOfVideos = await videosLocator.count();
    for (let i = 0; i < numberOfDateFilters; i++) {
        await dateFiltersLocator.nth(i).click({ timeout: 10000 });
        var numberOfVideosFiltered = await videosLocator.count();
        if (numberOfVideosFiltered != 0 && numberOfVideos != 0) {
            expect.soft(numberOfVideosFiltered).not.toEqual(numberOfVideos);            
        }
        var numberOfVideos = numberOfVideosFiltered;
    }

    // lenght - the same logic as for date
    // sorting

});



test('Suggested search results test', async ({ browser, baseURL }) => {
    // checks the functionality of suggested search results
    
    const SEARCHSTRING = 'kazma';
 
    // goto stream
    await page.goto('/');
    const searchFormInputLocator = page.locator('[placeholder="Zadejte\\, co chcete hledat"]');

    await searchFormInputLocator.click();
    await searchFormInputLocator.fill(SEARCHSTRING);

    const hrefLink = await page.locator('xpath=//*[@class="suggestions"]/li[1]/a').getAttribute('href' );
    await page.locator('xpath=//*[@class="suggestions"]/li[1]').click();
  
    //check if suggested search results works
    await expect(page).toHaveURL(baseURL + String(hrefLink));

    // in future - test links of all Suggested search results
});

// export async function setCookieVals() {
  async function getCookieVals() {

        const Cookie = [
            {
                name: "euconsent-v2", // TCF string v2
                value: "CPWQiJUPWQiJUD3ACBCSCHCsAP_AAEPAAATIIDoBhCokBSFCAGpYIIMAAAAHxxAAYCACABAAoAABABIAIAQAAAAQAAAgBAAAABQAIAIAAAAACEAAAAAAAAAAAQAAAAAAAAAAIQIAAAAAACBAAAAAAABAAAAAAABAQAAAggAAAAIAAAAAAAEAgAAAAAAAAAAAAAAAAAgAAAAAAAAAAAgd1AmAAWABUAC4AGQAQAAyABoADmAIgAigBMACeAFUAMQAfgBCQCIAIkARwAnABSgCxAGWAM0AdwA_QCEAEWALQAXUAwIBrAD5AJBATaAtQBeYDSgGpgO6AAAA.YAAAAAAAAAAA",
                domain: ".stream.cz",
                path: "/",
                expires: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // next month in secs
                secure: true,
                sameSite: "None",
                httpOnly: false,
            },
            {
                name: "cmppersisttestcookie", // unix timestamp of first visit, yup could be 1
                value: "1",
                domain: ".stream.cz",
                path: "/",
                expires: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
                secure: true,
                sameSite: "None",
                httpOnly: false,
            },
            {
                name: "szncmpone", // some helper to track purpose1 consent
                value: "1",
                domain: ".stream.cz",
                path: "/",
                expires: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
                secure: true,
                sameSite: "None",
                httpOnly: false,
            },
        ];
        
        return Cookie;
    }  