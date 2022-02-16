import React, {useContext} from 'react';
import {UserListItem} from "./UserListItem";
import {AppContext} from "./context";

export const UserList = () => {
    const {users} = useContext(AppContext)
    return (
        <>
            <h1>Users:</h1>
            {users && users.map(user => (
                <UserListItem key={user.id} user={user}/>
            ))}
        </>
    );
}