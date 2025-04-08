import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button, TextField, Dialog } from "@radix-ui/themes";
import { LuBrainCircuit } from "react-icons/lu";
import { getFromApi } from "../utils/functions/api";

/**
 * MultiStepForm - Componente reutilizable para formularios de múltiples pasos
 * 
 * @param {Object} props
 * @param {Array} props.steps - Array de objetos con configuración de cada paso
 * @param {String} props.title - Título del formulario
 * @param {Function} props.onSubmit - Función a ejecutar al enviar el formulario
 * @param {Object} props.defaultValues - Valores por defecto del formulario
 * @param {Object} props.messages - Mensajes de error
 * @param {String} props.successMessage - Mensaje de éxito después de enviar el formulario
 * @param {String} props.finishButtonText - Texto del botón de finalizar (último paso)
 * @param {String} props.submitButtonText - Texto del botón de enviar (en el modal)
 * @param {String} props.backButtonText - Texto del botón de volver en el modal
 * @param {String} props.nextButtonText - Texto del botón de siguiente paso
 * @param {String} props.prevButtonText - Texto del botón de paso anterior
 * @param {Array} props.stepLabels - Etiquetas para la barra de progreso
 */
const MultiStepForm = ({
  steps,
  title,
  onSubmit,
  defaultValues = {},
  messages = {
    req: "Este campo es obligatorio"
  },
  successMessage = "Operación realizada con éxito",
  finishButtonText = "Finalizar",
  submitButtonText = "Confirmar",
  backButtonText = "Volver al formulario",
  nextButtonText = "Siguiente",
  prevButtonText = "Anterior",
  stepLabels = []
}) => {
  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [createSuccess, setCreateSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [range, setRange] = useState("");
  const [rec, setRec] = useState("");
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
    watch,
    setValue,
  } = useForm({
    mode: "onChange",
    defaultValues
  });
  
  // Observar todos los valores del formulario para mantenerlos actualizados
  const formValues = watch();

  // Total de pasos en el formulario
  const totalSteps = steps.length;

  // Función para ir al siguiente paso
  const nextStep = async (e) => {
    console.log(formValues)
    e.preventDefault();
    
    // Validar campos del paso actual antes de avanzar
    const fieldsToValidate = steps[step - 1].fields.map(field => field.name);
    const isValid = await trigger(fieldsToValidate);
    
    if (isValid) {
      setStep(current => Math.min(current + 1, totalSteps));
    }
  };

  // Función para ir al paso anterior
  const prevStep = (e) => {
    e.preventDefault();
    setStep(current => Math.max(current - 1, 1));
  };

  // Función para manejar el envío del formulario
  const handleFormSubmit = async (formData) => {
    try {
      await onSubmit(formData);
      setCreateSuccess(true);
      setShowModal(false);
    } catch (error) {
      console.error("Error al procesar el formulario:", error);
      setErrorMessage(
        error.message || "Error al procesar la solicitud. Por favor, inténtelo de nuevo más tarde."
      );
    }
  };

  // Función para mostrar el modal con validación previa
  const handleFinalize = async (e) => {
    e.preventDefault();
    const fieldsToValidate = steps[step - 1].fields.map(field => field.name);
    const isValid = await trigger(fieldsToValidate);
    
    if (isValid) {
      setShowModal(true);
    }
  };

  const handleStartingRequest = async () => {
    console.log(formValues)
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
      
      return `${year}-${month}-${day}`;
    }
    let end_date = sumarMinutos(formValues['starting_date'], formValues['duration'])
    getFromApi(`auctions/price-recomendation/${end_date}/889103/`)
            .then((response) => response.json())
            .then((data) => {
              console.log(data);
              setRange(data['rango']);
              setRec(data['optimo'])})

  }

  // Renderizar el resumen para el modal
  const renderSummary = () => {
    const values = getValues();
    
    // Agrupar todos los campos de todos los pasos
    const allFields = steps.flatMap(step => step.fields);
    
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumen de información</h3>
        <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
          {allFields.map(field => (
            <React.Fragment key={field.name}>
              <div className="text-gray-600 font-medium">{field.label}:</div>
              <div>{values[field.name]}</div>
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-end space-x-3 mt-4">
          <Button 
            type="button" 
            onClick={() => setShowModal(false)}
            className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-200/50 transition-all duration-300 ease-in-out rounded-md font-medium"
          >
            {backButtonText}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit(handleFormSubmit)}
            className="px-4 py-2 bg-green-500 text-white hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-500/50 transition-all duration-300 ease-in-out rounded-md font-medium"
          >
            {submitButtonText}
          </Button>
        </div>
      </div>
    );
  };

  // Renderizar el formulario según el paso actual
  const renderStep = () => {
    const currentStep = steps[step - 1];
    
    return (
      <>
        <h3 className="mb-4 text-xl font-medium text-gray-700">{currentStep.title}</h3>
        <p className="mb-4 text-l font-small text-gray-500">{currentStep.description}</p>
        {currentStep.fields.map(field => (
          <div>
          {field.type === 'ia' ? (
            <div>
            {range === "" ? (
              <div className="flex flex-row w-full max-w-md mx-auto">
                <button
                  type="button"
                  onClick= {() => handleStartingRequest()}
                  className="bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-cyan-400"
                >
                <LuBrainCircuit /> 
                </button> 
                <p className="ml-3 pt-1">Generar recomendacion con IA</p>
              </div>
            ) : (
              <div className="flex flex-col w-full max-w-xs mx-auto gap-4">
                <div className="bg-cyan-500 p-4 text-white font-bold rounded-t-lg">
                  Rango recomendado: {range}
                </div>
                <div className="bg-green-400 p-4 text-white font-bold rounded-b-lg">
                  Valor óptimo {rec}
                </div>
              </div>
            )}
            </div>

          ) : (
          <div>
            <div key={field.name} className="flex flex-col space-y-2 w-full mb-4">
              <label htmlFor={field.name} className="text-sm font-medium text-gray-800">
                {field.label}
              </label>
              
              {field.type === 'select' ? (
                <select
                  {...register(field.name, field.validation)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formValues[field.name] || ''}
                  onChange={(e) => setValue(field.name, e.target.value, { shouldValidate: true })}
                >
                  <option value="">Seleccione...</option>
                  {field.options?.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <TextField.Input
                  {...register(field.name, field.validation)}
                  type={field.type || "text"}
                  min={field.min}
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formValues[field.name] || ''}
                  onChange={(e) => setValue(field.name, e.target.value, { shouldValidate: true })}
                />
              )}
              
              {errors[field.name] && (
                <p className="text-red-600 text-sm mt-1 pl-1">
                  {errors[field.name].message}
                </p>
              )}
            </div>
          </div>)}</div>
        )
        
        )}
      </>
    );
  };

  // Renderizar indicador de progreso
  const renderProgress = () => {
    return (
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div 
              key={index} 
              className={`flex items-center justify-center w-8 h-8 rounded-full border 
                ${step > index + 1 ? 'bg-cyan-500 text-white border-cyan-600' : 
                  step === index + 1 ? 'bg-cyan-100 border-cyan-500 text-cyan-700' : 
                  'bg-gray-100 border-gray-300 text-gray-500'}`}
            >
              {step > index + 1 ? '✓' : index + 1}
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full">
          <div 
            className="bg-cyan-500 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${(step / totalSteps) * 100}%` }}
          ></div>
        </div>
        {stepLabels.length > 0 && (
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            {stepLabels.map((label, index) => (
              <span key={index}>{label}</span>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-xl mx-auto">
      {createSuccess && (
        <div role="alert" className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Éxito! </strong>
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}
      
      {errorMessage && (
        <div role="alert" className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{errorMessage}</span>
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="mb-6 text-cyan-500 font-bold text-4xl text-center">
          {title}
        </h2>
        
        {renderProgress()}
        
        <form className="flex flex-col gap-3">
          {renderStep()}
          
          <div className="flex justify-between mt-6">
            {step > 1 ? (
              <Button 
                type="button" 
                onClick={prevStep}
                className="px-6 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-200/50 transition-all duration-300 ease-in-out rounded-md font-medium"
              >
                {prevButtonText}
              </Button>
            ) : (
              <div></div>
            )}
            
            {step < totalSteps ? (
              <Button 
                type="button" 
                onClick={nextStep}
                className="px-6 py-2 bg-cyan-500 text-white hover:bg-cyan-600 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 transition-all duration-300 ease-in-out rounded-md font-medium"
              >
                {nextButtonText}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleFinalize}
                className="px-6 py-2 bg-cyan-500 text-white hover:bg-cyan-600 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 transition-all duration-300 ease-in-out rounded-md font-medium"
              >
                {finishButtonText}
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Modal para mostrar el resumen */}
      <Dialog.Root open={showModal} onOpenChange={setShowModal}>
        <Dialog.Content className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-auto overflow-hidden">
            {renderSummary()}
          </div>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
};

export default MultiStepForm;