import { ArrayControllerService } from "../../services/array-controller.service";
import { ArrayColorerService } from "../../services/array-colorer.service";
import { ReferenceService } from "../../services/reference-service";
import { SortAlgorithm } from "../SortAlgorithm";
import { ColorReference } from "../ColorReference";
import { AuxVarService } from "src/app/services/aux-var.service";
import { EstadoEjecucionM } from "../EstadoEjecucionM";

export class SelectionSort implements SortAlgorithm{
    delay: number;
    stopExec : boolean;
    execCodMap : Map<number, string>;

    constructor(private colorServ : ArrayColorerService, 
                private contrServ : ArrayControllerService,
                private colRefServ : ReferenceService,
                private auxServ : AuxVarService){
        this.setReferences();
        this.delay = 150;
        this.stopExec = false;
        this.execCodMap = new Map([
            [0, "Start"],
            [1, "Execute current J"],
            [2, "Increase J"],
            [3, "Swap"],
            [4, "Increase I"],
            [5, "ColorJ-Min"],
            [6, "End"]
        ]);
    }

    /**
     * Realiza el siguiente paso en el contexto de ejecución manual.
     * 
     * @param estado Estado de ejecucion actual
    */
    async siguientePaso(estado: EstadoEjecucionM) {
        let order = this.execCodMap.get(estado.codPasoRealizar);
        if(order){
            switch(order){
                case("Start"):
                    this.colorServ.addColor(0, "#00927D");
                    this.colorServ.addColor(0, "#F39530");
                    this.colorServ.addColor(1, "#4E585D");
                    await this.delayByRunSpeed();
                    break;
                case("Execute current J"):
                    let array = estado.estadoVariables[0];
                    let min = estado.estadoVariables[2];
                    let jv1 = estado.estadoVariables[3];
                    if(array[jv1][1] < array[min][1]){
                        this.colorServ.extractColor(min, "#F39530");
                        this.colorServ.addColor(jv1, "#F39530");
                        await this.delayByRunSpeed();
                        estado.estadoVariables[2] = jv1;
                    }
                    break;
                case("Increase J"):
                    let jv2 = estado.estadoVariables[3];//name change due switch restr
                    this.colorServ.extractColor(jv2, "#4E585D");
                    if(jv2+1 < estado.estadoVariables[0].length){
                        this.colorServ.addColor(jv2+1, "#4E585D");
                    }
                    estado.estadoVariables[3] += 1;
                    await this.delayByRunSpeed();
                    break;
                case("Swap"):
                    let irem = estado.estadoVariables[1];
                    let minfin = estado.estadoVariables[2];
                    if(irem != minfin){
                        this.swap(estado.estadoVariables[0],irem,minfin);
                    }
                    this.colorServ.extractColor(minfin, "#F39530");
                    await this.delayByRunSpeed();
                    break;
                case("ColorJ-Min"):
                    this.colorServ.addColor(estado.estadoVariables[2], '#F39530');
                    if(estado.estadoVariables[3] != estado.estadoVariables[0].length){
                        this.colorServ.addColor(estado.estadoVariables[3], '#4E585D'); 
                    }
                    await this.delayByRunSpeed();
                    break;
                case("Increase I"):
                    let i = estado.estadoVariables[1];
                    this.colorServ.extractColor(i, "#00927D");
                    if(i+1 < estado.estadoVariables[0].length){
                        this.colorServ.addColor(i+1, "#00927D");
                    }
                    else{
                        this.colorServ.extractColor(i, '#F39530');
                    }
                    this.colorServ.addColor(i, '#AB2574');
                    estado.estadoVariables[1] += 1;
                    await this.delayByRunSpeed();
                    break;
                case("End"):
                    this.colorServ.revertEverythingToDefault();
                    await this.delayByRunSpeed();
                    break;
            }
        }
    }

    /**
     * Calcula el siguiente estado que sera otorgado al siguiente paso en pos
     * de que el algoritmo cuente con lo necesario para realizar dicho paso.
     * 
     * @param estado Estado de ejecucion que representa el estado en la ultima ejecucion
    */
    calcularSiguienteEstado(estadoPrevio: EstadoEjecucionM): EstadoEjecucionM {
        let orderDone = this.execCodMap.get(estadoPrevio.codPasoRealizar);
        if(orderDone){
            switch(orderDone){
                case("Start"):
                    this.delay = 150;
                    let arrSort = this.contrServ.getCurrentArray();
                    let ismin = arrSort[1][1] < arrSort[0][1];
                    return {
                        estadoVariables : [arrSort,0,0,1],//arrray, i, min, j
                        codPasoRealizar : ismin? 1 : 2
                    };
                case("Execute current J"): 
                    return {
                        estadoVariables : [estadoPrevio.estadoVariables[0],
                                           estadoPrevio.estadoVariables[1],
                                           estadoPrevio.estadoVariables[2],
                                           estadoPrevio.estadoVariables[3]],
                        codPasoRealizar :  2
                    };
                case("Increase J"):
                    let jReachedEnd = estadoPrevio.estadoVariables[3] == estadoPrevio.estadoVariables[0].length;
                    if(!jReachedEnd){
                        let isMin = estadoPrevio.estadoVariables[0][estadoPrevio.estadoVariables[3]][1] <
                                    estadoPrevio.estadoVariables[0][estadoPrevio.estadoVariables[2]][1];
                        return {
                            estadoVariables : [estadoPrevio.estadoVariables[0],
                                               estadoPrevio.estadoVariables[1],
                                               estadoPrevio.estadoVariables[2],
                                               estadoPrevio.estadoVariables[3]],
                            codPasoRealizar : isMin ? 1 : 2
                        };
                    }
                    else{
                        return {
                            estadoVariables : [estadoPrevio.estadoVariables[0],
                                               estadoPrevio.estadoVariables[1],
                                               estadoPrevio.estadoVariables[2],
                                               estadoPrevio.estadoVariables[3]],
                            codPasoRealizar : 3
                        };
                    }
                case("Swap"):
                    return {
                        estadoVariables : [estadoPrevio.estadoVariables[0],
                                           estadoPrevio.estadoVariables[1],
                                           estadoPrevio.estadoVariables[2],
                                           estadoPrevio.estadoVariables[3]],
                        codPasoRealizar : 4
                    };
                case("Increase I"):
                    let programDone = estadoPrevio.estadoVariables[1] == estadoPrevio.estadoVariables[0].length;
                    return {
                        estadoVariables : [estadoPrevio.estadoVariables[0],
                                           estadoPrevio.estadoVariables[1],
                                           estadoPrevio.estadoVariables[1],
                                           estadoPrevio.estadoVariables[1]+1],
                        codPasoRealizar : programDone ? 6 : 5
                    };
                case("ColorJ-Min"):
                    if(estadoPrevio.estadoVariables[0].length != estadoPrevio.estadoVariables[3]){
                        let isMin = estadoPrevio.estadoVariables[0][estadoPrevio.estadoVariables[3]][1] <
                                        estadoPrevio.estadoVariables[0][estadoPrevio.estadoVariables[2]][1]; 
                        return {
                            estadoVariables : [estadoPrevio.estadoVariables[0],
                                               estadoPrevio.estadoVariables[1],
                                               estadoPrevio.estadoVariables[2],
                                               estadoPrevio.estadoVariables[3]],
                            codPasoRealizar : isMin ? 1 : 2
                        };
                    }
                    else{
                        return { 
                            estadoVariables : [estadoPrevio.estadoVariables[0],
                                               estadoPrevio.estadoVariables[1],
                                               estadoPrevio.estadoVariables[2],
                                               estadoPrevio.estadoVariables[3]],
                            codPasoRealizar : 4
                        };
                    }
                case("End"):
                    return {
                        estadoVariables : [],//i, min, j
                        codPasoRealizar : -1
                    };
            }
        }
        return { estadoVariables : [],codPasoRealizar : -1};//No va a llegar aca.
    }

    /**
     * Setea las colorReferences que el algoritmo utilizara a traves del servicio ReferenceService
    */
    setReferences(){
        let referenceList : ColorReference[]= [
            {varName:'inOrder',refColor:'#AB2574',
            descripcion:"Señala los elementos que ya estan ordenados en su posición final."},
            {varName:'iActual',refColor:'#00927D',
            descripcion:"Señala la posición sobre la cual se colocará el valor mínimo encontrado en la presente iteración."},
            {varName:'iMin',refColor:'#F39530',
            descripcion:"Señala la posición del elemento mas pequeño en el tramo restante."},
            {varName:'J',refColor:'#4E585D',
            descripcion:"Señala la posición siendo evaluada actualmente."}
        ];
        this.colRefServ.setColorReferences(referenceList);
    }

    /**
     * Genera un delay en milisegundos de una longitud de tiempo igual a la marcada por la variable
     * de clase'delay'
     * 
     * @returns Promesa que sera resuelta una vez que pase el tiempo delimitado por la variable
     * de clase 'delay.
    */
    delayByRunSpeed(){
        return new Promise(resolve => {
            setTimeout(function() {
            resolve("Delay completado");
            }, this.delay);
        });
    }
    /**
     * Funcion que detiene la ejecucion del programa y revierte todos los colores del array
     * a default a traves del servicio ArrayColorerService
     */
    stopExecution() : any{
        this.stopExec = true;
        this.colorServ.revertEverythingToDefault();
    }

    /**
     * Realiza el swappeo en el array de los elementos en las posiciones 'elemA' y 'elemB'
     * a traves del servicio ArrayControllerService.
     * 
     * @param array Array actual
     * @param elemA Indice del elemento A
     * @param elemB Indice del elemento B
    */
    swap(array: Array<[number,number]>, elemA: number, elemB: number){
        this.delayByRunSpeed();
        this.contrServ.swapElements({'indexA':elemA,'indexB':elemB});
        array = this.contrServ.getCurrentArray();
    }

    async sort(arr: Array<[number,number]>, delay: number){
        this.stopExec = false;
        this.delay = delay;
        let i = 0;
        while(i<arr.length && !this.stopExec){
            let min_idx = i;
            this.colorServ.addColor(i, "#00927D");
            this.colorServ.addColor(min_idx, "#F39530");
            await this.delayByRunSpeed();
            let j = i+1;
            while(j<arr.length && !this.stopExec){
                this.colorServ.addColor(j, "#4E585D");
                await this.delayByRunSpeed();
                if(arr[j][1] < arr[min_idx][1]){
                    this.colorServ.extractColor(min_idx, "#F39530");
                    min_idx = j;
                    this.colorServ.addColor(min_idx, "#F39530");
                    await this.delayByRunSpeed();
                }
                this.colorServ.extractColor(j, "#4E585D");
                j += 1;
            }
            if(min_idx != i && !this.stopExec){
                this.swap(arr,min_idx,i);
            }
            this.colorServ.extractColor(min_idx, "#F39530");
            this.colorServ.extractColor(i, "#00927D");
            this.colorServ.addColor(i, "#AB2574");
            await this.delayByRunSpeed();
            i += 1;
        }
        await this.delayByRunSpeed();
        this.colorServ.revertEverythingToDefault();
    }
}