const puppeteer = require("puppeteer");

async function start() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--window-size=1920,1040"],
  });
  const page = await browser.newPage();
  await page.goto(
    "https://agendamentosonline.mne.gov.pt/AgendamentosOnline/app/scheduleAppointmentForm.jsf"
  );
  page.waitForNavigation();

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
  // go to login page
  // await page.click("#j_idt61");
  // await page.click("#indexForm\\:j_idt29");

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

  const info = await page.$eval(
    "#scheduleForm\\:j_idt171 > div.ui-dialog-content.ui-widget-content > table > tbody > tr:nth-child(1) > td",
    (el) => el.textContent
  );

  console.log(info);

  await page.screenshot({ path: "amazing.png", fullPage: true });
  // await browser.close();
}

start();
