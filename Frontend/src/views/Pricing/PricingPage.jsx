import React, { useEffect, useState } from 'react';
import { GetPricingPlans } from '../../utils/functions/stripe';
import PricingButton from '../../components/Pricing/PricingButton';


function PricingPage() {
  
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await GetPricingPlans();
        setPlans(response.data.filter(plan => plan.default_price.id !== "price_1RVCT8PB8XNLsDsu66gFfTAH").slice(0, 2));
      } catch (error) {
        console.error("Error fetching pricing plans:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlans();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-200 text-white py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-cyan-500 text-white text-sm font-medium mb-6">
            Precios y Planes
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-cyan-500 bg-gradient-to-r from-cyan-300 to-cyan-500">
            Planes de suscripción
          </h1>
          <p className="max-w-2xl mx-auto text-gray-800 text-lg">
            Selecciona el plan que mejor se adapte a tus necesidades y comienza a disfrutar de todos nuestros servicios
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 rounded-full border-4 border-cyan-400/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin"></div>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8 mt-12">
            {[...plans].reverse().map((plan, index) => (
              <div 
                key={plan.id} 
                className={"relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:shadow-xl border-cyan-400 bg-gray-100 shadow-lg shadow-cyan-400/15"}
              >
                {index === 0 && (
                  <div className="absolute top-0 right-6 transform -translate-y-1/2">
                    <div className="flex items-center gap-1 mt-16 py-1.5 px-4 bg-gradient-to-r from-cyan-400 to-cyan-500 text-white rounded-full text-xs font-semibold uppercase tracking-wide">
                      <svg className="w-3.5 h-3.5 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L15 9L22 10L17 15L18 22L12 19L6 22L7 15L2 10L9 9L12 2Z" />
                      </svg>
                      <span>Más popular</span>
                    </div>
                  </div>
                )}
                
                <div className="p-8">
                  <h3 className="text-xl text-gray-800 font-bold mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl text-gray-800 font-bold">${(plan.default_price.unit_amount/100).toFixed(2)}</span>
                    <span className="text-gray-700 ml-2">/mes</span>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features && plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-cyan-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 6L9 17L4 12" />
                        </svg>
                        <span className="text-gray-700">
                          {typeof feature === 'string' 
                            ? feature 
                            : feature.name || JSON.stringify(feature)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  {plan.default_price.id === "price_1RJh6rPB8XNLsDsuwf3RxkTk" ?(
                    <></>
                    ):(
                    <PricingButton subscription_plan={plan.name} priceId={plan.default_price.id}/>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PricingPage;