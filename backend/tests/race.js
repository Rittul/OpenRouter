import http from "k6/http";
import { check } from "k6";

export const options = {
    vus: 20,
    iterations: 20,
};

export default function () {

    const loginPayload = JSON.stringify({
        email: "loadtest@example.com",
        password: "Password@123"
    });

    const loginRes = http.post(
        "http://host.docker.internal:3000/login",
        loginPayload,
        {
            headers: {
                "Content-Type": "application/json"
            }
        }
    );

    const loginOk = check(loginRes, {
        "Login Success": (r) => r.status === 200,
    });

    if (!loginOk) {
        console.log(loginRes.body);
        return;
    }

    const payload = JSON.stringify({
        conversationId: 7,
        content: "Race Test"
    });

    const res = http.post(
        "http://host.docker.internal:3000/chat/completion",
        payload,
        {
            headers: {
                "Content-Type": "application/json"
            }
        }
    );

    if (res.status !== 200) {
        console.log(res.status);
        console.log(res.body);
    }
}