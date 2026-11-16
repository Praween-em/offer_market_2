import React, { createContext, useState, useContext, ReactNode } from 'react';

interface RequestData {
    id: string;
    title: string;
    description?: string;
    category?: string;
    distance?: string;
    type?: string;
}

interface RequestAlertContextType {
    activeRequest: RequestData | null;
    showRequest: (data: RequestData) => void;
    dismissRequest: () => void;
}

const RequestAlertContext = createContext<RequestAlertContextType | undefined>(undefined);

export const RequestAlertProvider = ({ children }: { children: ReactNode }) => {
    const [activeRequest, setActiveRequest] = useState<RequestData | null>(null);

    const showRequest = (data: RequestData) => {
        setActiveRequest(data);
    };

    const dismissRequest = () => {
        setActiveRequest(null);
    };

    return (
        <RequestAlertContext.Provider value={{ activeRequest, showRequest, dismissRequest }}>
            {children}
        </RequestAlertContext.Provider>
    );
};

export const useRequestAlert = () => {
    const context = useContext(RequestAlertContext);
    if (context === undefined) {
        throw new Error('useRequestAlert must be used within a RequestAlertProvider');
    }
    return context;
};
