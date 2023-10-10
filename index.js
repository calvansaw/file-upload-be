const fileProcessing = require("./fileProcessing");
const utils = require("./utils");

const FILE_URL = "/upload";

const handler = async (event) => {
  console.log("event: ", event);
  let response;
  switch (true) {
    case event.httpMethod === "PUT" && event.path === FILE_URL:
      response = await fileProcessing.process(JSON.parse(event.body));
      break;

    default:
      response = utils.buildResponse(404);
  }
  return response;
};

module.exports.handler = handler;
