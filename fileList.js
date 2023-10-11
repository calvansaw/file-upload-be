const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();
const utils = require("./utils");

const DYNAMO_TABLE = "file-list";
const BUCKET_NAME = "cs-files-bucket";

const scanDynamo = async (params, list) => {
  try {
    const dynamoData = await dynamodb.scan(params).promise();
    console.log("params: ", params);
    console.log("dynamoData: ", dynamoData);
    list = [...list, ...dynamoData.Items];
    if (dynamoData.LastEvaluatedKey) {
      params.ExclusiveStartKey = dynamoData.LastEvaluatedKey;
      return await scanDynamo(params, list);
    }
    return list;
  } catch (err) {
    console.log(err);
  }
};

const getUrl = (key) => {
  const params = { Bucket: BUCKET_NAME, Key: key };
  const url = s3.getSignedUrl("getObject", params);
  console.log("The URL is", url);
  return url;
};

const getFiles = async (eventBody, isPublic) => {
  console.log("getFiles: isPublic ?", isPublic);
  const params = {
    TableName: DYNAMO_TABLE,
    ...(isPublic && {
      FilterExpression: "#pub = :pub",
      ExpressionAttributeNames: {
        "#pub": "public",
      },
      ExpressionAttributeValues: {
        ":pub": isPublic,
      },
    }),
  };
  const allFiles = await scanDynamo(params, []);
  const fileUrls = [];
  allFiles.forEach((f) => {
    fileUrls.push(getUrl(f.fileKey));
  });
  const body = { fileUrls };
  return utils.buildResponse(200, body);
};

const saveFile = async (item) => {
  const itemData = { ...item, fileId: item.fileKey };
  const params = { TableName: DYNAMO_TABLE, Item: itemData };
  return await dynamodb
    .put(params)
    .promise()
    .then(
      () => {
        const body = {
          Operation: "SAVE",
          Message: "SUCCESS",
          Item: itemData,
        };
        return utils.buildResponse(200, body);
      },
      (err) => {
        console.log(err);
      }
    );
};

module.exports = { getFiles, saveFile };
