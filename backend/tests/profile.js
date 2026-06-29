import http from "k6/http";
import { check } from "k6";

export const options = {
    vus: 50,
    duration: "30s",

    thresholds: {
        http_req_failed: ["rate<0.01"],
        http_req_duration: ["p(95)<500"],
    },
};

export default function () {

    // Login first
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

    check(loginRes, {
        "Login Success": (r) => r.status === 200,
    });

    const loginOk = check(loginRes, {
        "Login Success": (r) => r.status === 200
    });

    if (!loginOk) {
        console.log("log in failed!");
        return;
    }

    // Profile request
    const profileRes = http.get(
        "http://host.docker.internal:3000/profile"
    );

    check(profileRes, {
        "Profile Success": (r) => r.status === 200,
    });

    if (profileRes.status !== 200) {
        console.log(profileRes.body);
    }
}