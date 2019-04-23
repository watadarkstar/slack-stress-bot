require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { WebClient } = require("@slack/web-api");
const { createEventAdapter } = require("@slack/events-api");

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
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;

// Initialize
const web = new WebClient(token);
const slackEvents = createEventAdapter(slackSigningSecret);

// channel
const channel = "#stress-checkin";

// Plug the adapter in as a middleware
app.use("/slack/events", slackEvents.requestListener());

// Example: If you're using a body parser, always put it after the event adapter in the middleware stack
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Attach listeners to events by Slack Event "type". See: https://api.slack.com/events/message.im
slackEvents.on("message", event => {
  console.log(
    `Received a message event: user ${event.user} in channel ${
      event.channel
    } says ${event.text}`
  );
});

app.post("/", async (req, res) => {
  const message1 = {
    text: `Hi, I hope you are having a great day! :sunny:\n\nAs part of a wellness program we are running, each week your manager wants me to check-in with you regarding your stress levels at work.\n\n*How are you feeling this week on a scale of 0 - 10 (0 means no stress and 10 is a lot stress)?*`,
    attachments: [
      {
        fallback: "Shame... buttons aren't supported in this land",
        callback_id: "button_tutorial",
        color: "#3AA3E3",
        attachment_type: "default",
        actions: [
          {
            name: "I prefer not to say!",
            text: "I prefer not to say!",
            type: "button",
            value: "not-say"
          }
        ]
      }
    ],
    channel
  };

  const message2 = {
    text: `*Would you like your manager to check-in with you about your stress levels and reach out to you?*`,
    attachments: [
      {
        fallback: "Shame... buttons aren't supported in this land",
        callback_id: "button_tutorial",
        color: "#3AA3E3",
        attachment_type: "default",
        actions: [
          {
            name: "Yes!",
            text: "Yes!",
            type: "button",
            value: "yes"
          },
          {
            name: "No!",
            text: "No!",
            type: "button",
            value: "no"
          }
        ]
      }
    ],
    channel
  };

  // create a channel
  const result0 = await web.channels
    .join({ name: channel })
    .catch(e => console.error(e));

  // Post a message to the channel, and await the result.
  // Find more arguments and details of the response: https://api.slack.com/methods/chat.postMessage
  const result1 = await web.chat
    .postMessage(message1)
    .catch(e => console.error(e));

  const result2 = await web.chat
    .postMessage(message2)
    .catch(e => console.error(e));

  // The result contains an identifier for the message, `ts`.
  console.log(
    `Successfully send message ${result1.ts} in conversation ${channel}`
  );
});
