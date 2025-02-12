export async function postdata(url = "", data = {}) {
    const response = await fetch(url, {
        method: 'POST',
        mode: "cors",// no-cors, *cors, same-origin
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    return response.json();
}