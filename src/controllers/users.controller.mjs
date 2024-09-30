import { getUser, postUser, putUser, deleteUser } from "../models/users.model.mjs";



export async function getUsers({id, username}){
    return getUser({id, username});
}

export async function postUsers({data}) { 
    return postUser({data});
}

export  async function putUsers({id, data}){
    return putUser({id, data});
}

export async function deleteUsers({id}) {
    return deleteUser({id});
}