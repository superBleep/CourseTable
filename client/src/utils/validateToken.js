export default async function validateToken(setLoggedIn) {
    const token = window.localStorage.getItem('accToken');

    if(token) {
        const resp = await fetch('http://localhost:5000/api/validate', {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({token})
        });
        const respObj = await resp.json();

        if(respObj.mess == 'Token validated') {
            setLoggedIn(true);
        }
        else if(respObj.mess == 'Token revalidated') {
            window.localStorage.setItem('accToken', respObj.token);
            setLoggedIn(true);
        }
        else
            setLoggedIn(false)
    } else {
        setLoggedIn(false);
    }

}