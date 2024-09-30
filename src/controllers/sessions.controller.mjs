import { getSession, postSession } from "../models/sessions.model.mjs";


export function getSessions({ id }) { 
    return getSession({id});
}

export function postSessions({ data, sourceIp }){
    return postSession({data,sourceIp });
}