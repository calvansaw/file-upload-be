const fileProcessing = require("./fileProcessing");
const utils = require("./utils");
const fileList = require("./fileList");

const UPLOAD_URL = "/upload";
const FILE_URL = "/files";
const PUBLIC_URL = "/public";

const handler = async (event) => {
  console.log("event: ", event);
  let response;
  switch (true) {
    case event.httpMethod === "POST" && event.path === UPLOAD_URL:
    case event.httpMethod === "PUT" && event.path === UPLOAD_URL:
      response = await fileProcessing.process(JSON.parse(event.body));
      break;
    case event.httpMethod === "GET" && event.path === FILE_URL:
      response = await fileList.getFiles(JSON.parse(event.body), false);
      break;
    case event.httpMethod === "GET" && event.path === PUBLIC_URL:
      response = await fileList.getFiles(JSON.parse(event.body), true);
      break;
    // case event.httpMethod === "POST" && event.path === FILE_URL:
    //   response = await fileList.saveFile(JSON.parse(event.body));
    case event.httpMethod === "OPTIONS":
      response = utils.buildResponse(200);
      break;
    default:
      response = utils.buildResponse(404);
  }
  return response;
};

module.exports.handler = handler;
