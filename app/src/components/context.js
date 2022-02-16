import React, {createContext, useState} from "react";

export const AppContext = createContext({});

export const ContextProvider = ({children, initData = []}) => {
    const [data, setData] = useState(initData || {});

    return (
        <AppContext.Provider
            value={{...data, setData}}
        >
            {children}
        </AppContext.Provider>
    );
};
