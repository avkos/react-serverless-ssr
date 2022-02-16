import React, {useContext} from 'react';
import {Link, useParams} from "react-router-dom";
import {AppContext} from "./context";
import Button from "@mui/material/Button";

export const User = () => {
    const {id} = useParams();
    const {users} = useContext(AppContext)
    const user = users.find(u => u.id = id)
    if(!user){
        return (
            <div>User not found</div>
        )
    }
    return (
        <>
            <Button variant="contained" component={Link} to={`/`}>Back to list</Button>
            <h1>User details</h1>
            <div>{user.id}</div>
            <div>{user.firstName}</div>
            <div>{user.lastName}</div>
            <div>{user.country}</div>
            <div>{user.createdAt}</div>
        </>
    );

}