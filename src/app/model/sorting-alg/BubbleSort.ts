import { ArrayControllerService } from "../../services/array-controller.service";
import { ArrayColorerService } from "../../services/array-colorer.service";
import { ReferenceService } from "../../services/reference-service";
import { SortAlgorithm } from "../SortAlgorithm";
import { ColorReference } from "../ColorReference";
import { AuxVarService } from "src/app/services/aux-var.service";
import { EstadoEjecucionM } from "../EstadoEjecucionM";

export class BubbleSort implements SortAlgorithm{
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
            [1, "ColorJJPlus"],
            [2, "Incrementar J"],
            [3, "Swap"],
            [4, "Decrease I"],
            [5, "FillInOrder"],
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
                    this.colorServ.addColor(0, "#00927D");
                    this.colorServ.addColor(1, "#4E585D");
                    await this.delayByRunSpeed();
                    break;
                case("ColorJJPlus"):
                    this.colorServ.addColor(0, "#00927D");
                    this.colorServ.addColor(1, "#4E585D");
                    await this.delayByRunSpeed();
                    break;
                case("Incrementar J"):
                    let jv2 = estado.estadoVariables[2];//name change due switch restr
                    this.colorServ.extractColor(jv2, "#00927D");
                    this.colorServ.extractColor(jv2+1, "#4E585D");
                    if(jv2+2 < estado.estadoVariables[1]){
                        this.colorServ.addColor(jv2+1, "#00927D");
                        this.colorServ.addColor(jv2+2, "#4E585D");
                    }
                    estado.estadoVariables[2] += 1;
                    estado.estadoVariables[3] += 1;
                    await this.delayByRunSpeed();
                    break;
                case("Swap"):
                    let jo = estado.estadoVariables[2];
                    let jd = estado.estadoVariables[3];
                    this.contrServ.swapElements({indexA:jo,indexB:jd});
                    await this.delayByRunSpeed();
                    break;
                case("Decrease I"):
                    estado.estadoVariables[1] -= 1;
                    this.colorServ.extractColor(estado.estadoVariables[2]-1, "#00927D");
                    this.colorServ.extractColor(estado.estadoVariables[3]-1, "#4E585D");
                    this.colorServ.addColor(estado.estadoVariables[1], "#AB2574");
                    await this.delayByRunSpeed();
                    break;
                case("FillInOrder"):
                    for(let st = 0; st < estado.estadoVariables[1]; st++){
                        this.colorServ.addColor(st, "#AB2574");
                    }
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
    calcularSiguienteEstado(estadoPrevio : EstadoEjecucionM): EstadoEjecucionM {
        let orderDone = this.execCodMap.get(estadoPrevio.codPasoRealizar);
        if(orderDone){
            switch(orderDone){
                case("Start"):
                    let arr = this.contrServ.getCurrentArray();
                    let isMin = arr[1][1] < arr[0][1];
                    return {
                        estadoVariables : [arr,
                                           estadoPrevio.estadoVariables.length == 0 ? arr.length : estadoPrevio.estadoVariables[1],
                                           0,
                                           1,
                                           false],//arr,i,j,j+1,swapped
                        codPasoRealizar : isMin ? 3 : 2
                    };
                case("Incrementar J"):
                    let jReachedEnd = estadoPrevio.estadoVariables[3]+1 > 
                                      estadoPrevio.estadoVariables[1];
                    if(!jReachedEnd){
                        let isMin = estadoPrevio.estadoVariables[0][estadoPrevio.estadoVariables[3]][1] <
                                    estadoPrevio.estadoVariables[0][estadoPrevio.estadoVariables[2]][1];
                        return {
                            estadoVariables : [estadoPrevio.estadoVariables[0],
                                               estadoPrevio.estadoVariables[1],
                                               estadoPrevio.estadoVariables[2],
                                               estadoPrevio.estadoVariables[3],
                                               estadoPrevio.estadoVariables[4]],
                            codPasoRealizar : isMin ? 3 : 2
                        };
                    }
                    else{
                        return {
                            estadoVariables : [estadoPrevio.estadoVariables[0],
                                               estadoPrevio.estadoVariables[1],
                                               estadoPrevio.estadoVariables[2],
                                               estadoPrevio.estadoVariables[3],
                                               estadoPrevio.estadoVariables[4]],
                            codPasoRealizar : 4
                        };
                    }
                case("Swap"):
                    return {
                        estadoVariables : [estadoPrevio.estadoVariables[0],
                                           estadoPrevio.estadoVariables[1],
                                           estadoPrevio.estadoVariables[2],
                                           estadoPrevio.estadoVariables[3],
                                           true],
                        codPasoRealizar : 2
                    };
                case("Decrease I"):
                    let programDone = (estadoPrevio.estadoVariables[1] == 1) || (estadoPrevio.estadoVariables[4] == false);
                    return {
                        estadoVariables : [estadoPrevio.estadoVariables[0],
                                           estadoPrevio.estadoVariables[1],
                                           0,
                                           1,
                                           false],
                        codPasoRealizar : programDone ? 5 : 0
                    };
                case("FillInOrder"):
                    return{
                        estadoVariables: [],
                        codPasoRealizar: 6
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
            {varName:'inOrder',refColor:'#AB2574',
            descripcion:"Señala los elementos que ya estan ordenados en su posición final."},
            {varName:'J',refColor:'#00927D',
            descripcion:"Señala la posición que se esta evaluando actualmente."},
            {varName:'J+1',refColor:'#4E585D',
            descripcion:"Señala la posición contra la cual se esta comparando J."},
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

    async sort(array: Array<[number,number]>, delay: number){
        this.stopExec = false;
        this.delay = delay;
        let i = 0;
        let j = 0;
        let swapped = true;
        while(i<array.length && !this.stopExec && swapped){
            swapped = false;
            while(j<array.length-i-1 && !this.stopExec){
                this.colorServ.addColor(j,'#00927D');
                this.colorServ.addColor(j+1,'#4E585D');
                await this.delayByRunSpeed();
                if(array[j][1] > array[j+1][1]){
                    swapped = true;
                    this.contrServ.swapElements({'indexA':j,'indexB':j+1});
                    await this.delayByRunSpeed();
                    array = this.contrServ.getCurrentArray();
                }
                this.colorServ.extractColor(j,'#00927D');
                this.colorServ.extractColor(j+1,'#4E585D');
                j += 1;
            }
            i += 1;
            this.colorServ.addColor(array.length-i,'#AB2574');
            await this.delayByRunSpeed();
            j = 0;
        }
        if(!this.stopExec && !swapped){
            for(let k=0; k<array.length;k+=1){
                this.colorServ.addColor(k,'#AB2574');
            }
            await this.delayByRunSpeed();
        }
        if(!this.stopExec){
            await this.delayByRunSpeed();
        }
        for(let k=0; k<array.length;k+=1){
            this.colorServ.revertToDefault(k);
        }
    }
}