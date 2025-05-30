import { Button } from '@radix-ui/themes';
import { CreateCheckoutFreeSession, CreateCheckoutSessionWithId } from '../../utils/functions/stripe';
import EstablishmentContext from '../../utils/context/EstablishmentContext';
import Stripe from 'stripe';
import { useContext } from 'react';

const STRIPE_SECRET_KEY = import.meta.env.VITE_STRIPE_SECRET_KEY;

const stripe = new Stripe(STRIPE_SECRET_KEY);

function PricingButton({subscription_plan,priceId}) {
  const { selectedEstablishment } = useContext(EstablishmentContext);
  let active_plan = "Free";

  async function handleCancel() {
    const customer = await stripe.customers.retrieve(selectedEstablishment.customer_id, {
      expand: ["subscriptions"],
    });
    console.log(customer.subscriptions);
    if (customer.subscriptions.data.length === 0) {
      setError("No tienes suscripciones activas.");
      return;
    }
      const premium_subscription = customer.subscriptions.data.find(
        (subscription) => subscription.items.data[0].price.id === "price_1Ow67AHg56faYu5eTccV66kL"
      );
      const premium_subscription_id = premium_subscription.id;
      await stripe.subscriptions.cancel(premium_subscription_id);

      await putToApi(`establishments/${selectedEstablishment.id}/update/`, { subscription: "free" });
  }

  async function handleUpgrade() {
    console.log(selectedEstablishment)
    if (selectedEstablishment.customer_id) {
      CreateCheckoutSessionWithId(priceId, selectedEstablishment.customer_id).then((session) => {
        window.location.href = JSON.parse(session).url;
      });
    } else {
      CreateCheckoutFreeSession(priceId).then((session) => {
        window.location.href = JSON.parse(session).url;
      });
    }
  }
  if (selectedEstablishment.subscription==="premium")
    active_plan = "Premium";

  return (
    <div className='mt-4 mb-4'>
      {subscription_plan===active_plan ? (
        <Button type="button" size="3" className="w-full" onClick={() => handleCancel()}>Cancelar suscripción</Button>
      ):(
        <Button type="button" size="3" className="w-full" onClick={() => handleUpgrade()}>Mejorar plan</Button>
      )}
    </div>
  )
}

export default PricingButton