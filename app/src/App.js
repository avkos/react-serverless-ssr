import React from 'react';
import './App.css';
import './index.css';
import {UserList} from './components/UserList'
import {Routes, Route} from "react-router-dom";
import {ContextProvider} from "./components/context";
import {User} from "./components/User";
import {window} from "global";
export const App = ({initData}) => {
    return (
        <ContextProvider initData={(window && window.__data) || initData}>
            <div className="App">
                <Routes>
                    <Route path="/" element={<UserList/>}/>
                    <Route path="/user/:id" element={<User/>}/>
                </Routes>
            </div>
        </ContextProvider>
    );
}
