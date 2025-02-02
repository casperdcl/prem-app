import type { AxiosResponse } from "axios";
import api from "shared/api/v1";

import type { Service } from "../types";

const getServices = async (): Promise<AxiosResponse<Service[]>> => api().get("v1/services/");

export default getServices;
