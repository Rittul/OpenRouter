import http from "k6/http";
import { check } from "k6";

export const options = {
    vus: 10,
    iterations: 10
};

export default function () {

    const url =
        "http://host.docker.internal:3000/v1/chat/completions";

    const payload = JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [
            {
                role: "user",
                content: "Hello"
            }
        ]
    });

    const params = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer sh-o3-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiJ1b3VtZHVlMTgxZnBhZmh5MGhpbWptIiwiaWF0IjoxNzgyNDcxMjA4LCJleHAiOjE4MTQwMDcyMDh9.oOW2GiF3F_an-k_SMVR2QEptlz1KL2iF6OMFVN45ZTA"
        }
    };

    const res = http.post(url, payload, params);

    check(res, {
        "Status is 200": (r) => r.status === 200,
    });
        const body = JSON.parse(res.body);

    check(body, {
        "Has content": (b) => b.content !== undefined,
        "Has usage": (b) => b.usage !== undefined,
    });

    console.log(res.body);
}