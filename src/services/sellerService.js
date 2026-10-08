import api from "./api";

export const getSellerProfile = async () => {
  const response = await api.get("/sellers/profile");
  return response.data;
};

export const createSellerProfile = async (profileData) => {
  const response = await api.post("/sellers/profile", profileData);
  return response.data;
};

export const updateSellerProfile = async (profileData) => {
  const response = await api.put("/sellers/profile", profileData);
  return response.data;
};