/* eslint-disable no-undef */

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export function getFromApi(url) {
  return fetch(`${BASE_URL}/${url}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${JSON.parse(localStorage.getItem('authTokens'))?.access}`,
    },
  });
}

export async function postToApi(url, data) {
  const response = await fetch(`${BASE_URL}/${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${JSON.parse(localStorage.getItem('authTokens'))?.access}`,
    },
    body: JSON.stringify(data),
  });
  const result = await response.json().catch();
  
  if (!response.ok) {
    throw { status: response.status, message: result.error || "Error desconocido" };
  }
  
  return result;
}

export function postFormToApi(url, formData) {
  return fetch(`${BASE_URL}/${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${JSON.parse(localStorage.getItem('authTokens'))?.access}`,
    },
    body: formData,
  });
}

export function postToApiRegister(url, data) {
  return fetch(`${BASE_URL}/${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export function putToApi(url, data) {
  return fetch(`${BASE_URL}/${url}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${JSON.parse(localStorage.getItem('authTokens'))?.access}`,
    },
    body: JSON.stringify(data),
  });
}

export function deleteFromApi(url) {
  return fetch(`${BASE_URL}/${url}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${JSON.parse(localStorage.getItem('authTokens'))?.access}`,
    },
  });
}