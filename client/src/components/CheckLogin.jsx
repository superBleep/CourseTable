import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import validateToken from "../utils/validateToken";

export default function CheckLogin({ children }) {
    const [loggedIn, setLoggedIn] = useState(null);

    useEffect(() => {
        validateToken(setLoggedIn);
    }, []);

    if (loggedIn == null) return <p>Loading...</p>;
    else if (loggedIn == 'Token validated') return children;
    else return <Navigate to='/login' />;
}