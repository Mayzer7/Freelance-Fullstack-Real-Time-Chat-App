import { axiosInstance } from "../lib/axios";

export const getBalance = async () => {
  const response = await axiosInstance.get("/balance");
  return response.data;
};

export const updateBalance = async (amount) => {
  const response = await axiosInstance.post("/balance/update", { amount });
  return response.data;
}; 