import jwt from "jsonwebtoken";
import { DatabaseOperations } from "../utils/database.mjs";
import {
  buildResponse,
  validateData,
  colorLog,
  hash,
  dateFormat,
} from "../utils/helpers.mjs";

const tableName = "sessions";
const keyField = "session_id";
const database = new DatabaseOperations(tableName);
const auxDatabase = new DatabaseOperations("users");
const auxDatabaseRols = new DatabaseOperations("rols");

const model = {
  username: "string",
  password: "string",
};

export async function getSession({ id }) {
  try {
    const data = {
      where: {
        [keyField]: id,
      },
    };

    const response = await database.read(data);
    return buildResponse(200, response, "get");
  } catch (error) {
    colorLog(`GET SESSIONS ERROR : ${JSON.stringify(error)}`, "red", "reset");
    return buildResponse(500, error, "get");
  }
}

export async function postSession({ data, sourceIp }) {
  try {
    const newRegister = validateData(data, model);

    if (Object.keys(newRegister).length === 0)
      return buildResponse(
        400,
        { message: "Missing required fields or not valid" },
        "post"
      );

    const filter = {
      where: {
        username: newRegister.username,
      },
    };

    const dataExist = await auxDatabase.read(filter);
    const validate = dataExist && dataExist.length > 0 ? true : false;

    if (!validate)
      return buildResponse(
        406,
        { message: "The username is not registered on the database" },
        "post"
      );

    const hashedPassword = hash(newRegister.password);

    if (hashedPassword !== dataExist[0].hashed_password)
      return buildResponse(
        403,
        { message: "Password did not match with stored password" },
        "post"
      );

    const userRols = dataExist[0].rols.split(",");
    const rols = await auxDatabaseRols.read();

    console.log("ROLS: ", rols);
    console.log("USER ROLS: ", userRols);

    const userRolsData = rols.filter((rol) =>
      userRols.includes(rol.rol_id.toString())
    );

    console.log("USER ROLS DATA: ", userRolsData);

    newRegister.host = sourceIp;
    newRegister.session_date = dateFormat();
    newRegister.expires = 60 * 60 * 12;
    delete newRegister.password;
    const response = await database.create(newRegister, keyField);
    const result = {
      sessionId: response.insertId,
      username: newRegister.username,
      user_id: dataExist[0].user_id,
      rols: dataExist[0].rols,
    };

    return buildResponse(
      200,
      {
        sessionToken: jwt.sign(result, process.env.SECRET, {
          expiresIn: newRegister.expires,
        }),
        username : newRegister.username,
        user_id : dataExist[0].user_id,
        name : dataExist[0].name,
        rols : userRolsData,
      },
      "post",
      keyField,
      result
    );
  } catch (error) {
    colorLog(` POST SESSIONS ERROR:  ${JSON.stringify(error)}`, "red", "reset");
    return buildResponse(500, error, "post");
  }
}
