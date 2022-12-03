const puppeteer = require("puppeteer");
const cron = require("node-cron");
const telegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const TOKEN = process.env.TOKEN;
const CHAT_ID = process.env.CHAT_ID;

const bot = new telegramBot(TOKEN, { polling: true });

async function start() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--window-size=1920,1040"],
  });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
  );
  await page.setViewport({ width: 1700, height: 600 });

  await page.goto(
    "https://agendamentosonline.mne.gov.pt/AgendamentosOnline/app/scheduleAppointmentForm.jsf"
  );
  page.waitForNavigation();

  await page.screenshot({ path: "initial_photo.png", fullPage: true });
  page
    .on("console", (message) =>
      console.log(
        `${message.type().substr(0, 3).toUpperCase()} ${message.text()}`
      )
    )
    .on("pageerror", ({ message }) => console.log(message))
    .on("response", (response) =>
      console.log(`${response.status()} ${response.url()}`)
    )
    .on("requestfailed", (request) =>
      console.log(`${request.failure().errorText} ${request.url()}`)
    );

  //cookie
  await page.click("#j_idt316");
  await page.waitForTimeout(1000);
  // new Promise(r => setTimeout(r, 1000));
  // Login
  await page.type('[id="scheduleForm:tabViewId:ccnum"]', "9136705653");
  await page.type(
    "#scheduleForm\\:tabViewId\\:dataNascimento_input",
    "19-11-1993"
  );
  await page.click("body");
  await page.waitForSelector("#scheduleForm\\:tabViewId\\:searchIcon");

  await Promise.all([
    await page.$eval(`#scheduleForm\\:tabViewId\\:searchIcon`, (element) =>
      element.click()
    ),
    await page.waitForNetworkIdle(),
  ]);

  // Posto consular
  await Promise.all([
    await page.$eval(`#scheduleForm\\:postcons_label`, (element) =>
      element.click()
    ),
    await page.click(
      "#scheduleForm\\:postcons_panel > div > ul > li:nth-child(2)"
    ),
    await page.waitForNetworkIdle(),
  ]);

  //informacoes do agendamento
  await Promise.all([
    await page.$eval(`#scheduleForm\\:categato_label`, (element) =>
      element.click()
    ),
    await page.click(
      "#scheduleForm\\:categato_panel > div > ul > li:nth-child(4)"
    ),
    await page.waitForNetworkIdle(),
  ]);

  await Promise.all([
    await page.$eval(`#scheduleForm\\:atocons_label`, (element) =>
      element.click()
    ),
    await page.click(
      "#scheduleForm\\:atocons_panel > div > ul > li:nth-child(6)"
    ),
    await page.waitForNetworkIdle(),
  ]);

  //Add ato consular
  await Promise.all([
    await page.$eval(`#scheduleForm\\:bAddAto`, (element) => element.click()),
    await page.waitForNetworkIdle(),
  ]);
  //accept
  await Promise.all([
    await page.$eval(
      `#scheduleForm\\:dataTableListaAtos\\:0\\:selCond > div.ui-chkbox-box.ui-widget.ui-corner-all.ui-state-default`,
      (element) => element.click()
    ),
    await page.waitForNetworkIdle(),
  ]);
  //add
  await Promise.all([
    await page.$eval(
      `#scheduleForm\\:dataTableListaAtos\\:0\\:bCal`,
      (element) => element.click()
    ),
    await page.waitForNetworkIdle(),
  ]);

  await page.screenshot({ path: "final_photo.png", fullPage: true });

  const info = await page.$eval(
    "#scheduleForm\\:j_idt171 > div.ui-dialog-content.ui-widget-content > table > tbody > tr:nth-child(1) > td",
    (el) => el.textContent
  );

  console.log(info);

  await browser.close();

  bot.sendMessage(CHAT_ID, info)
  bot.sendPhoto(CHAT_ID, './final_photo.png');
}

start();
cron.schedule("0 */8 * * *", start);

