import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { postToApi } from "../../utils/functions/api";
import { FormContainer } from "../../components/Form";
import { Button, TextField, TextFieldInput, TextArea } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom"; // Importar useNavigate

const CreateService= () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [createSuccess, setCreateSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate(); 

  const onSubmit = async (formData) => {
    try {
        console.log("Datos a enviar:", {
            name: formData.name,
            description: formData.description,
            category: formData.category,
            price: parseInt(formData.price),
            max_reservation: parseInt(formData.max_reservation),
            deposit: parseInt(formData.deposit),
            });
      const response = await postToApi("services/create/",{
        name: formData.name,
        description: formData.description,
        category: formData.category,
        reservable: false,
        price: parseInt(formData.price),
        max_reservation: parseInt(formData.max_reservation),
        deposit: parseInt(formData.deposit),
        establishment: 12,
      });

      console.log(response)
      console.log("Máquina agregada exitosamente");
      setCreateSuccess(true);


    } catch (error) {
        setErrorMessage(
          "Error de red o del servidor. Por favor, inténtelo de nuevo más tarde.",
        );
      }
    };

    const messages = {
        req: "Este campo es obligatorio",
        name: "El nombre de la máquina debe tener más de 5 caracteres",
        brand: "La marca debe tener más de 3 caracteres",
        serialNumber: "El número de serie debe ser único por gimnasio",
        description: "La descripción debe tener más de 10 caracteres",
        muscularGroup: "El grupo muscular debe ser especificado",
      };

    return (
        <div className="max-w-xl mx-auto">
          {createSuccess && (
            <FormContainer role="alert">
              <strong className="font-bold">Éxito!</strong>
              <span className="block sm:inline">
                {" "}
                El servicio ha sido creada correctamente.
              </span>
              <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
                <svg
                  className="fill-current h-6 w-6 text-blue-300"
                  role="button"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <title>Close</title>
                  <path d="M14.354 5.354a2 2 0 00-2.828 0L10 7.172 7.172 5.354a2 2 0 10-2.828 2.828L7.172 10l-2.828 2.828a2 2 0 102.828 2.828L10 12.828l2.828 2.828a2 2 0 102.828-2.828L12.828 10l2.828-2.828a2 2 0 000-2.828z" />
                </svg>
              </span>
            </FormContainer>
          )}
          <FormContainer>
            <h2 className="mb-6 text-blue-300 font-bold text-4xl text-center">
              Agregar servicio
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
    
            <div className="flex flex-col space-y-2 w-full">
                <label 
                    htmlFor="name" 
                    className="text-sm font-medium text-gray-800"
                >
                    Nombre del Servicio
                </label>
                <TextField.Input
                    {...register("name", {
                    required: messages.req,
                    minLength: { value: 5, message: messages.name },
                    })}
                    name="name"
                    type="text"
                    className="
                    w-full 
      px-3 
      py-2 
      border 
      border-gray-300 
      rounded-md 
      bg-white 
      text-gray-800
      focus:outline-none 
      focus:border-cyan-500 
      focus:ring-4 
      focus:ring-cyan-500/30
      transition-all 
      duration-300 
      ease-in-out
                    "
                    placeholder="Ingrese el nombre del servicio"
                />
                {errors.name && (
                    <p className="
                    text-red-600 
                    text-sm 
                    mt-1 
                    pl-1
                    ">
                    {errors.name.message}
                    </p>
                )}
            </div>
    
              {/* <div className="flex flex-col space-y-2 w-full">
                <label htmlFor="image" className="mr-3">
                  Imagen
                </label>
                <input
                  {...register("image", {required: messages.req})}
                  type="file"
                  onChange={(e) => setImage(URL.createObjectURL(e.target.files[0]))}
                />
                {(image && (
                  <span className="size-36 rounded-xl border-2 border-radixgreen overflow-hidden mt-2">
                    <img src={image} />
                  </span>
                )) || (
                  <EquipmentImage
                    equipment={{}}
                    className="size-36 rounded-xl border-2 border-radixgreen mt-2"
                  />
                )}
                {errors.image && (
                  <p className="text-red-500">{errors.image.message}</p>
                )}
              </div> */}
    
              <div className="flex flex-col space-y-2 w-full">
                <label htmlFor="description" className="text-sm font-medium text-gray-800">
                  Descripción
                </label>
                <TextField.Input
                  {...register("description", {
                    required: messages.req,
                    minLength: { value: 10, message: messages.description },
                  })}
                  name="description"
                  rows="4"
                  className="
                    w-full 
                    px-3 
                    py-2 
                    border 
                    border-gray-300 
                    rounded-md 
                    bg-white 
                    text-gray-800
                    focus:outline-none 
                    focus:border-cyan-500 
                    focus:ring-4 
                    focus:ring-cyan-500/30
                    transition-all 
                    duration-300 
                    ease-in-out
                    "
                    placeholder="Ingrese la descripción del servicio"
                />
                {errors.name && (
                    <p className="
                    text-red-600 
                    text-sm 
                    mt-1 
                    pl-1
                    ">
                    {errors.name.message}
                    </p>
                )}
              </div>

              <div className="flex flex-col space-y-2 w-full">
                <label htmlFor="category" className="mr-3">
                  Categoría
                </label>
                <TextField.Input
                  {...register("category", {
                    required: messages.req,
                    minLength: { value: 5, message: messages.name },
                  })}
                  name="category"
                  type="text"
                  className="
                    w-full 
                    px-3 
                    py-2 
                    border 
                    border-gray-300 
                    rounded-md 
                    bg-white 
                    text-gray-800
                    focus:outline-none 
                    focus:border-cyan-500 
                    focus:ring-4 
                    focus:ring-cyan-500/30
                    transition-all 
                    duration-300 
                    ease-in-out
                    "
                    placeholder="Ingrese la categoría del servicio"
                />
                {errors.name && (
                  <p className="text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="flex flex-col space-y-2 w-full">
                <label htmlFor="price" className="mr-3">
                  Precio
                </label>
                <TextField.Input
                  {...register("price", {
                    required: messages.req,
                    min: { value: 0, message: "Debe ser mayor o igual a 0" },
                  })}
                  name="price"
                  type="number"
                  min="0"
                  className="
                    w-full 
                    px-3 
                    py-2 
                    border 
                    border-gray-300 
                    rounded-md 
                    bg-white 
                    text-gray-800
                    focus:outline-none 
                    focus:border-cyan-500 
                    focus:ring-4 
                    focus:ring-cyan-500/30
                    transition-all 
                    duration-300 
                    ease-in-out
                    "
                    placeholder="Ingrese el precio del servicio"
                />
                {errors.name && (
                  <p className="text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="flex flex-col space-y-2 w-full">
                <label htmlFor="max_reservation" className="mr-3">
                  Duración
                </label>
                <TextField.Input
                  {...register("max_reservation", {
                    required: messages.req,
                    min: { value: 0, message: "Debe ser mayor o igual a 0" },
                  })}
                  name="max_reservation"
                  type="number"
                  min="0"
                  className="
                    w-full 
                    px-3 
                    py-2 
                    border 
                    border-gray-300 
                    rounded-md 
                    bg-white 
                    text-gray-800
                    focus:outline-none 
                    focus:border-cyan-500 
                    focus:ring-4 
                    focus:ring-cyan-500/30
                    transition-all 
                    duration-300 
                    ease-in-out
                    "
                    placeholder="Ingrese la duración de la reserva"
                />
                {errors.name && (
                  <p className="text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="flex flex-col space-y-2 w-full">
                <label htmlFor="deposit" className="mr-3">
                  Fianza a pagar de antemano
                </label>
                <TextField.Input
                  {...register("deposit", {
                    required: messages.req,
                    min: { value: 0, message: "Debe ser mayor o igual a 0" },
                  })}
                  name="deposit"
                  type="number"
                  min="0"
                  className="
                    w-full 
                    px-3 
                    py-2 
                    border 
                    border-gray-300 
                    rounded-md 
                    bg-white 
                    text-gray-800
                    focus:outline-none 
                    focus:border-cyan-500 
                    focus:ring-4 
                    focus:ring-cyan-500/30
                    transition-all 
                    duration-300 
                    ease-in-out
                    "
                    placeholder="Ingrese la fianza a pagar de antemano por los clientes"
                />
                {errors.name && (
                  <p className="text-red-500">{errors.name.message}</p>
                )}
              </div>
              <Button
            type="submit"
            className="
            w-full 
            py-3 
            bg-cyan-500 
            text-white 
            hover:bg-cyan-600 
            focus:outline-none 
            focus:ring-4 
            focus:ring-cyan-500/50 
            transition-all 
            duration-300 
            ease-in-out 
            rounded-md 
            font-semibold 
            uppercase 
            tracking-wider
        "
          >
            Agregar servicio
          </Button>
        </form>
      </FormContainer>
    </div>
  );
};

export default CreateService;