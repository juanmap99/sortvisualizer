import { EjecucionManual } from "./EjecucionManual";

export interface SortAlgorithm extends EjecucionManual{
    
    /**
     * Ordena el array a traves de un modo de ejecucion automatica
     * @param array Array a ordenar
     * @param delay Dilay en milisegundos deseado
     */
    sort(array: Array<[number,number]>,  delay: number) : any;

    /**
     * Para la ejecucion del array.
     */
    stopExecution(): any;
}