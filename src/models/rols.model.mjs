
import { DatabaseOperations } from "../utils/database.mjs";
import { buildResponse, validateData, colorLog } from "../utils/helpers.mjs";


const tableName = "rols";
const keyField = "rol_id";
const database = new DatabaseOperations(tableName);


const model = { 
    rol_name : "string",
    rol_structure : "string",
    status : "number",
}


export async function getRol({id}){
    try { 
        const data = {
            where : {
                [keyField] : id
            }
        }
        const response = await database.read(data);
        return buildResponse(200, response, 'get');
    }
    catch( error ) { 
        colorLog(`GET ROLES ERROR : ${ JSON.stringify(error)}`)
        return buildResponse( 500, error, 'get');
    }
}


export async function postRol({ data }) { 
     try { 
        const newRegister = validateData(data, model);
        const reg =  /'/g;
        const rol_structure = newRegister.rol_structure.replace(reg, '"');
        newRegister.rol_structure = rol_structure;
        newRegister.status = 1;

        if(Object.keys( newRegister).length === 0)
            return buildResponse(400, { message : 'Missing required fields or not valid '}, 'post');

        const response = await database.create(newRegister, keyField);
        return buildResponse(200, response, 'post', keyField, data);

     }catch ( error ){
        colorLog(`Post rols error : ${ JSON.stringify( error)}`, 'red', 'reset');
        return buildResponse(500, error, 'post');
     }
}


export async function putRol({id, data}){

    try{
        const update = validateData(data, model);
        const reg = /'/g;
        const rol_structure = update.rol_structure ? update.rol_structure.replace( reg, '"' ) : false;
        rol_structure ? update.rol_structure = rol_structure : null;

        if(Object.keys( update ).length === 0)
            return buildResponse(400, {message : 'Missing fields to update'} , 'put');

        if(!id)
            return buildResponse(400, { message : 'Missing the record id to update'}, 'put');


        const where = { 
            [keyField] : id
        }

        const response = await database.update( update, where);
        return buildResponse( 200 , response, 'put');



    }catch ( error ) { 

        colorLog(`PUT ROLES ERROR : ${ JSON.stringify(error)}`, 'red' , 'reset');
        return buildResponse(500, error , 'put');

    }
}

export async function deleteRol({id}){
    try{

        if(!id)
            return buildResponse(400, {message : 'Missing the record id to delete'}, 'delete');

        await database.delete(id, keyField);
        return buildResponse(200, {message : 'Register Deleted'}, 'delete');


    }catch ( error ) { 
         
        colorLog( `DELETE ROLES ERROR : ${ JSON.stringify( error )}`, 'red' , 'reset');
        return buildResponse(500, error, 'delete');

    }
}