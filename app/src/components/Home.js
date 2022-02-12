import React from 'react';
import {Link} from "react-router-dom";
import Logo from "../assets/logo-social.png";

export const Home = () => {
    return (
        <>
            <main>
                <h2>Welcome to the homepage!</h2>
                <p>You can do this, I believe in you.</p>
                <img src={Logo} alt={'Logo'}/>
            </main>
            <nav>
                <Link to="/about">About</Link>
            </nav>
        </>
    );

}