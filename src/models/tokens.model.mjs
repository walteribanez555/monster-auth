/* eslint-disable no-prototype-builtins */
/* eslint-disable no-console */
/**
 * 
 * tokens Handler
 * 
 */

// Dependencies
const { DatabaseOperations } = require( '../utils/database' );
const { helpers } = require( '../utils/helpers' );
const tableName = 'sessions';
const keyField = 'sessionId';
const database = new DatabaseOperations( tableName );
const auxDatabase = new DatabaseOperations( 'users' );

const model = {
    username : 'string',
    password : 'string',
};

const tokens = {
    get : async( username, id ) => {
        const data = { 
            where : username ? {
                username
            } : {
                [ keyField ] : id
            } 
        };
        const response = await database.read( data );
        return helpers.buildResponse( 200, response, 'get' );
    }, 
    post : async( data, host ) => {
        const newRegister = helpers.validateData( data, model );

        if ( Object.keys( newRegister ).length === 0 )
            return helpers.buildResponse( 400, { message : 'Missing required fields or not valid' }, 'post' );

        const filter = { 
            where : {
                username : newRegister.username,
            } 
        };

        const dataExist = await auxDatabase.read( filter );
        const validate =  dataExist && dataExist.length > 0 ? true : false;

        if ( !validate )
            return helpers.buildResponse( 406, { message : 'The username is not registered on the database' }, 'post' );

        const hashedPassword = helpers.hash( newRegister.password );
        if ( hashedPassword !== dataExist[ 0 ].hashedPassword )
            return helpers.buildResponse( 403, { message : 'Password did not match with stored password' }, 'post' );

        newRegister.host = host;
        newRegister.sessionDate = helpers.dateFormat();
        newRegister.expires = Date.now() + ( 1000 * 60 * 30 );
        delete newRegister.password;
        const response = await database.create( newRegister, keyField );
        const result = { 
            sessionId : response.insertId,
            username : newRegister.username,
            officeId : dataExist[ 0 ].officeId,
            userType : dataExist[ 0 ].userType,
        };    
        return helpers.buildResponse( 200, { sessionToken : helpers.utf8ToBase64( JSON.stringify( result ) ) }, 'post', keyField, result );
    },
    put : async( sessionToken = false, logout = false ) => {
        if ( !sessionToken )
            return helpers.buildResponse( 400, { message : 'Missing session token to update' }, 'put' );

        const cipher =  helpers.parseJsonToObject( helpers.base64ToUtf8( sessionToken ) );
        const filter = { 
            where : {
                [ keyField ] : cipher.sessionId,
            } 
        };
    
        const dataExist = await database.read( filter );
        const validate =  dataExist && dataExist.length > 0 ? true : false;

        if ( !validate )
            return helpers.buildResponse( 404, { message : 'The session token is not valid' }, 'put' );

        if ( parseInt( dataExist[ 0 ].expires ) < Date.now() )
            return helpers.buildResponse( 404, { message : 'The session token has already expired.' }, 'put' );

        const where = {
            [ keyField ] : cipher.sessionId
        };
        const update = {
            expires : logout ? 0 : Date.now() + 1000 * 60 * 30
        };

        const response = await database.update( update, where );
        return helpers.buildResponse( 200, response, 'put' );
    },
    delete : async( sessionToken = false ) => {
        if ( !sessionToken )
            return helpers.buildResponse( 400, { message : 'Missing session token to delete' }, 'delete' );

        const cipher =  helpers.parseJsonToObject( helpers.base64ToUtf8( sessionToken ) );
        const response = await database.delete( cipher.sessionId, keyField );
        return helpers.buildResponse( 200, response, 'delete' );
    }
};

module.exports = { tokens };
 