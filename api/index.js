import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb" }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

const styles = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

a,
a:visited,
a:active {
  text-decoration: none;
  color: black;
}

.main-container{
  width: 100%;
  max-width:600px;
  height: 100vh;
}

footer {
  width: 100%;
  height: 250px;
  padding: 25px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  border-top: 1px solid #ccc;
}
.footer-container {
  min-width: 80%;
  max-width: 80%;
  height: 100%;
}
.footer-container > .grid-container {
  display: grid;
  grid-template-columns: repeat(2, 300px);
  grid-template-rows: repeat(1, 1fr);
}
.grid-item .address {
  display: flex;
  flex-shrink: 0;
  gap: 20px;
  line-height: 30px;
}
.grid-item img {
  height: 150px;
  margin-top: 5px;
}
.grid-item .grid-title {
  font-size: 18px;
}
.address p {
  font-size: 18px;
  font-weight: lighter;
}
.grid-item .social-media {
  width: 100%;
  display: flex;
  gap: 20px;
}
.social-media .social-icons {
  font-size: 35px;
  color: #505050;
  transition: all 0.2s;
}
.social-icons:hover {
  color: #ffffff;
}
.grid-item.artikel {
  display: flex;
  flex-direction: column;
  gap: 30px;
}
.grid-item.artikel a {
  font-size: 18px;
  color: #505050;
  transition: all 0.2s;
}
.grid-item.artikel a:hover {
  color: black;
}
* {
  flex-shrink: 0;
}
header {
  height: 80px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ccc;
  padding: 0 1rem;
}

header .logo {
  height: 100%;
  display: flex;
  margin-right: auto;
}

.logo-container {
  display: flex;
}

.logo-img {
  height: 5rem;
  max-height:5rem;
  max-width: 5rem;
}

.mobile-menu i {
  padding: 0 20px;
}
menu {
  display: flex;
  gap: 10px;
}

menu > .menu-item {
  display: block;
  color: #505050;
  padding: 10px;
  transition: all 0.2s linear;
  text-underline-offset: 5px;
  text-decoration: underline 1px rgba(0, 0, 0, 0);
}

menu > .menu-item:hover {
  color: black;
  text-underline-offset: 5px;
  text-decoration: underline 1px #ccc;
  transition: all 0.2s linear;
}
section {
  flex: 1;
  width: 100%;
}
h1 {
  width: 100%;
  text-align: center;
}
#mailText {
  word-break: keep-all;
  padding: 1rem;
}


    `;

async function sendEmail({
  deviceId,
  deviceLocation,
  deviceTyp,
  technicerEmail,
}) {
  // deviceId, deviceLocation, deviceTyp
  return new Promise(async (resolve, reject) => {
    let mailTitle = "Regelmäßige Wartung eines bestimmten Computers im Büro";

    const html = `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
        integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A=="
        crossorigin="anonymous"
        referrerpolicy="no-referrer"
      />
      
      <title>Document</title>
      <style>${styles}</style>
    </head>
  
    <body class="body">
      <main class="main">
        <div class="main-container">
        <header>
          <div class="logo">
            <div class="logo-container">
              <img
                class="logo-img"
                src="https://github.com/MuratAkkus0/MailInterface/blob/main/images/ScooTeq%20Gmbh.png?raw=true"
                alt="Logo"
              />
            </div>
          </div>
          <menu>
            <a href="#" class="menu-item">Home</a>
            <a href="#" class="menu-item">Produkte</a>
            <a href="#" class="menu-item">Blog</a>
            <a href="#" class="menu-item">Unternehmen</a>
          </menu>
        </header>
        <section>
          <div class="content-container">
            <h1 id="mailTitle">${mailTitle}</h1><br><br>
            <p id="mailText">
            
    Sehr geehrte Damen und Herren,<br><br>
  
  wir möchten Sie darüber informieren, dass es notwendig ist, eine regelmäßige Wartung eines bestimmten Computers in unserem Büro durchzuführen. Die Wartung betrifft den Computer mit der folgenden Identifikation und Standort:
  <br><br>
  Gerätname: ${deviceTyp}-${deviceId}<br>
  ID: ${deviceId}<br>
  Typ : ${deviceTyp}<br>
  ${deviceTyp == "Laptop" ? "Besitzer" : "Standort"}: ${deviceLocation}<br><br>
  Wir bitten Sie, die Wartungsarbeiten während der regulären Arbeitszeiten von Montag bis Freitag durchzuführen. Eine gesonderte Terminvereinbarung ist nicht erforderlich. Sie können die Wartung flexibel innerhalb dieser Zeiten vornehmen.
 <br><br>
  Bitte bestätigen Sie uns kurz, dass die Arbeiten wie beschrieben durchgeführt werden können. Bei Rückfragen oder weiteren Details stehen wir Ihnen gerne zur Verfügung.
  <br>
  Vielen Dank für Ihre Unterstützung.
  <br><br>
  Mit freundlichen Grüßen,
  <br>
  ScooTeq GmbH
            
            </p>
          </div>
        </section>
        <footer>
          <div class="footer-container">
            <div class="grid-container">
              <div class="grid-item">
                <div class="address">
                  <a href="https://www.iap.de/de/">
                                  <img class="logo-img"
                                  src="https://github.com/MuratAkkus0/MailInterface/blob/main/images/ScooTeq%20Gmbh.png?raw=true"
                                      alt="Logo"></a>
                              <div class="footer-text">
                                  <h5 class="grid-title">ScooTeq GmbH</h5>
                                  <a href="https://maps.app.goo.gl/QtsSY5MUaKeZMexY6" target="_blank"><p>Valentinskamp 30<br>D-20355 Hamburg, Germany</p></address>
                              </div>
                </div>
                <div class="social-media">
                  <a href="https://www.linkedin.com/company/iap-gmbh" target="_blank" class="social-icons"><i class="fa-brands fa-linkedin"></i></a>
                              <a href="#" target="_blank" class="social-icons"><i class="fa-brands fa-square-facebook"></i></a>
                              <a href="#" target="_blank" class="social-icons"><i class="fa-brands fa-square-xing"></i></a>
                              <a href="#" target="_blank" class="social-icons"><i class="fa-brands fa-square-twitter"></i></a>
                              <a href="#" target="_blank" class="social-icons"><i class="fa-solid fa-circle-info"></i></a>
                </div>
              </div>
              
            </div>
          </div>
        </footer>
        </div>
      </main>
    </body>
  </html>
  `;

    const transporter = nodemailer.createTransport({
      host: "smtp-relay.gmail.com",
      port: 587,
      secure: false,
      service: "gmail",
      auth: {
        user: "akkusmurat123@gmail.com",
        pass: "cydjetpvxklxtcmp",
      },
    });

    const info = await transporter.sendMail({
      from: "ScooTeq GmbH <akkusmurat123@gmail.com>",
      to: technicerEmail,
      subject: mailTitle,
      html: html,
    });

    console.log("message sent : " + info.messageId);
  });
}
app.get("/", (req, res) => {
  sendEmail()
    .then((response) => res.send(response.message))
    .catch((error) => res.status(500).send(error.message));
});

app.post("/send_mail", (req, res) => {
  console.log(req.body);
  sendEmail(req.body)
    .then((response) => res.send(response.message))
    .catch((error) => res.status(500).send(error.message));
});

app.listen(port, () => {
  console.log(`nodemailerProject is listening at http://localhost:${port}`);
});

// main().catch((e) => console.log(e));
