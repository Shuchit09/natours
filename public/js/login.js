import axios from "axios";
import { showAlert } from "./alert";

export const login = async (email, password) => {
    try {
        const res = await axios({
            method: "POST",
            url: "/api/v1/users/login",
            data: {
                email,
                password
            }
        })
        if (res.data.status === 'success') {
            showAlert("success", 'Logged in successfully');
            window.setTimeout(() => { location.assign('/') }, 1000)
        }
    } catch (error) {
        showAlert("error", error.response.data.message);
    }

}

export const logout = async () => {
    try {
        const res = await axios({
            method: "GET",
            url: "/api/v1/users/logout"
        });
        if (res.data.status === "success") {
            location.assign('/')
            showAlert("success", 'Logged Out successfully');
        }
    } catch (error) {
        showAlert('error', 'Error loggin out! Try again.')
    }
}
