const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const cors = require("cors")({origin: true});

// Initialiser Firebase Admin
admin.initializeApp();

// Configurer le transporteur Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail", // Vous pouvez utiliser un autre service de messagerie
  auth: {
    user: "chaima.souguir127@gmail.com",
    pass: "Chaima123",
  },
});

// Définir une fonction HTTP pour envoyer des emails
exports.sendEmail = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    const {to, subject, text} = req.body;

    const mailOptions = {
      from: "chaima.souguir127@gmail.com",
      to: to,
      subject: subject,
      text: text,
    };

    return transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).send(error.toString());
      }
      return res.status(200).send("Email sent: " + info.response);
    });
  });
});
