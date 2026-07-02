import * as Sentry from "@sentry/node"

Sentry.init({
  dsn: "https://bab89eb0c028856ccc1233bd8810653c@o4511653930205184.ingest.de.sentry.io/4511653936365648",
  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/node/configuration/options/#dataCollection
    // userInfo: false,
    // httpBodies: [],
  },
});