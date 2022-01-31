import { ArrayControllerService } from "../../services/array-controller.service";
import { ArrayColorerService } from "../../services/array-colorer.service";
import { ReferenceService } from "../../services/reference-service";
import { SortAlgorithm } from "../SortAlgorithm";
import { ColorReference } from "../ColorReference";
import { AuxVarService } from "src/app/services/aux-var.service";
import { EstadoEjecucionM } from "../EstadoEjecucionM";

export interface IndexPair{
    iLeft : number,
    iRight : number
}

export class QuickSort implements SortAlgorithm{
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
                [1, "Start partition"],
                [2, "Increase J"],
                [3, "Swap"],
                [4, "Marcar pivote"],
                [5, "Update stack"],
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
                    this.auxServ.setAuxVariable("Stack",[{iLeft:0, iRight:this.contrServ.getCurrentArray().length-1}]);
                    await this.delayByRunSpeed();
                    break;
                case("Start partition"):
                    let iPair : IndexPair = estado.estadoVariables[1].pop();
                    if(estado.estadoVariables[1].length > 0){
                        this.auxServ.setPriorityIndex("Stack", estado.estadoVariables[1].length-1);
                    }
                    estado.estadoVariables[2] = iPair.iLeft;
                    estado.estadoVariables[5] = iPair.iRight;
                    estado.estadoVariables[3] = iPair.iLeft;
                    estado.estadoVariables[4] = iPair.iLeft;
                    this.colorServ.addColor(iPair.iLeft, "#D2C993");
                    this.colorServ.addColor(estado.estadoVariables[4], "#00927D");
                    this.colorServ.addColor(estado.estadoVariables[3], "#4E585D");
                    this.colorServ.addColor(iPair.iRight, "#AB2574");
                    await this.delayByRunSpeed();
                    break;
                case("Increase J"):
                    this.colorServ.extractColor(estado.estadoVariables[4], "#00927D");
                    estado.estadoVariables[4] += 1;
                    if(estado.estadoVariables[4] != estado.estadoVariables[5]){
                        this.colorServ.addColor(estado.estadoVariables[4], "#00927D");
                    }
                    break;
                case("Swap"):
                    this.colorServ.extractColor(estado.estadoVariables[3], "#4E585D");
                    this.swap(estado.estadoVariables[0],estado.estadoVariables[3],estado.estadoVariables[4]);
                    estado.estadoVariables[3] += 1;
                    this.colorServ.addColor(estado.estadoVariables[3], "#4E585D");
                    await this.delayByRunSpeed();
                    break;
                case("Marcar pivote"):
                    this.swap(estado.estadoVariables[0],estado.estadoVariables[3],estado.estadoVariables[5]);
                    this.colorServ.extractColor(estado.estadoVariables[3], "#4E585D");
                    this.colorServ.extractColor(estado.estadoVariables[4], "#00927D");
                    this.colorServ.addColor(estado.estadoVariables[3], "#F39530");
                    await this.delayByRunSpeed();
                    break;
                case("Update stack"):
                    this.colorServ.extractColor(estado.estadoVariables[3], "#F39530");
                    this.colorServ.extractColor(estado.estadoVariables[5], "#AB2574");
                    this.colorServ.extractColor(estado.estadoVariables[2], "#D2C993");
                    if(estado.estadoVariables[3]-1 > estado.estadoVariables[2]){
                        estado.estadoVariables[1].push({iLeft:estado.estadoVariables[2],
                                                        iRight:estado.estadoVariables[3]-1});
                    }
                    if(estado.estadoVariables[3]+1 < estado.estadoVariables[5]){
                        estado.estadoVariables[1].push({iLeft:estado.estadoVariables[3]+1,
                                                        iRight:estado.estadoVariables[5]});
                    }
                    this.auxServ.setAuxVariable("Stack",estado.estadoVariables[1]);
                    if(estado.estadoVariables[1].length > 0){
                        this.auxServ.setPriorityIndex("Stack",estado.estadoVariables[1].length-1);
                    }
                    await this.delayByRunSpeed();
                    break;
                case("End"):
                    this.auxServ.deleteAuxVar("Stack");
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
                    let iPair : IndexPair = {iLeft:0, iRight:this.contrServ.getCurrentArray().length-1};
                    return {
                        estadoVariables : [arrSort,
                                           [iPair],
                                            0,
                                            0,
                                            0,
                                            arrSort.length-1],//arrray, stack, iLow, iLowThan, J, iHigh
                        codPasoRealizar : 1
                    };
                case("Start partition"):
                    let isMin = estadoPrevio.estadoVariables[0][estadoPrevio.estadoVariables[4]][1] <=
                                    estadoPrevio.estadoVariables[0][estadoPrevio.estadoVariables[5]][1]; 
                    return {
                        estadoVariables : [estadoPrevio.estadoVariables[0],
                                        estadoPrevio.estadoVariables[1],
                                        estadoPrevio.estadoVariables[2],
                                        estadoPrevio.estadoVariables[3],
                                        estadoPrevio.estadoVariables[4],
                                        estadoPrevio.estadoVariables[5]],//arrray, stack, iLow, iLowThan, J, iHigh
                        codPasoRealizar : isMin ? 3 : 2
                    };
                case("Increase J"):
                    let jReachedEnd = estadoPrevio.estadoVariables[4] == 
                                      estadoPrevio.estadoVariables[5];
                    if(!jReachedEnd){
                        let isMin = estadoPrevio.estadoVariables[0][estadoPrevio.estadoVariables[4]][1] <=
                                    estadoPrevio.estadoVariables[0][estadoPrevio.estadoVariables[5]][1];
                        return {
                            estadoVariables : [estadoPrevio.estadoVariables[0],
                                               estadoPrevio.estadoVariables[1],
                                               estadoPrevio.estadoVariables[2],
                                               estadoPrevio.estadoVariables[3],
                                               estadoPrevio.estadoVariables[4],
                                               estadoPrevio.estadoVariables[5]],
                            codPasoRealizar : isMin ? 3 : 2
                        };
                    }
                    else{ 
                        return {
                            estadoVariables : [estadoPrevio.estadoVariables[0],
                                               estadoPrevio.estadoVariables[1],
                                               estadoPrevio.estadoVariables[2],
                                               estadoPrevio.estadoVariables[3],
                                               estadoPrevio.estadoVariables[4],
                                               estadoPrevio.estadoVariables[5]],
                            codPasoRealizar : 4
                        };
                    }
                case("Swap"):
                    return {
                        estadoVariables : [estadoPrevio.estadoVariables[0],
                                           estadoPrevio.estadoVariables[1],
                                           estadoPrevio.estadoVariables[2],
                                           estadoPrevio.estadoVariables[3],
                                           estadoPrevio.estadoVariables[4],
                                           estadoPrevio.estadoVariables[5]],
                        codPasoRealizar : 2
                    };
                case("Marcar pivote"):
                    return {
                        estadoVariables : [estadoPrevio.estadoVariables[0],
                                           estadoPrevio.estadoVariables[1],
                                           estadoPrevio.estadoVariables[2],
                                           estadoPrevio.estadoVariables[3],
                                           estadoPrevio.estadoVariables[4],
                                           estadoPrevio.estadoVariables[5]],
                        codPasoRealizar : 5
                    };
                case("Update stack"):
                    let partitionExists = estadoPrevio.estadoVariables[1].length > 0;
                    return {
                        estadoVariables : [estadoPrevio.estadoVariables[0],
                                           estadoPrevio.estadoVariables[1],
                                           estadoPrevio.estadoVariables[2],
                                           estadoPrevio.estadoVariables[3],
                                           estadoPrevio.estadoVariables[4],
                                           estadoPrevio.estadoVariables[5]],
                        codPasoRealizar : partitionExists ? 1 : 6
                    };
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
            {varName:'iLow',refColor:'#D2C993',
            descripcion:"Señala la posición inicial sobre la cual se realiza el particionamiento."},
            {varName:'iHigh',refColor:'#AB2574',
            descripcion:"Señala el valor del pivote en la actual partición. Determina a su vez el índice hasta el cual recorrerá J."},
            {varName:'J',refColor:'#00927D',
            descripcion:"Señala la posición que se esta evaluando actualmente durante el proceso de particionamiento."},
            {varName:'iLowerThanPivote',refColor:'#4E585D',
            descripcion:"Señala que todos los elementos detras de la posición a la que apunta tienen un valor menor al del pivote."},
            {varName:'iPivote',refColor:'#F39530', 
            descripcion:"Posición en la que se encuentra el pivote al finalizar la partición."}
        ];
        this.colRefServ.setColorReferences(referenceList);
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
     * Realiza la particion del array en el rango establecido por iLow y iHigh, entendiendo como
     * particion al proceso a traves del cual se dividira el array en dos mitades, una parte izquierda
     * sobre la cual se encontraran todos los valores menores o iguales a array[iHigh] y una parte
     * derecha en donde se encontraran aquellos valores que sean mayores.
     * 
     * @param array Array sobre el cual realizar la particion
     * @param iLow Indice que representa el iLow
     * @param iHigh Indice que representa el iHigh
     * @returns Retorna la posicion del pivote una vez realiza la particion.
     */
    async partition(array: Array<[number,number]>, iLow: number, iHigh: number){
        let pivote : [number,number] = array[iHigh];
        this.colorServ.addColor(iHigh,"#AB2574");

        let iLowerThanPivote : number = iLow;
        this.colorServ.addColor(iLow,"#D2C993");
        this.colorServ.addColor(iLowerThanPivote,"#4E585D");
        await this.delayByRunSpeed();
        let j = iLow;
        while (j<iHigh && !this.stopExec){
            this.colorServ.addColor(j,"#00927D");
            await this.delayByRunSpeed();
            if(array[j][1] <= pivote[1]){
                this.swap(array, iLowerThanPivote, j);
                this.colorServ.extractColor(iLowerThanPivote,"#4E585D");
                iLowerThanPivote += 1;
                this.colorServ.addColor(iLowerThanPivote,"#4E585D");
            }
            this.colorServ.extractColor(j,"#00927D");
            j += 1;
        }
        if(!this.stopExec){
            await this.delayByRunSpeed();
            this.colorServ.extractColor(iLow,"#D2C993");
            this.colorServ.extractColor(iLowerThanPivote,"#4E585D");
            this.colorServ.addColor(iLowerThanPivote,"#F39530");
            this.swap(array,iLowerThanPivote,iHigh);
            this.colorServ.extractColor(iHigh,"#AB2574");
            await this.delayByRunSpeed();
            this.colorServ.extractColor(iLowerThanPivote,"#F39530");
        }
        else{
            this.colorServ.extractColor(iLow,"#D2C993");
            this.colorServ.extractColor(iLowerThanPivote,"#4E585D");
            this.colorServ.extractColor(iHigh,"#AB2574");
        }
        return iLowerThanPivote;
    }

    /**
     * Mapea el array enviado por parametro en pos de extraer solamente los valores de cada
     * posicion y no la posicion en si.
     * 
     * @param array Array actual
     * @returns Array que solo contiene los valores del array enviado por parametro y no
     * los indices ubicados en la posicion 0.
     */
    getArrayValues(array: Array<[number,number]>){
        return array.map((val)=> val[1]);
    }

    /**
     * Funcion que detiene la ejecucion del programa y revierte todos los colores del array
     * a default a traves del servicio ArrayColorerService. A su vez, elimina todas las variables
     * auxiliares creadas.
     */
    stopExecution() : any{
        this.auxServ.deleteAuxVar("Stack");
        this.colorServ.revertEverythingToDefault();
        this.stopExec = true;
    }

    async sort(array: Array<[number,number]>, delay: number){
        this.stopExec = false;//If we are calling this method, we mean to run it
        this.delay = delay;
        let stack : IndexPair[]= [];

        let iStart = 0;
        let iEnd = array.length -1;
        
        stack.push({iLeft:iStart,iRight: iEnd});
        this.auxServ.setAuxVariable('Index Stack',stack);
        this.auxServ.setPriorityIndex('Index Stack',stack.length-1);
        await this.delayByRunSpeed();
        while(stack.length > 0 && !this.stopExec){
            let indexPair = stack.pop();
            this.auxServ.setAuxVariable('Index Stack',stack);
            let prioIndex = stack.length == 0 ? 0 : stack.length-1;
            this.auxServ.setPriorityIndex('Index Stack',prioIndex);
            if (indexPair != undefined){
                let indicePivote = await this.partition(array,indexPair.iLeft,indexPair.iRight);
                //If there's still elements on the left
                if (indicePivote-1 > indexPair.iLeft){
                    stack.push({iLeft: indexPair.iLeft, iRight: indicePivote-1});
                    this.auxServ.setAuxVariable('Index Stack',stack);
                    this.auxServ.setPriorityIndex('Index Stack',stack.length-1);
                }
                //If there's still elements on the right
                if (indicePivote+1 < indexPair.iRight){
                    stack.push({iLeft:indicePivote+1, iRight:indexPair.iRight});
                    this.auxServ.setAuxVariable('Index Stack',stack);
                    this.auxServ.setPriorityIndex('Index Stack',stack.length-1);
                }
                await this.delayByRunSpeed();
            }
        }
        this.auxServ.deleteAuxVar('Index Stack');
    }
}