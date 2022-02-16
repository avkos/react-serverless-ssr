import React from 'react';
import Button from '@mui/material/Button';
import {Link} from 'react-router-dom';

export const UserListItem = ({user}) => {
    return (
        <>
            <div>{user.id}</div>
            <div>{user.firstName}</div>
            <div>{user.lastName}</div>
            <div>{user.country}</div>
            <div>{user.createdAt}</div>
            <Button variant="contained" component={Link} to={`/user/${user.id}`}>Details</Button>
        </>
    );
}