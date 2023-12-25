const express = require("express");
const config = require("config");
const mongoose = require("mongoose");
cookieParser = require("cookie-parser");
const path = require("path");
var bodyParser = require("body-parser");
const winston = require("winston");
const morgan = require("morgan");
const cors = require("cors");

const { combine, timestamp, json } = winston.format;

const logger = winston.createLogger({
  level: "http",
  format: combine(
    timestamp({
      format: "YYYY-MM-DD hh:mm:ss.SSS A",
    }),
    json()
  ),
  transports: [
    new winston.transports.File({ filename: "combined.log" }),
    // new winston.transports.Console(),
    new winston.transports.File({ filename: "error.log", level: "error" }),
  ],
});

const app = express();
const morganMiddleware = morgan(
  ":remote-addr :method :url :status :remote-user :req[header] :res[content-length] - :response-time ms :referrer :user-agent",
  {
    stream: {
      // Configure Morgan to use our custom logger with the http severity
      write: (message) => logger.http(message.trim()),
    },
  }
);

app.use(morganMiddleware);
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true,
  })
);

const db = require("./knowItall_models");

// app.use((req, res, next) => {
const corsWhitelist =
  process.env.NODE_ENV !== "production"
    ? config.corsWhitelistDev
    : config.corsWhitelist;

//   console.log(req.headers.origin);
//   if (corsWhitelist.indexOf(req.headers.origin) !== -1) {
//     res.header("Access-Control-Allow-Origin", req.headers.origin);
//      res.header(
//        "Access-Control-Allow-Methods",
//        "GET,HEAD,OPTIONS,POST,PUT,PATCH"
//      );
//      res.header(
//        "Access-Control-Allow-Headers",
//        "Access-Control-Request-Headers, Origin, X-Requested-With, Content-Type, Accept, Authorization"
//      );
//   }
//   console.log(req.method);
//   next();
// });
var corsOptions = {
  origin: function (origin, callback) {
    if (corsWhitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};
app.use(cors(corsOptions));

app.use(cookieParser());
app.use(express.json({ extended: true }));
app.use("/api/check", require("./routes/checkAuth.routes"));
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/knowitall", require("./routes/knowitall.routes"));

const PORT = config.get("port");

if (process.env.NODE_ENV === "production") {
  app.use("/", express.static(path.join(__dirname, "client")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "index.html"));
  });
}

async function start() {
  try {
    await db.sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
  try {
    await mongoose.connect(config.get("mongoURI"), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    app.listen(PORT, () => console.log(`Server has been started at ${PORT}`));
  } catch (error) {
    console.log("Server error", error.message);
    process.exit(1);
  }
}

start();
