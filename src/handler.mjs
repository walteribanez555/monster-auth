import { ping } from "./utils/ping.mjs";
import { buildResponse, parseJsonToObject } from "./utils/helpers.mjs";
import { getUsers, postUsers, putUsers, deleteUsers } from "./controllers/users.controller.mjs";
import { getRols, putRols, postRols, deleteRols} from './controllers/rols.controller.mjs';
import { getSessions, postSessions } from "./controllers/sessions.controller.mjs";

export const handler = async ( event ) =>  {
    console.log( 'Main Fecha-Hora: ', new Date() );
    console.log( 'EVENT: ' , event );
    const { method, path, sourceIp } = event?.requestContext?.http ? event.requestContext.http : {};
    const { id, username } = typeof( event.queryStringParameters ) === 'object' && Object.keys( event.queryStringParameters ).length > 0 ? event.queryStringParameters : false;
    const data = typeof( event.body ) === 'string' && Object.keys( parseJsonToObject( event.body ) ).length > 0 ? parseJsonToObject( event.body ) : {};
    console.log( 'DATA: ' , data );
    console.log( 'ID: ' , id );
    console.log( 'METHOD: ' , method.toLowerCase() );
    console.log( 'PATH: ' , path );
    const endpoints = {
        '/' : ping,
        '/users' : { 
            'get' : getUsers,
            'post' : postUsers,
            'put' : putUsers,
            'delete' : deleteUsers,
        },
        '/rols' : { 
            'get' : getRols,
            'post' : postRols,
            'put' : putRols,
            'delete' : deleteRols,
        },
        '/sessions' : {
            'get' : getSessions,
            'post' : postSessions,
        },
       
        'others' : buildResponse
    };

    if ( path === '/' )
        return endpoints[ path ]();

    try{
        if ( endpoints.hasOwnProperty( path ) )
            return await endpoints[ path ][ method.toLowerCase() ]( { id, username, data, sourceIp } );
    
        return endpoints.others( 404, '404 Not Found' );
    }catch ( error ) {
        console.log( 'ERROR VERIFIED: ', error );
        return endpoints.others( 400, { message : error }, 'other' );
    }

}

