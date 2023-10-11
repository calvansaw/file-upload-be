const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const utils = require("./utils");
const fileList = require("./fileList");
const fs = require("fs");

const BUCKET_NAME = "cs-files-bucket";

const process = async (eventBody) => {
  const { content, fileName, public } = eventBody;
  const base64Str = content.slice(content.indexOf(","));
  const buff = Buffer.from(base64Str, "base64");
  let data;
  // need to write to /tmp dir of lambda func
  try {
    fs.writeFileSync("/tmp/file", buff);
  } catch (err) {
    console.log(err);
  }

  try {
    data = fs.readFileSync("/tmp/file");
  } catch (err) {
    console.log(err);
  }
  const fileKey = `${new Date().valueOf()}${fileName}`;
  const params = {
    Bucket: BUCKET_NAME,
    Key: fileKey,
    Body: data,
  };

  try {
    await s3.putObject(params).promise();
    const item = { public, fileKey };
    await fileList.saveFile(item);
  } catch (err) {
    console.log(err);
  }
  return utils.buildResponse(200);
};

module.exports.process = process;
