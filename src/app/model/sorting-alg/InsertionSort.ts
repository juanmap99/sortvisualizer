import { ArrayControllerService } from "../../services/array-controller.service";
import { ArrayColorerService } from "../../services/array-colorer.service";
import { ReferenceService } from "../../services/reference-service";
import { SortAlgorithm } from "../SortAlgorithm";
import { ColorReference } from "../ColorReference";
import { AuxVarService } from "src/app/services/aux-var.service";
import { EstadoEjecucionM } from "../EstadoEjecucionM";

export class InsertionSort implements SortAlgorithm{
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
            [2, "Decrementar J"],
            [3, "Swap"],
            [4, "Increase I"],
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
                    this.delay = 150;
                    this.colorServ.addColor(1, "#00927D");
                    this.colorServ.addColor(0, "#4E585D");
                    await this.delayByRunSpeed();
                    break;
                case("Decrementar J"):
                    let jv2 = estado.estadoVariables[3];//name change due switch restr
                    if(jv2-1 >= 0){
                        this.colorServ.addColor(jv2-1, "#4E585D");
                    }
                    estado.estadoVariables[3] -= 1;
                    await this.delayByRunSpeed();
                    break;
                case("Swap"):
                    let reverser = estado.estadoVariables[2];
                    let j = estado.estadoVariables[3];
                    this.swap(estado.estadoVariables[0],reverser,j);
                    this.colorServ.extractColor(reverser, "#00927D");
                    this.colorServ.extractColor(j, "#4E585D");
                    this.colorServ.addColor(j, "#00927D");
                    await this.delayByRunSpeed();
                    break;
                case("Increase I"):
                    let i = estado.estadoVariables[1];
                    let rvser = estado.estadoVariables[2];
                    this.colorServ.extractColor(rvser, "#00927D");
                    if(i+1 < estado.estadoVariables[0].length){
                        this.colorServ.addColor(i+1, "#00927D");
                    }
                    if(estado.estadoVariables[3] >= 0){
                        this.colorServ.extractColor(estado.estadoVariables[3], "#4E585D");
                    }
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
                    let ismin = arrSort[0][1] < arrSort[1][1] ;
                    return {
                        estadoVariables : [arrSort,1,1,0],//arrray, i, reverser, j
                        codPasoRealizar : ismin ? 4 : 3
                    };
                case("Decrementar J"):
                    let jReachedEnd = estadoPrevio.estadoVariables[3] < 0;
                    if(!jReachedEnd){
                        let isMin = estadoPrevio.estadoVariables[0][estadoPrevio.estadoVariables[3]][1] <
                                    estadoPrevio.estadoVariables[0][estadoPrevio.estadoVariables[2]][1];
                        return {
                            estadoVariables : [estadoPrevio.estadoVariables[0],
                                               estadoPrevio.estadoVariables[1],
                                               estadoPrevio.estadoVariables[2],
                                               estadoPrevio.estadoVariables[3]],
                            codPasoRealizar : isMin ? 4 : 3
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
                case("Swap"):
                    return {
                        estadoVariables : [estadoPrevio.estadoVariables[0],
                                           estadoPrevio.estadoVariables[1],
                                           estadoPrevio.estadoVariables[2]-1,
                                           estadoPrevio.estadoVariables[3]],
                        codPasoRealizar : 2
                    };
                case("Increase I"):
                    let programDone = estadoPrevio.estadoVariables[1] == estadoPrevio.estadoVariables[0].length;
                    return {
                        estadoVariables : [estadoPrevio.estadoVariables[0],
                                           estadoPrevio.estadoVariables[1],
                                           estadoPrevio.estadoVariables[1],
                                           estadoPrevio.estadoVariables[1]],
                        codPasoRealizar : programDone ? 6 : 2
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
            {varName:'iReverser',refColor:'#00927D',
            descripcion:"Señala la posición del elemento actualmente siendo desplazado."},
            {varName:'J',refColor:'#4E585D',
            descripcion:"Señala la posición del elemento siendo comparado contra el reverser."},
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

    async sort(arr: Array<[number,number]>,  delay: number){
        this.stopExec = false;
        this.delay = delay;
        let i = 1;
        this.colorServ.addColor(i,"#00927D");
        while(i < arr.length && !this.stopExec){
            let j = i-1;
            this.colorServ.addColor(j,"#4E585D");
            await this.delayByRunSpeed();
            while(j >= 0 && arr[j][1] > arr[j+1][1] && !this.stopExec){
                this.swap(arr,j+1,j);
                this.colorServ.extractColor(j+1,"#00927D");
                this.colorServ.extractColor(j,"#4E585D");
                this.colorServ.addColor(j,"#00927D");
                j -= 1;
                if(j >= 0){
                    this.colorServ.addColor(j,"#4E585D");
                }
                await this.delayByRunSpeed();
            }
            if(j >= 0){
                this.colorServ.extractColor(j,"#4E585D");
                this.colorServ.extractColor(j+1,"#00927D");
            }
            else{
                this.colorServ.extractColor(j+1,"#00927D");
            }
            i += 1;
        }
        this.colorServ.revertEverythingToDefault();
    }
}