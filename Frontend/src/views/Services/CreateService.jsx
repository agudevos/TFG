import React, { useContext, useState } from "react";
import { postToApi } from "../../utils/functions/api";
import { useNavigate } from "react-router-dom";
import MultiStepForm from "../../components/MultiStepForm";
import EstablishmentContext from "../../utils/context/EstablishmentContext";

const CreateService = () => {
  const navigate = useNavigate();
  const {selectedEstablishment } = useContext(EstablishmentContext);
  
  // Definir mensajes de validación
  const messages = {
    req: "Este campo es obligatorio",
    name: "El nombre del servicio debe tener más de 5 caracteres",
    description: "La descripción debe tener más de 10 caracteres",
  };
  
  // Configuración de los pasos del formulario
  const formSteps = [
    {
      title: "Información Básica",
      description: "Ponle un nombre a tu servicio y dale una descripción llamativa.",
      fields: [
        {
          name: "name",
          label: "Nombre del Servicio",
          type: "text",
          placeholder: "Ingrese el nombre del servicio",
          validation: {
            required: messages.req,
            minLength: { value: 5, message: messages.name }
          }
        },
        {
          name: "description",
          label: "Descripción",
          type: "text",
          placeholder: "Ingrese la descripción del servicio",
          validation: {
            required: messages.req,
            minLength: { value: 10, message: messages.description }
          }
        }
      ]
    },
    {
      title: "Datos Adicionales",
      description: "Incluye restricciones como la duración máxima de la reserva y una fianza a modo de seguro de reserva.(Opcional)", 
      fields: [
        {
          name: "max_reservation",
          label: "Máxima Duración de Reserva",
          type: "number",
          min: "1",
          placeholder: "Ingrese el tiempo máximo de reserva",
          validation: {
            required: messages.req,
            min: { value: 1, message: "Debe permitir al menos 1 reserva" }
          }
        },
        {
          name: "max_people",
          label: "Número Máximo de Personas",
          type: "number",
          min: "1",
          placeholder: "Ingrese el número máximo de personas",
          validation: {
            required: messages.req,
            min: { value: 1, message: "Debe permitir al menos 1 persona" }
          }
        },
        {
          name: "deposit",
          label: "Fianza",
          type: "number",
          min: "0",
          placeholder: "Ingrese la fianza a pagar",
          validation: {
            required: messages.req,
            min: { value: 0, message: "Debe ser mayor o igual a 0" }
          }
        }
      ]
    }
  ];
  
  // Valores por defecto del formulario
  const defaultValues = {
    name: "",
    description: "",
    category: "",
    max_reservation: "",
    max_people: "",
    deposit: ""
  };
  
  // Función para manejar el envío del formulario
  const handleSubmit = async (formData) => {
    console.log("Enviando datos:", formData);
    
    const response = await postToApi("services/create/", {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      max_reservation: parseInt(formData.max_reservation),
      max_people: parseInt(formData.max_people),
      deposit: parseInt(formData.deposit),
      establishment: selectedEstablishment.id,
    });

    console.log("Servicio agregado exitosamente", response);
    
    setTimeout(() => navigate('/worker/my-services'), 2000);
    
    return response;
  };
  
  return (
    <MultiStepForm
      steps={formSteps}
      title="Agregar servicio"
      onSubmit={handleSubmit}
      defaultValues={defaultValues}
      messages={messages}
      successMessage="El servicio ha sido creado correctamente."
      finishButtonText="Finalizar"
      submitButtonText="Crear Servicio"
      backButtonText="Volver al formulario"
      stepLabels={["Información Básica", "Restricciones"]}
    />
  );
};

export default CreateService;