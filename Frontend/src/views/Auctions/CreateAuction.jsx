import React, {useEffect} from "react";
import { postToApi } from "../../utils/functions/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import MultiStepForm from "../../components/MultiStepForm";


const CreateAuction = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [serviceId, setServiceId] = React.useState(null);
  let counter = 0;
  useEffect(() => {
      if (counter > 0) return;
      counter++;
      setServiceId(searchParams.get('serviceId'));
  }, []);
  // Definir mensajes de validación
  const messages = {
    req: "Este campo es obligatorio",
    name: "El nombre del servicio debe tener más de 5 caracteres",
    description: "La descripción debe tener más de 10 caracteres",
  };
  
  // Configuración de los pasos del formulario
  const formSteps = [
    {
      title: "Duración",
      description: "Establece una hora de inicio y la duración de la subasta.",
      fields: [
        {
          name: "starting_date",
          label: "Fecha de inicio",
          type: "datetime-local",
          placeholder: "Ingrese el nombre del servicio",
          validation: {
            required: messages.req,
            minLength: { value: 5, message: messages.name }
          }
        },
        {
          name: "duration",
          label: "Duración",
          type: "number",
          min: "1",
          placeholder: "Ingrese la duración de la subasta",
          validation: {
            required: messages.req,
            minLength: { value: 1, message: messages.duration }
          }
        }
      ]
    },
    {
      title: "Puja Inicial",
      description: "Define una puja inicial mínima para la subasta.",
      fields: [
        {
          name: "recomendacion",
          label: "puja",
          type: "ia",
        },
        {
          name: "starting_bid",
          label: "Puja inicial",
          type: "number",
          min: "0",
          placeholder: "Ingrese la puja inicial de la subasta",
          validation: {
            required: messages.req,
            minLength: { value: 0, message: "La cantidad debe tener ser positiva" }
          }
        }
      ]
    },
    {
      title: "Tiempo de Control",
      description: "Define durante cuanto tiempo se dará acceso al servicio al cliente ganador", 
      fields: [
        {
          name: "time_frame",
          label: "Tiempo de control",
          type: "number",
          min: "1",
          placeholder: "Ingrese el tiempo de control",
          validation: {
            required: messages.req,
            min: { value: 1, message: "Debe permitir al menos 1 minuto de control" }
          }
        }
      ]
    }
  ];
  
  // Valores por defecto del formulario
  const defaultValues = {
    starting_date: "",
    duration: "",
    starting_bid: "",
    time_frame: ""
  };
  
  // Función para manejar el envío del formulario
  const handleSubmit = async (formData) => {
    function sumarMinutos(fechaStr, duracion) {
      // Asegurarse de que la duración sea tratada como número
      const minutos = parseInt(duracion, 10);
      
      // Crear un objeto Date a partir del string de fecha
      const fecha = new Date(fechaStr);
      
      // Verificar que la fecha sea válida
      if (isNaN(fecha.getTime())) {
        console.error("Fecha inválida:", fechaStr);
        return null;
      }
      
      // Sumar los minutos
      fecha.setMinutes(fecha.getMinutes() + minutos);
      
      // Formatear la fecha de vuelta al formato original YYYY-MM-DDTHH:MM
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, '0');
      const day = String(fecha.getDate()).padStart(2, '0');
      const hours = String(fecha.getHours()).padStart(2, '0');
      const minutes = String(fecha.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    let end_date = sumarMinutos(formData.starting_date, formData.duration)
    console.log("Enviando datos:", formData, end_date);
    try {
        const response = await postToApi("auctions/create/", {
        starting_date: formData.starting_date,
        end_date: end_date,
        duration: formData.duration,
        starting_bid: formData.starting_bid,
        time_frame: formData.time_frame,
        service: serviceId,
        });

        console.log("Subasta agregado exitosamente", response);
        navigate(`/worker/services/${serviceId}`);        
    }catch (error) {
        console.error("Error en el submit:", error);
        setErrorMessage(
        "Error de red o del servidor. Por favor, inténtelo de nuevo más tarde."
        );
    }
  };
  
  return (
    <MultiStepForm
      steps={formSteps}
      title="Iniciar subasta"
      onSubmit={handleSubmit}
      defaultValues={defaultValues}
      messages={messages}
      successMessage="La subasta ha sido creado correctamente."
      finishButtonText="Finalizar"
      submitButtonText="Crear subasta"
      backButtonText="Volver al formulario"
      stepLabels={["Duración", "Puja Inicial", "Tiempo de Control"]}
    />
  );
};

export default CreateAuction;