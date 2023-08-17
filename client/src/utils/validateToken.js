export default async function validateToken(setLoggedIn) {
    const token = window.localStorage.getItem('accToken');

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

    setLoggedIn(respObj.mess);
}