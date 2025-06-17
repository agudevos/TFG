import React, { useEffect } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom';
import Stripe from 'stripe'
import { postToApi } from '../../utils/functions/api';

const STRIPE_SECRET_KEY = import.meta.env.VITE_STRIPE_SECRET_KEY

function SuccessCreditPayment() {

    const stripe = new Stripe(STRIPE_SECRET_KEY)
    const [searchParams, setSearchParams] = useSearchParams()
    let counter = 0;


    async function createReservation() {
        const serviceId = searchParams.get('serviceId');
        const starting_date = searchParams.get('starting_date');
        const end_date = searchParams.get('end_date');
        console.log("Creating reservation for serviceId:", serviceId, "starting_date:", starting_date, "end_date:", end_date);
        await postToApi(`reservations/create/`, {
            "service": serviceId,
            "starting_date": starting_date,
            "end_date": end_date,
        })
    }

    useEffect(() => {
        if (counter > 0) return;
        counter++;
        createReservation()
    })

    return (
        <Navigate to="/client/reservations/list" />
    )
}
export default SuccessCreditPayment