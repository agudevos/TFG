import React, { useContext, useEffect, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom';
import Stripe from 'stripe'
import { putToApi } from '../../utils/functions/api';
import EstablishmentContext from '../../utils/context/EstablishmentContext';

const STRIPE_SECRET_KEY = import.meta.env.VITE_STRIPE_SECRET_KEY

function SuccessPage() {

    const {selectedEstablishment} = useContext(EstablishmentContext)
    const stripe = new Stripe(STRIPE_SECRET_KEY)
    const [searchParams, setSearchParams] = useSearchParams()


    async function updateGymSubscription() {
         const session = await stripe.checkout.sessions.retrieve(searchParams.get('session_id'))
         const customer = await stripe.customers.retrieve(session.customer, {
            expand: ['subscriptions']
        })
        await putToApi(`establishments/${selectedEstablishment.id}/update/`, {
            "customer_id": customer.id,
            "subscription": "premium"
        })
    }

    useEffect(() => {
        updateGymSubscription()
    }, [])

    return (
        <Navigate to="/worker/establishment/select" />
    )
}
export default SuccessPage