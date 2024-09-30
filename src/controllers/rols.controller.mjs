
import { getRol, postRol, putRol, deleteRol } from "../models/rols.model.mjs";


export async function getRols({id}){
    return getRol({id});
}

export async function postRols({data}){
    return postRol({data});
}

export async function putRols({id, data}) { 
    return putRol({id, data});
}

export async function deleteRols({id}){
    return deleteRol({id});
}