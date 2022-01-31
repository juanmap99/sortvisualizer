import { ArrayControllerService } from "../../services/array-controller.service";
import { ArrayColorerService } from "../../services/array-colorer.service";
import { ReferenceService } from "../../services/reference-service";
import { SortAlgorithm } from "../SortAlgorithm";
import { ColorReference } from "../ColorReference";
import { AuxVarService } from "src/app/services/aux-var.service";
import { EstadoEjecucionM } from "../EstadoEjecucionM";

export class HeapSort implements SortAlgorithm{
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
            [1, "heapify"],
            [2, "order"],
            [3, "End"]
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
                    let iSinceHasChild = Math.floor(this.contrServ.getCurrentArray().length / 2) - 1;
                    let leftChild = (2 * iSinceHasChild) + 1;
                    let rightChild = (2 * iSinceHasChild) + 2;
                    this.colorServ.addColor(iSinceHasChild,"#F39530");
                    if(leftChild < this.contrServ.getCurrentArray().length){
                        this.colorServ.addColor(leftChild,"#00927D");
                    }
                    if(rightChild < this.contrServ.getCurrentArray().length){
                        this.colorServ.addColor(rightChild,"#4E585D");
                    }
                    await this.delayByRunSpeed();
                    break;
                case("heapify"):
                    let rBiggest = estado.estadoVariables[3]; 
                    let biggest = estado.estadoVariables[3];
                    let nds = estado.estadoVariables[1];
                    let arr = estado.estadoVariables[0];
                    let lc = (2 * biggest) + 1;
                    let rc= (2 * biggest) + 2;
                    //Coloreo
                    this.colorServ.addColor(biggest,"#F39530");
                    if(lc < nds){
                        this.colorServ.addColor(lc,"#00927D");
                    }
                    if(rc < nds){
                        this.colorServ.addColor(rc,"#4E585D");
                    }
                    for(let i=0; i<4;i++){
                        await this.delayByRunSpeed();
                    }
                    //Calculo biggest
                    if(lc < nds && arr[biggest][1] < arr[lc][1]){
                        biggest = lc;
                    }
                    if(rc < nds && arr[biggest][1] < arr[rc][1]){
                        biggest = rc;
                    }
                    //Accionar
                    if(biggest != estado.estadoVariables[3]){
                        this.swap(estado.estadoVariables[0],estado.estadoVariables[3],biggest);
                        for(let i=0; i<4;i++){
                            await this.delayByRunSpeed();
                        }
                        estado.estadoVariables[3] = biggest;
                    }
                    else{
                        estado.estadoVariables[3] = estado.estadoVariables[0].length;
                    }
                    this.colorServ.revertToDefault(rBiggest);
                    if(lc < nds){
                        this.colorServ.revertToDefault(lc);
                    }
                    if(rc < nds){
                        this.colorServ.revertToDefault(rc);
                    }
                    break;
                case("order"):
                    estado.estadoVariables[1] -= 1;
                    this.swap(estado.estadoVariables[0],estado.estadoVariables[1],0);
                    this.colorServ.addColor(estado.estadoVariables[1],"#AB2574");
                    break;
                case("End"):
                    this.colorServ.addColor(0,"#AB2574");
                    for(let i=0; i<4;i++){
                        await this.delayByRunSpeed();
                    }
                    this.colorServ.revertEverythingToDefault();
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
                    let arrSort = this.contrServ.getCurrentArray();
                    return {
                        estadoVariables : [arrSort,
                                           arrSort.length,
                                           Math.floor(arrSort.length / 2) - 1,
                                           Math.floor(arrSort.length / 2) - 1,
                                           true],//arrray, nodes, i , biggest, buildingHeap
                        codPasoRealizar : 1
                    };
                case("heapify"):
                    let iUntilHasChild = Math.floor(estadoPrevio.estadoVariables[0].length / 2) - 1;
                    let iShouldDecrease = (estadoPrevio.estadoVariables[3] > iUntilHasChild) ||
                                          (estadoPrevio.estadoVariables[3] > estadoPrevio.estadoVariables[1]);
                    if(!iShouldDecrease){
                        return {
                            estadoVariables : [estadoPrevio.estadoVariables[0],
                                            estadoPrevio.estadoVariables[1],
                                            estadoPrevio.estadoVariables[2],
                                            estadoPrevio.estadoVariables[3],
                                            estadoPrevio.estadoVariables[4]],//arrray, nodes, i , biggestChanged
                            codPasoRealizar : 1 
                        };
                    }
                    else{
                        let heapFinished = estadoPrevio.estadoVariables[2] == 0;
                        if(!heapFinished){
                            return {
                                estadoVariables : [estadoPrevio.estadoVariables[0],
                                                estadoPrevio.estadoVariables[1],
                                                estadoPrevio.estadoVariables[2]-1,
                                                estadoPrevio.estadoVariables[2]-1,
                                                estadoPrevio.estadoVariables[4]],//arrray, nodes, i , biggestChanged
                                codPasoRealizar : 1 
                            };
                        }
                        else{
                            return {
                                estadoVariables : [estadoPrevio.estadoVariables[0],
                                                estadoPrevio.estadoVariables[1],
                                                0,
                                                0,
                                                estadoPrevio.estadoVariables[4]],//arrray, nodes, i , biggestChanged
                                codPasoRealizar : 2 
                            }; 
                        }
                    }
                case("order"):
                    let over = estadoPrevio.estadoVariables[1] == 1;
                    return {
                        estadoVariables : [estadoPrevio.estadoVariables[0],
                                        estadoPrevio.estadoVariables[1],
                                        0,
                                        0
                                        ],//arrray, nodes, i , biggestChanged
                        codPasoRealizar : over ? 3 : 1 
                    };
                case("End"):
                    return {
                        estadoVariables : [],
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
            {varName:'iParent',refColor:'#F39530',
            descripcion:"Señala la posición del padre que esta siendo evaluado actualmente."},
            {varName:'iLeftChild',refColor:'#00927D',
            descripcion:"Señala la posición del hijo izquierdo del padre que esta siendo evaluado actualmente."},
            {varName:'iRightChild',refColor:'#4E585D',
            descripcion:"Señala la posición del hijo derecho del padre que esta siendo evaluado actualmente."},
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

    /**
     * Realiza un proceso de heapificacion sobre el elemento 'i'
     * 
     * @param arr Array sobre el cual se realiza la heapificacion
     * @param nodes Cantidad de nodos contenidos en la heap
     * @param i Valor sobre el cual realizar la heapificacion
     */
    async heapify(arr: Array<[number,number]>, nodes: number, i: number){
        let biggest = i;
        let leftChild = (2 * i) + 1;
        let rightChild = (2 * i) + 2;
        this.colorServ.addColor(biggest,"#F39530");
        if(leftChild < nodes){
            this.colorServ.addColor(leftChild,"#00927D");
        }
        if(rightChild < nodes){
            this.colorServ.addColor(rightChild,"#4E585D");
        }
        await this.delayByRunSpeed();

        if(leftChild < nodes && arr[biggest][1] < arr[leftChild][1]){
            biggest = leftChild;
        }
        if(rightChild < nodes && arr[biggest][1] < arr[rightChild][1]){
            biggest = rightChild; 
        }
        if(biggest != i && !this.stopExec){
            this.swap(arr, biggest, i);
            await this.delayByRunSpeed();
            this.colorServ.revertToDefault(i);
            if(leftChild < nodes){
                this.colorServ.revertToDefault(leftChild);
            }
            if(rightChild < nodes){
                this.colorServ.revertToDefault(rightChild);
            }
            await this.heapify(arr, nodes, biggest);
        }
        this.colorServ.revertToDefault(i);
        if(leftChild < nodes){
            this.colorServ.revertToDefault(leftChild);
        }
        if(rightChild < nodes){
            this.colorServ.revertToDefault(rightChild);
        }
    }

    async sort(arr: Array<[number,number]>, delay: number){
        this.stopExec = false;
        this.delay = delay;
        let nodes = arr.length;
        let iSinceHasChild = Math.floor(nodes / 2) - 1;

        let i = iSinceHasChild;
        while(i > -1 && !this.stopExec){
            await this.heapify(arr, nodes, i);
            i -= 1;
        }

        let leftToOrder = nodes - 1;
        while(leftToOrder > 0 && !this.stopExec){
            this.colorServ.addColor(leftToOrder,"#AB2574");
            this.swap(arr,leftToOrder,0);
            await this.heapify(arr, leftToOrder, 0);
            leftToOrder -= 1;
        }
        if(!this.stopExec){
            this.colorServ.addColor(leftToOrder,"#AB2574");
            await this.delayByRunSpeed();
        }
        for(let i=0; i<nodes;i++){
            this.colorServ.revertToDefault(i);
        }
    }
}