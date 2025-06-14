import Stripe from "stripe";

const STRIPE_SECRET_KEY = import.meta.env.VITE_STRIPE_SECRET_KEY;
console.log('🗝️ API Key configurada:', STRIPE_SECRET_KEY ? 'Sí' : 'No');

const stripe = new Stripe(STRIPE_SECRET_KEY)

export function GetPricingPlans(){
    return stripe.products.list({
        active: true,
        expand: ['data.default_price'],
    });
}

export async function CreateCheckoutFreeSession(priceId, quantity = 1){
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price: priceId,
                quantity: quantity,
            },
        ],
        mode: 'subscription',
        subscription_data: {
            trial_period_days: 30,
        },
        success_url: `${window.location.origin}/worker/success?session_id={CHECKOUT_SESSION_ID}&priceId=${priceId}`,
        cancel_url: `${window.location.origin}/worker/pricing`,
    });
    return JSON.stringify({url: session.url});
}

export async function CreateCheckoutSession(priceId, quantity = 1){
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price: priceId,
                quantity: quantity,
            },
        ],
        mode: 'subscription',
        success_url: `${window.location.origin}/worker/success?session_id={CHECKOUT_SESSION_ID}&priceId=${priceId}`,
        cancel_url: `${window.location.origin}/worker/pricing`,
    });
    return JSON.stringify({url: session.url});
}

export async function CreateCheckoutCreditSession(priceId, quantity = 1, serviceId, starting_date, end_date){
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price: priceId,
                quantity: quantity,
            },
        ],
        mode: 'payment',
        success_url: `${window.location.origin}/client/success?serviceId=${serviceId}&starting_date=${starting_date}&end_date=${end_date}`,
        cancel_url: `${window.location.origin}/client/services/${serviceId}`,
    });
    console.log(session);
    return JSON.stringify({url: session.url});
}

export async function CreateCheckoutSessionWithId(priceId, quantity = 1, customer_id){
    const session = await stripe.checkout.sessions.create({
        customer: customer_id,
        payment_method_types: ['card'],
        line_items: [
            {
                price: priceId,
                quantity: quantity,
            },
        ],
        mode: 'subscription',
        success_url: `${window.location.origin}/worker/success?session_id={CHECKOUT_SESSION_ID}&priceId=${priceId}`,
        cancel_url: `${window.location.origin}/worker/pricing`,
    });
    return JSON.stringify({url: session.url});
}