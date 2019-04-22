require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { WebClient } = require("@slack/web-api");

// Creates express app
const app = express();
// The port used for Express server
const PORT = 3000;
// Starts server
app.listen(process.env.PORT || PORT, function() {
  console.log("Bot is listening on port " + PORT);
});

// Read a token from the environment variables
const token = process.env.SLACK_AUTH_TOKEN;

// Initialize
const web = new WebClient(token);

// conversationId
const conversationId = "#general";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.post("/", async (req, res) => {
  const message = {
    text: `Hi, I hope you are having a great day! :sunny:\n\nAs part of a wellness program we are running, each week your manager wants me to check-in with you regarding your stress levels at work.\n\nIf you say you are having a hard time your manager will check-in with you.\n\n*How are your feeling this week?*`,
    attachments: [
      {
        fallback: "Shame... buttons aren't supported in this land",
        callback_id: "button_tutorial",
        color: "#3AA3E3",
        attachment_type: "default",
        actions: [
          {
            name: "I'm great!",
            text: "I'm great!",
            type: "button",
            value: "great"
          },
          {
            name: "I'm okay!",
            text: "I'm okay!",
            type: "button",
            value: "okay"
          },
          {
            name: "I'm meh!",
            text: "I'm meh!",
            type: "button",
            value: "meh"
          },
          {
            name: "I'm struggling!",
            text: "I'm struggling!",
            type: "button",
            value: "struggling"
          },
          {
            name: "I'm having a hard time (check-in)!",
            text: "I'm having a hard time (check-in)!",
            type: "button",
            value: "hard-time"
          }
        ]
      }
    ],
    channel: conversationId
  };

  // Post a message to the channel, and await the result.
  // Find more arguments and details of the response: https://api.slack.com/methods/chat.postMessage
  const result = await web.chat
    .postMessage(message)
    .catch(e => console.error(e));

  // The result contains an identifier for the message, `ts`.
  console.log(
    `Successfully send message ${result.ts} in conversation ${conversationId}`
  );
});
