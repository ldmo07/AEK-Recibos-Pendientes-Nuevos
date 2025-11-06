import React, { useState } from "react";
import { useAxiosReciboPendientes } from "../../hooks/useAxiosReciboPendientes";
import { useAxiosDatosPersonales } from "../../hooks/useAxiosDatosPersonales";
import { urlPagoPSE } from "../../helpers/serviciosUrl";
import { mostrarAlertaError, mostrarAlertaConfirmacionSinCancelar } from "../../helpers/alertasHelper";
import { useAxiosEstudiantesNuevos } from "../../hooks/useAxiosEstudiantesNuevos";

//DEFINO LOS ESTILOS
const estiloFuentes = {
  fontFamily: 'Helvetica',
  fontSize: '12px'
};

const estiloBadges = {
  backgroundColor: '#779B00',//'#2C3A49',
  color: 'white',
  marginRight: '5px',
  padding: '5px 10px',
  borderRadius: '5px',
  display: 'inline-block'
};

const estiloBase = {
  backgroundColor: '#151b60',//'#2C3A49'
}

const estiloHover = {
  backgroundColor: '#4F6175',
  color: 'white'
}

export default Screen = () => {

  //Manejara el estado para ver si se hizo hover sobre un elemento
  const [isHovered, setIsHovered] = useState(false);
  const [isHoveredPse, setIsHoveredPse] = useState(false);


  const { consultarDatosEstudiantesNuevos } = useAxiosEstudiantesNuevos(); // consulta la informacion para saber si el estudiante es nuevo o es antiguo
  const [nDocEstudianteNuevo, setNdocEstudianteNuevo] = useState(''); // almacena el state del numero de documento del estudiante nuevo
  const [fNacimientoEstudianteNuevo, setFnacimientoEstudianteNuevo] = useState(''); // almacena el state de la fecha de nacimiento del estudiante nuevo
  const [mostrarDivCargando, setMostrarDivCargando] = useState(false); //state que indica si se deve mostrar o no el div de cargando
  const { consultarDatos } = useAxiosDatosPersonales(); // objeto que almacena la informacion del usuario
  const { recibos, consultarRecibosPendientes } = useAxiosReciboPendientes();
  const [ejecutoConsultaRecibos, setEjecutoConsultaRecibos] = useState(false);


  //consulta si el estudiante es nuevo o antiguo o si no existe ese estudiante
  const handleConsultarInformacionEstudiantesNuevos = async (e) => {
    e.preventDefault();

    try {
      setMostrarDivCargando(true);
      const { id, msg, mail, status } = await consultarDatosEstudiantesNuevos(nDocEstudianteNuevo, fNacimientoEstudianteNuevo);
      if (status == 2) {

        // consulto los datos personales del estudiante
        const dataPersonal = await consultarDatos(/*"000892839"*/id);

        // consulto los programas inscritos del estudiante
        const recibosPendientes = await consultarRecibosPendientes(dataPersonal);
        setEjecutoConsultaRecibos(true);

      } else if (status == 1) {

        const res = await mostrarAlertaConfirmacionSinCancelar("Estimado usuario, por favor ingrese con el perfil Estudiante Antiguo, mediante correo institucional",
          "Dar clic Aquí");
        if (res.isConfirmed === true) {
          window.open('https://uniminuto-sandbox.campusm.exlibrisgroup.com/campusm/home#select-profile')
        }

      } else if (status == 0) {
        mostrarAlertaError("No se encontró información asociada a este usuario. Por favor, verifique que los datos ingresados sean correctos.");
      }
      setMostrarDivCargando(false)
    } catch (error) {
      setMostrarDivCargando(false)
      mostrarAlertaError("Ocurrio un fallo al consultar la info del estudiante nuevo");
    }
  }

  return (
    <>
      <link href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css" rel="stylesheet" />

      <div className="m-2">

        <div className="flex items-center mt-2">
          <label style={estiloBadges} htmlFor="" className="w-1/3 text-gray-700 font-medium">N° identificación</label>

          <input
            type="text"
            placeholder="Ingrese su N° de identificación"
            value={nDocEstudianteNuevo}
            onChange={(e) => setNdocEstudianteNuevo(e.target.value)}
            className="text-md font-bold flex-1 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            maxLength={10}
          />

        </div>

        <div className="flex items-center mt-2">
          <label style={estiloBadges} htmlFor="" className="w-1/3 text-gray-700 font-medium">Fecha nacimiento</label>

          <input
            type="text"
            value={fNacimientoEstudianteNuevo}
            placeholder="dd/mm/yyyy"
            className="text-md font-bold flex-1 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, ""); // solo números
              if (value.length >= 2) value = value.slice(0, 2) + "/" + value.slice(2);
              if (value.length >= 5) value = value.slice(0, 5) + "/" + value.slice(5, 9);
              e.target.value = value;
              setFnacimientoEstudianteNuevo(value)
            }}
          />

        </div>

        <div className="flex items-center py-6">
          <button
            type="button"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={isHovered ? estiloHover : estiloBase}
            className='w-full py-2 rounded-md text-white font-medium hover:bg-blue-700 bg-blue-500 text-base'
            onClick={handleConsultarInformacionEstudiantesNuevos}
          >
            Consultar
          </button>
        </div>
      </div>

      {
        (mostrarDivCargando) && <div className="flex justify-center">
          <h2 className="text-2xl font-bold" style={estiloBadges}>...cargando</h2>
        </div>
      }

      {
        (recibos.length > 0) &&
        <div className="container mx-auto px-4 py-5 bg-gray p-2" style={estiloFuentes}>
          <div className="flex flex-col space-y-4 bg-white rounded-md shadow-md p-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    N° Recibo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conceptos
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descargar
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pago PSE
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* {
                    recibos.map(recibo => (
                      <tr key={recibo.NOMBREPDF}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          FACTURA - {recibo.FACTURA.trimStart().replace(/^0+/g, "")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <a href={recibo.RUTA} onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)} style={isHovered ? estiloHover : estiloBase}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" download={recibo.NOMBREPDF}>
                            Descargar
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <a href={`${urlPagoPSE}${recibo.IDPSE}`} onMouseEnter={() => setIsHoveredPse(true)}
                            onMouseLeave={() => setIsHoveredPse(false)} style={isHoveredPse ? estiloHover : estiloBase}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Pago PSE
                          </a>
                        </td>
                      </tr>
                    ))
                  } */}

                {
                  [...recibos]
                    .sort((a, b) => {
                      // Usar el operador unario + para convertir la cadena a número
                      // Esto funciona bien para cadenas de números enteros, incluso con ceros a la izquierda
                      const facturaA = +a.FACTURA;
                      const facturaB = +b.FACTURA;

                      // Para orden descendente (mayor a menor), restamos b - a
                      return facturaB - facturaA;
                    })
                    .map((recibo, index) => (
                      <tr key={recibo.NOMBREPDF}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {recibo.FACTURA.trimStart().replace(/^0+/, "")}
                        </td>
                        <td>
                          {recibo.MATERIALES.map(materialObj => materialObj.MATERIAL).join(', ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <a href={recibo.RUTA} onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)} style={isHovered ? estiloHover : estiloBase}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" download={recibo.NOMBREPDF}>
                            Descargar
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">

                          {/* Si no viene un idPSE al darle click al boton de pse muestra alerta con mensaje de error */}
                          {recibo.IDPSE && recibo.IDPSE.trim() !== "" ?
                            (
                              <a href={`${urlPagoPSE}${recibo.IDPSE}`} onMouseEnter={() => setIsHoveredPse(true)}
                                onMouseLeave={() => setIsHoveredPse(false)} style={isHoveredPse ? estiloHover : estiloBase}
                              >
                                <img style={{ maxWidth: "10%", cursor: "pointer" }} src="https://storage-masivdrive.masivapp.com/1703/98f65ca6-11a6-4aee-9260-9ade652ca57f/4794c789-5271-4343-89bd-01db134eed4b/eb9bcb10-b9d3-4c27-897c-05113a4a35b0/f5ae2a2c-4241-4220-a112-3e348bccc988.png" />
                              </a>
                            ) :
                            (
                              <a onClick={() => mostrarAlertaError("Este recibo de matrícula no se puede pagar por PSE debido a que no se encontró un valor de matrícula para la fecha 1. Por favor, comuníquese con el área de Matriculas de su sede.")}
                                onMouseLeave={() => setIsHoveredPse(false)} style={isHoveredPse ? estiloHover : estiloBase}
                              >
                                <img style={{ maxWidth: "10%", cursor: "pointer" }} src="https://storage-masivdrive.masivapp.com/1703/98f65ca6-11a6-4aee-9260-9ade652ca57f/4794c789-5271-4343-89bd-01db134eed4b/eb9bcb10-b9d3-4c27-897c-05113a4a35b0/f5ae2a2c-4241-4220-a112-3e348bccc988.png" />
                              </a>
                            )
                          }
                        </td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      {

        (ejecutoConsultaRecibos && recibos.length <= 0) &&
        <div className="container mx-auto px-4 py-5 bg-gray p-2">
          <div className="flex flex-col space-y-4 bg-white rounded-md shadow-md p-4" style={estiloFuentes}>
            <h2>No se encontraron recibos</h2>
          </div>
        </div>

      }

    </>
  );



}
