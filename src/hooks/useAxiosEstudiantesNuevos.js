import axios from "axios";
import { mostrarAlertaError } from "../helpers/alertasHelper";
import { urlConsultarEstudiantesNuevos ,apikey2} from "../helpers/serviciosUrl";

export const useAxiosEstudiantesNuevos = () => {

    const consultarDatosEstudiantesNuevos = async (nDocumento, fNacimiento) => {

        const url = `${urlConsultarEstudiantesNuevos.replace("[1]", nDocumento).replace("[2]", fNacimiento)}`
        const headers = {
            'apikey': apikey2
        };

        try {
            const { data } = await axios.get(url, { headers });
            //console.log(data);
            
            return data;
        } catch (error) {
            console.log(error);
            
            mostrarAlertaError('Ocurrio un fallo al consultar los datos  del estudiante');
        }

    }

    return {
        consultarDatosEstudiantesNuevos,
    }
}




