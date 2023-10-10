const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const utils = require("./utils");
const fs = require("fs");

const BUCKET_NAME = "cs-files-bucket";

const process = async (eventBody) => {
  const { content, fileName } = eventBody;
  const base64Str = content.slice(content.indexOf(","));
  const buff = Buffer.from(base64Str, "base64");
  let data;
  // need to write to /tmp dir of lambda func
  try {
    fs.writeFileSync("/tmp/file", buff);
  } catch (err) {
    console.error(err);
  }

  try {
    data = fs.readFileSync("/tmp/file");
  } catch (err) {
    console.error(err);
  }

  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: data,
  };

  await s3.putObject(params).promise();
  return utils.buildResponse(200);
};

module.exports.process = process;
