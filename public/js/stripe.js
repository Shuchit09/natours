import axios from 'axios';
import { showAlert } from './alert';

export const bookTour = async tourId => {
    try {
        if (typeof Stripe === 'undefined') {
            showAlert('error', 'Stripe library failed to load.');
            return;
        }

        const stripe = Stripe('pk_test_51RW0rM7W2Z3LchUGiXzu5WKXBzuorzMee3JlAoGrdF4CZy2vXgb8NoBPKAXj7IlkrePjexXX3KkjQF2slSZF8a1G00R5LLJKeV');

        const session = await axios({
            method: 'GET',
            url: `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
        });

        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });

    } catch (error) {
        console.error(error);
        showAlert('error', error.response?.data?.message || error.message || 'Something went wrong');
    }
};
