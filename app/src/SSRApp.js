import React from "react";
import {App} from "./App";
import {StaticRouter} from "react-router-dom/server";

export const SSRApp = (props) => {
    const {url, ...data} = props
    return (
        <StaticRouter location={url || '/'}>
            <App {...data}/>
        </StaticRouter>
    );
};