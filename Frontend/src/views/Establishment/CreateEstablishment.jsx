import React from "react";
import { postToApi } from "../../utils/functions/api";
import { useNavigate } from "react-router-dom";
import MultiStepForm from "../../components/MultiStepForm";

const CreateEstablishment = () => {
  const navigate = useNavigate();
  
  // Definir mensajes de validación
  const messages = {
    req: "Este campo es obligatorio",
    name: "El nombre debe tener más de 3 caracteres",
    description: "La descripción debe tener más de 10 caracteres",
    location: "La ubicación debe tener más de 5 caracteres",
    platforms: "Las plataformas deben tener más de 3 caracteres",
  };
  
  // Configuración de los pasos del formulario
  const formSteps = [
    {
      title: "Información Básica",
      description: "Ingresa el nombre y una descripción para tu plataforma.",
      fields: [
        {
          name: "name",
          label: "Nombre",
          type: "text",
          placeholder: "Ingrese el nombre",
          validation: {
            required: messages.req,
            minLength: { value: 3, message: messages.name }
          }
        },
        {
          name: "description",
          label: "Descripción",
          type: "text",
          placeholder: "Ingrese la descripción",
          validation: {
            required: messages.req,
            minLength: { value: 10, message: messages.description }
          }
        }
      ]
    },
    {
      title: "Ubicación",
      description: "Define la ubicación geográfica de la plataforma.",
      fields: [
        {
          name: "location",
          label: "Ubicación",
          type: "text",
          placeholder: "Ingrese la ubicación",
          validation: {
            required: messages.req,
            minLength: { value: 5, message: messages.location }
          }
        }
      ]
    },
    {
      title: "Plataformas Soportadas",
      description: "Indica las plataformas donde se puede utilizar (ej: Android, iOS, Web, etc).",
      fields: [
        {
          name: "platforms",
          label: "Plataformas",
          type: "text",
          placeholder: "Ingrese las plataformas soportadas",
          validation: {
            required: messages.req,
            minLength: { value: 3, message: messages.platforms }
          }
        }
      ]
    }
  ];
  
  // Valores por defecto del formulario
  const defaultValues = {
    name: "",
    description: "",
    location: "",
    platforms: ""
  };
  
  // Función para manejar el envío del formulario
  const handleSubmit = async (formData) => {
    console.log("Enviando datos:", formData);
    
    try {
      const response = await postToApi("establishments/create/", {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        platforms: formData.platforms,
      });

      console.log("Plataforma agregada exitosamente", response);
      
      // Opcional: redirigir después de crear la plataforma
      // setTimeout(() => navigate('/platforms'), 2000);
      
      return response;
    } catch (error) {
      console.error("Error al crear la plataforma:", error);
      throw error;
    }
  };
  
  return (
    <MultiStepForm
      steps={formSteps}
      title="Crear Nueva Plataforma"
      onSubmit={handleSubmit}
      defaultValues={defaultValues}
      messages={messages}
      successMessage="La plataforma ha sido creada correctamente."
      finishButtonText="Finalizar"
      submitButtonText="Crear Plataforma"
      backButtonText="Volver al formulario"
      stepLabels={["Información Básica", "Ubicación", "Plataformas"]}
    />
  );
};

export default CreateEstablishment;