import { useState } from "react"
import { mostrarAlertaError, mostrarAlertaExito } from "../helpers/alertasHelper";
import axios from "axios";
import { urlObtenerRecibosPendientes, urlRutaBaseRecibosPendientes, apikey, apikey2, urlGenearIdPSE } from "../helpers/serviciosUrl";

const rutaBasePdf = urlRutaBaseRecibosPendientes;//'https://www.uniminuto.edu/pecuniariosqa';
export const useAxiosReciboPendientes = (/*userData*/) => {

    const [recibos, setRecibos] = useState([])

    const rellenarCeros = (numero) => {
        //console.log({idCeros:numero.padStart(10, '0')});
        return numero.padStart(10, '0');
    }


    const consultarRecibosPendientes = async (userData) => {
        const dataContract = {
            ObtenerRecibosPendientes: {
                //idEstudiante: idUser
                idEstudiante : (userData.UidEstudiante.length === 10)? userData.UidEstudiante : rellenarCeros(userData.UidEstudiante)
            }
        };

        const url = urlObtenerRecibosPendientes;//'https://uniminuto.test.digibee.io/pipeline/uniminuto/v1/servicios-banner/obtenerRecibosPendientes';
        const headers = {
            'apikey': apikey,//'5H9CcvkLZJTgPDDCXTXTI7KC90k6prl0',
            'Content-Type': 'application/json',
        };

        try {
            const { data } = await axios.post(url, dataContract, { headers });
            //console.log({ data });
            const { T_PAGOS } = data.body;
            const { codigo } = data.resultado;
            //console.log(T_PAGOS.length);

            if (codigo === '200' && T_PAGOS.length === 0) {
                mostrarAlertaExito('No tienes recibos pendientes');
                //setCargando(false);
                return [];
            }

            const recibosPromises = T_PAGOS.map(async (pago) => {
                const partes = pago.RUTA.split("/");
                const ultimaParte = `${rutaBasePdf}/${partes[partes.length - 1]}`;
                const nombrePdf = `${partes[partes.length - 1]}`;
                const valor = pago.VALOR1.trim().replace(/\./g, '').split(',')[0];
                const materiales = pago.T_MATERIALES
                const idPSE = await obtenerIdPSE(valor, pago.FACTURA, userData);//llamo a la funcion de obtener idPSE
                return { RUTA: ultimaParte, FACTURA: pago.FACTURA, NOMBREPDF: nombrePdf, VALOR1: valor, IDPSE: idPSE, MATERIALES:materiales };
            });

            const recibos = await Promise.all(recibosPromises);
            setRecibos(recibos);

            //setCargando(false);
            return recibos;

        } catch (error) {
            console.log({ error });
            mostrarAlertaError("Ocurrio un fallo al obtener los recibos");
            //setCargando(false);
        }
    };


    const obtenerIdPSE = async (IdImporte, PeriodoId, datosEstudiante) => {

        //se agrega condicion para que cuando no venga un valor de recibo no ejecute el servicio de consultarIdPagoPse
        if(IdImporte.trim()===""){
            return "";
        }

        const dataContract = {
            Estudiante: {
                valorTotal: IdImporte.replace(/\./g, ''),// elimino los puntos del importe"4094290",
                valorIva: "0",
                recibo_pago: PeriodoId,//"0057128637",
                descripcion_pago: "Pago de matrícula Uniminuto",
                email: datosEstudiante.EmailInstitucional,//"dpinzono@uniminuto.edu.co",
                idEstudiante: datosEstudiante.UidEstudiante,//"000065646",
                nombres: datosEstudiante.Nombre, //"DIANA PILAR",
                apellidos: datosEstudiante.Apellido,//"PINZON ORJUELA",
                telefono: datosEstudiante.TelefonoMovil//"3154372348"
            }
        }

        const url = urlGenearIdPSE;//'https://uniminuto.test.digibee.io/pipeline/uniminuto/v1/pasarelas-pago/linkPagoZonaPagos';
        const headers = {
            'apikey': apikey2,//'uxpWFePgheXvuP9Tun8TYxvjb0FgeSLH',
            'Content-Type': 'application/json',
            'SOAPAction': 'ZonaPagosPSE'
        };
        try {

            const { data } = await axios.post(url, dataContract, { headers });
            const { inicio_pagoV2Result } = data.inicio_pagoV2Response;
            //  console.log("PSE", { inicio_pagoV2Result });
            // return {
            //    idPse:inicio_pagoV2Result
            // }
            return inicio_pagoV2Result;

        } catch (error) {
            console.log({ error });
            mostrarAlertaError("Ocurrio un fallo al generar el id de PSE");
            return null;
        }
    }

    return {
        recibos,
        consultarRecibosPendientes,
        obtenerIdPSE
    }
}
