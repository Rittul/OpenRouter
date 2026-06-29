import http from "k6/http";
import { check } from "k6";

export const options = {
    vus: 50,
    duration: "30s",
};

export default function () {

    const payload = JSON.stringify({
        email: "loadtest@example.com",
        password: "Password@123"
    });

    const params = {
        headers: {
            "Content-Type": "application/json"
        }
    };

    const res = http.post(
        "http://host.docker.internal:3000/login",
        payload,
        params
    );

    check(res, {
        "Status is 200": (r) => r.status === 200,
    });

    if (res.status !== 200) {
        console.log(res.body);
    }
}