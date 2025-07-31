import axios from "axios";



export const isSiteActive = async (url) => {
  if (!url) return false;

  const res = await axios.get(url).catch((err) => void err);
  if (!res || !res.status == 200) return false;
  return true;
};
