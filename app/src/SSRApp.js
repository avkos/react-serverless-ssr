import React from "react";
import {App} from "./App";
import { StaticRouter } from "react-router-dom/server";

export const SSRApp = (props) => {
    return (
        <StaticRouter location={props.url || '/'}>
            <App {...props}/>
        </StaticRouter>
    );
};