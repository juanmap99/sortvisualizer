import { SortAlgorithm } from "./SortAlgorithm";

export interface RunParams{
    useMode: 'automatic' | 'manual';
    algoritmo?: SortAlgorithm;
    arrSize: number;
    runSpeed : number;
    timerDesired : boolean;
} 