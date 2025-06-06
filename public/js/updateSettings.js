import axios from "axios"
import { showAlert } from './alert'

// type is either password or data
export const updateSettings = async (data, type) => {
    try {
        const url = type === "password" ? "/api/v1/users/updateMyPassword" : "/api/v1/users/updateMe"
        const res = await axios({
            method: "PATCH",
            url,
            data
        })

        if (res.data.status === 'success') {
            showAlert('success', `${type.toUpperCase()} updated successfully`)
            window.setTimeout(() => { location.reload(true) }, 4000)
        }
    } catch (error) {
        const message =
            error.response?.data?.message || error.message || "Something went wrong!";
        showAlert('error', message);
    }
}