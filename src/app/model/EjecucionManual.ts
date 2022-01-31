import { EstadoEjecucionM } from "./EstadoEjecucionM";

export interface EjecucionManual{
    /**
     * En base al codigo de ejecucion, realiza el siguiente paso cuando se trata de una
     * ejecucion manual.
     * @param estado Estado de ejecucion que contendra una lista con el valor de las variables
     * y un codigo que determina la operacion a realizar
     */
    siguientePaso(estado : EstadoEjecucionM) : any;

    /**
     * En base al codigo de ejecucion, realiza los cambios necesarios sobre las variables de estado
     * y define cual sera el proximo paso a realizar
     * @param estado Estado de ejecucion.
     */
    calcularSiguienteEstado(estado : EstadoEjecucionM) : EstadoEjecucionM;
}