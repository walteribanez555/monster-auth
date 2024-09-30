import { DatabaseOperations, executeMySql } from "../utils/database.mjs";
import { buildResponse, validateData, colorLog, validateEmail, hash, dateFormat } from "../utils/helpers.mjs";

const tableName = "users";
const keyField  = "user_id";
const database = new DatabaseOperations(tableName);


const model = { 
    username : "string",
    password : "string",
    name : "string",
    status : "number",
    rols : "string",
}


export async function getUser({id, username}){

    try {
        const data = { 
            where : {
                [ keyField ] : id,
                username
            }
        };
        const response = await database.read( data );
        return buildResponse( 200 , response , 'get');
    }catch( error ) { 
        colorLog(`Get Users Error : ${ JSON.stringify(error)}`, 'red' , 'reset');
        return buildResponse( 500, error , 'get');
    }
}


export async function postUser({data}){
    try { 
        const newRegister = validateData(data , model);
        if( Object.keys( newRegister ).length === 0)
            return buildResponse(400, { message : 'Missing required fields or not valid'}, 'post');

        const filter = { 
            where : {
                [keyField] : newRegister.username,
            }
        }

        const dataExist = await database.read( filter );
        const validate = dataExist && dataExist.rows?.length > 0 ? true : false;


        if(validate)
            return  buildResponse(406, { message : 'A register with that Username already exists'} , 'post');

        if( newRegister.password !== newRegister.confirm)
            return buildResponse(400, { message : 'Password confirmation does not match password'}, 'post');


        newRegister.hashed_password = hash(newRegister.password);
        newRegister.status =1;
        newRegister.date_created = dateFormat();
        delete newRegister.confirm;
        delete newRegister.password;

        const response = await database.create( newRegister, keyField);
        return buildResponse(200, response, 'post', keyField, data);

    }catch( error) { 
        colorLog(`Post Users Error : ${ JSON.stringify(error)}`, 'red', 'reset');
        return buildResponse(500, error, 'post');
    }
}


export async function putUser( { id, data } ) {
    try {
        const update = validateData( data, model, 'put' );

        if ( Object.keys( update ).length === 0 )
            return buildResponse( 400, { message : 'Missing fields to update' }, 'put' );

        if ( !id )
            return buildResponse( 400, { message : 'Missing the record id to update' }, 'put' );

        if ( ( update.password || update.confirm ) && ( update.password !== update.confirm ) )
            return buildResponse( 400, { message : 'Password confirmation does not match password' }, 'put' );


        if ( update.password && update.confirm ) {
            update.hashed_password = hash( update.password );
            delete update.confirm;
            delete update.password;    
        }

        const where = {
            [ keyField ] : id
        };

        const response = await database.update( update, where );
        return buildResponse( 200, response, 'put' );
    } catch( error ) { 
        colorLog( ` PUT USERS ERROR:  ${ JSON.stringify( error ) }`, 'red', 'reset' );
        return buildResponse( 500, error, 'put' );
    }
}

export async function deleteUser( { id } ) {
    try {
        if ( !id )
            return buildResponse( 400, { message : 'Missing the record id to delete' }, 'delete' );

        await database.delete( id, keyField );
        return buildResponse( 200, { message : 'Register deleted!' }, 'delete' );
    } catch( error ) { 
        colorLog( ` DELETE USERS ERROR:  ${ JSON.stringify( error ) }`, 'red', 'reset' );
        return buildResponse( 500, error, 'delete' );
    }
}


