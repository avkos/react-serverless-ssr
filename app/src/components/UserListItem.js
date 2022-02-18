import React from 'react';
import {Link} from "react-router-dom";
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import Avatar from '@mui/material/Avatar';

export const UserListItem = ({user}) => {
    const initials = `${user.firstName[0].toUpperCase()}${user.lastName[0].toUpperCase()}`
    return (
        <Card component={Link} to={`/user/${user.id}`}>
            <CardHeader
                avatar={
                    <Avatar aria-label={initials} style={{backgroundColor:`rgb(${parseInt(Math.random()*255)},${parseInt(Math.random()*255)},${parseInt(Math.random()*255)})`}}>
                        {initials}
                    </Avatar>
                }
                title={`${user.firstName} ${user.lastName}`}
                subheader={user.country}
            />
            <CardMedia
                component="img"
                height="194"
                image={user.url}
                alt="Image"
            />
        </Card>
    );
}