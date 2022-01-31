import { ArrayControllerService } from "../../services/array-controller.service";
import { ArrayColorerService } from "../../services/array-colorer.service";
import { ReferenceService } from "../../services/reference-service";
import { SortAlgorithm } from "../SortAlgorithm";
import { ColorReference } from "../ColorReference";
import { AuxVarService } from "src/app/services/aux-var.service";
import { EstadoEjecucionM } from "../EstadoEjecucionM";

interface IndexPair{
    iLeft : number,
    iRight : number
}

//Para la reproduccion manual
interface Node{
    iStart : number,
    iEnd : number,
    splitPoint: number;
    root : boolean;
    lHalf? : Node;
    rHalf? : Node;
}

export class MergeSort implements SortAlgorithm{
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
                [1, "MergeSortStart"],
                [2, "MergeSortStep"],
                [3, "Swap"],
                [4, "Increase I"],
                [5, "End"]
            ]);
        }

    /**
     * Crea un index tree que determina los indices de comienzo y final de todas las mitades que deben
     * ser establecidas durante el mergeSort para ordenar el array. Este metodo fue creado debido a que si bien el
     * mergeSort lo diseñamos de manera recursiva, en la ejecucion manual el proceso debe iterativizarse, y para ello
     * se decidio calcular de antemano todas las particiones que el merge sort realizaria y encapsularlas sobre un arbol
     * para poder de esta manera desligarnos de esta recursividad durante la ejecucion manual.
     * 
     * @param array Array sobre el cual crear el index tree
     * @param curNode Nodo actual
     * @param curInd Señala el indice de comienzo en el array sobre el cual se encuentra parado el primer
     * elemento de la mitad actual.
     * @param side Señala si la mitad actual es la mitad izquierda o derecha del padre del que salio
     * @returns Nodo ruta del index tree.
     */
    crearIndexTree(array : Array<number>, curNode: Node, curInd : number, side : string){
        let halfLenfth = curNode.root ? array.length : (curNode.iEnd - curNode.iStart) + 1;
        if(halfLenfth > 1){
            let middlePoint = Math.floor(halfLenfth / 2);
            
            let iATrackLeft = this.indexAdjustment(middlePoint,curInd,side,"left");
            let iATrackRigth = this.indexAdjustment(middlePoint,curInd,side,"right");
            curNode.splitPoint = iATrackLeft + middlePoint;

            let leftHalf : Node = {
                iStart: iATrackLeft,
                iEnd: iATrackRigth-1,
                splitPoint: -1,//Lo va a reescribir al correcto
                root: false
            };
            let rightHalf : Node = {
                iStart: iATrackRigth,
                iEnd: curNode.iEnd,
                splitPoint: -1,//Lo va a reescribir al correcto
                root: false
            };
            curNode.lHalf = leftHalf;
            curNode.rHalf = rightHalf;

            this.crearIndexTree(array, leftHalf, iATrackLeft, "left");
            this.crearIndexTree(array, rightHalf, iATrackRigth, "right");
        }
        return curNode;
    }

    /**
     * Dado la ruta del indexTree, recorre el mismo y coloce sobre el ordStack el orden a traves
     * del cual las diversas mitades deben ser ordenadas en pos de seguir el mismo procesamiento
     * que el mergeSort realizaria en su ejecucion recursiva.
     * 
     * @param node Nodo ruta que representa un indexTree
     * @param ordStack Order stack a llenar
     */
    buildOrderStack(node: Node, ordStack : Node[]){
        if(node.rHalf && node.lHalf){
            ordStack.push(node);
            this.buildOrderStack(node.rHalf,ordStack);
            this.buildOrderStack(node.lHalf,ordStack);
        }
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
                    let arrVal = this.getArrayValues(this.contrServ.getCurrentArray());
                    let root : Node = {
                        iStart : 0,
                        iEnd : arrVal.length-1,
                        root : true,
                        splitPoint: -1
                    };
                    let rootNode : Node = this.crearIndexTree(arrVal,root,-1,"");
                    let orderStack : Node[] = [];
                    this.buildOrderStack(rootNode, orderStack);
                    estado.estadoVariables = [this.contrServ.getCurrentArray(),
                                              orderStack];
                    break;
                case("MergeSortStart"):
                    if(estado.estadoVariables[1].length == 0){
                        break;
                    }
                    let cNode : Node = estado.estadoVariables[1].pop();
                    let arr = estado.estadoVariables[0];
                    this.colorServ.addColor(cNode.splitPoint,'#F39530');
                    if(cNode.rHalf && cNode.lHalf){
                        this.auxServ.setAuxVariable("Left half",this.getArrayValues(arr.slice(cNode.lHalf.iStart,cNode.lHalf.iEnd+1)));
                        this.auxServ.setAuxVariable("Right half",this.getArrayValues(arr.slice(cNode.rHalf.iStart, cNode.rHalf.iEnd+1)));
                        this.auxServ.setPriorityIndex("Left half",0);
                        this.auxServ.setPriorityIndex("Right half",0);
                    }
                    estado.estadoVariables[1].push(cNode);
                    break;
                case("MergeSortStep"):
                    let array = estado.estadoVariables[0];
                    let lHalf = estado.estadoVariables[2];
                    let rHalf = estado.estadoVariables[3];
                    let iLeft = estado.estadoVariables[4];
                    let iRight = estado.estadoVariables[5];
                    let iArray = estado.estadoVariables[6];
                    this.colorServ.addColor(estado.estadoVariables[7].splitPoint,'#F39530');
                    this.colorServ.addColor(iArray,"#4E585D");
                    if(iLeft < lHalf.length){
                        this.auxServ.addColor("Left half",iLeft,"#D2C993");
                    }
                    else{
                        this.auxServ.revertColorToDefault("Left half",iLeft-1);
                    }

                    if(iRight < rHalf.length){
                        this.auxServ.addColor("Right half",iRight,"#00927D");
                    }
                    else{
                        this.auxServ.revertColorToDefault("Right half",iRight-1);
                    }

                    if(iLeft < lHalf.length && iRight < rHalf.length){
                        if(lHalf[iLeft] <= rHalf[iRight]){
                            array[iArray][1] = lHalf[iLeft];
                            estado.estadoVariables[4] += 1;
                            this.auxServ.revertColorToDefault("Left half",iLeft);
                            this.auxServ.setPriorityIndex("Left half",iLeft+1);
                            this.auxServ.addColor("Left half",iLeft+1,"#D2C993");
                        }
                        else{
                            array[iArray][1] = rHalf[iRight];
                            estado.estadoVariables[5] += 1;
                            this.auxServ.revertColorToDefault("Right half",iRight);
                            this.auxServ.setPriorityIndex("Right half",iRight+1);
                            this.auxServ.addColor("Right half",iRight+1,"#00927D");
                        }
                    }
                    else{
                        if(iLeft < lHalf.length){
                            array[iArray][1] = lHalf[iLeft];
                            estado.estadoVariables[4] += 1;
                            this.auxServ.revertColorToDefault("Left half",iLeft);
                            this.auxServ.setPriorityIndex("Left half",iLeft+1);
                            this.auxServ.addColor("Left half",iLeft+1,"#D2C993");
                        }
                        else{
                            array[iArray][1] = rHalf[iRight];
                            estado.estadoVariables[5] += 1;
                            this.auxServ.revertColorToDefault("Right half",iRight);
                            this.auxServ.setPriorityIndex("Right half",iRight+1);
                            this.auxServ.addColor("Right half",iRight+1,"#00927D");
                        }
                    }
                    estado.estadoVariables[6] += 1;
                    await this.delayByRunSpeed();
                    await this.delayByRunSpeed();
                    this.colorServ.extractColor(iArray,"#4E585D");
                    if(estado.estadoVariables[6] < array.length && 
                       !(estado.estadoVariables[6] > estado.estadoVariables[7].iEnd)){
                        this.colorServ.addColor(estado.estadoVariables[6],"#4E585D");
                    }
                    break;
                case("End"):
                    this.colorServ.revertEverythingToDefault();
                    this.auxServ.deleteAuxVar("Left half");
                    this.auxServ.deleteAuxVar("Right half");
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
                    let arrSort = this.contrServ.getCurrentArray();
                    return {
                        estadoVariables : [estadoPrevio.estadoVariables[0],
                                           estadoPrevio.estadoVariables[1]
                                          ],//arrray, orderStack
                        codPasoRealizar : 1
                    };
                case("MergeSortStart"):
                    if(estadoPrevio.estadoVariables.length == 8){
                        this.colorServ.extractColor(estadoPrevio.estadoVariables[7].splitPoint,'#F39530');
                    }
                    let over = estadoPrevio.estadoVariables[1].length == 0;
                    if(!over){
                        let cNode = estadoPrevio.estadoVariables[1].pop();
                        let leftArr = this.getArrayValues(estadoPrevio.estadoVariables[0].slice(cNode.lHalf.iStart,cNode.lHalf.iEnd+1));
                        let rightArr = this.getArrayValues(estadoPrevio.estadoVariables[0].slice(cNode.rHalf.iStart, cNode.rHalf.iEnd+1));
                        return {
                            estadoVariables : [estadoPrevio.estadoVariables[0],
                                               estadoPrevio.estadoVariables[1],
                                               leftArr,
                                               rightArr,
                                               0,
                                               0,
                                               cNode.iStart,
                                               cNode
                                              ],//arrray, orderStack, left,right,iL, iR, i Array, parent
                            codPasoRealizar :  2
                        };
                    }
                    else{
                        return {
                            estadoVariables : [],//arrray, orderStack, iL, iR
                            codPasoRealizar : 5
                        };
                    }
                case("MergeSortStep"):
                    let stepOver = (estadoPrevio.estadoVariables[4] >= estadoPrevio.estadoVariables[2].length)
                                && (estadoPrevio.estadoVariables[5] >= estadoPrevio.estadoVariables[3].length);
                    if(stepOver){
                        this.auxServ.deleteAuxVar("Left half");
                        this.auxServ.deleteAuxVar("Right half");
                    }
                    return{
                        estadoVariables : [estadoPrevio.estadoVariables[0],
                                           estadoPrevio.estadoVariables[1],
                                           estadoPrevio.estadoVariables[2],
                                           estadoPrevio.estadoVariables[3],
                                           estadoPrevio.estadoVariables[4],
                                           estadoPrevio.estadoVariables[5],
                                           estadoPrevio.estadoVariables[6],
                                           estadoPrevio.estadoVariables[7]
                                          ],
                        codPasoRealizar : stepOver ? 1 : 2
                    };
                case("End"):
                    return { estadoVariables : [],codPasoRealizar : -1};
            }
        }
        return { estadoVariables : [],codPasoRealizar : -1};
    }
    
    /**
     * Setea las colorReferences que el algoritmo utilizara a traves del servicio ReferenceService
    */
    setReferences(){
        let referenceList : ColorReference[]= [
            {varName:'iMiddle',refColor:'#F39530', 
            descripcion:"Posición que marca que en ese índice se encuentra activa una separación entre dos mitades."},
            {varName:'iArr',refColor:'#4E585D',
            descripcion:"Índice que marca la posición del array siendo actualmente evaluada."},
            {varName:'iRight',refColor:'#00927D',
            descripcion:"Índice que itera sobre la mitad de la derecha."},
            {varName:'iLeft',refColor:'#D2C993',
            descripcion:"Índice que itera sobre la mitad de la izquierda."}
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
     * Funcion que detiene la ejecucion del programa y revierte todos los colores del array
     * a default a traves del servicio ArrayColorerService. A su vez, elimina todas las variables
     * auxiliares creadas.
     */
    stopExecution() : any{
        this.stopExec = true;
        this.auxServ.deleteAuxVar("Left half");
        this.auxServ.deleteAuxVar("Right half");
        this.colorServ.revertEverythingToDefault();
    }

    /**
     * Sincroniza el indice del primer elemento de la mitad actual en funcion al array
     * teniendo en cuenta el indice actual, el punto medio, y el lado sobre el cual
     * se esta realizando la particion
     * 
     * @param middlePoint Middle point de la mitad actual
     * @param curIn Indice actual
     * @param prevSide Lado de particion previa
     * @param curSide Señala si la mitad actual es la mitad izquierda o derecha del padre del que salio
     * @returns Indice de array sincronizado a la mitad actual.
     */
    indexAdjustment(middlePoint: number, curIn: number, prevSide: string, curSide: string){
        if(curIn == -1){
            if(curSide == "left"){
                return 0;
            }
            else{
                return middlePoint;
            }
        }     
        else{
            if(curSide == "left"){
                return curIn;
            }
            else{
                return curIn + middlePoint; 
            }
        }
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
     * Realiza el merging de la 'leftHalf' y la 'rightHalf' sobre el array 'array' a partir
     * de la posicion 'curInd'.
     * 
     * @param array Array sobre el cual se realiza el merge
     * @param leftHalf Array que representa la mitad izquierda
     * @param rightHalf Array que representa la mitad derecha
     * @param curInd Indice del array sobre el cual comenzar el merging.
     */
    async merge(array: Array<[number,number]>, leftHalf : Array<[number,number]>, 
          rightHalf: Array<[number,number]>, curInd: number){
            let iLeft = 0;
            let iRight = 0;
            let nLeft = this.getArrayValues(leftHalf);
            let nRight = this.getArrayValues(rightHalf);
            this.auxServ.setAuxVariable('Left Half', this.getArrayValues(leftHalf));
            this.auxServ.setAuxVariable('Right Half',this.getArrayValues(rightHalf));
            let iArray = curInd;
            while(iLeft < nLeft.length && iRight < nRight.length && !this.stopExec){
                this.colorServ.addColor(iArray,"#4E585D");
                this.auxServ.addColor('Left Half', iLeft, "#D2C993");
                this.auxServ.addColor('Right Half', iRight, "#00927D");
                await this.delayByRunSpeed();
                if(nLeft[iLeft] <= nRight[iRight] ){
                    array[iArray][1]  = nLeft[iLeft];
                    this.auxServ.revertColorToDefault('Left Half', iLeft) ;
                    iLeft += 1;
                    this.auxServ.setPriorityIndex('Left Half', iLeft);
                }
                else{
                    array[iArray][1]  = nRight[iRight];
                    this.auxServ.revertColorToDefault('Right Half', iRight);
                    iRight += 1;
                    this.auxServ.setPriorityIndex('Right Half', iRight);
                }
                this.colorServ.extractColor(iArray,"#4E585D");
                await this.delayByRunSpeed();
                iArray += 1;
            }

            while(iLeft < nLeft.length && !this.stopExec){
                this.colorServ.addColor(iArray,"#4E585D");
                this.auxServ.addColor('Left Half', iLeft, "#D2C993");
                array[iArray][1]  = nLeft[iLeft];
                await this.delayByRunSpeed();
                this.auxServ.revertColorToDefault('Left Half', iLeft);
                iLeft += 1;
                this.auxServ.setPriorityIndex('Left Half', iLeft);
                this.colorServ.extractColor(iArray,"#4E585D");
                iArray += 1;
            }

            while(iRight < nRight.length && !this.stopExec){
                this.colorServ.addColor(iArray,"#4E585D");
                this.auxServ.addColor('Right Half', iRight, "#00927D");
                array[iArray][1]  = nRight[iRight];
                await this.delayByRunSpeed();
                this.auxServ.revertColorToDefault('Right Half', iRight);
                iRight += 1;
                this.auxServ.setPriorityIndex('Right Half', iRight);
                this.colorServ.extractColor(iArray,"#4E585D");
                iArray += 1;
            }
            this.auxServ.setAuxVariable('Left Half', []);
            this.auxServ.setAuxVariable('Right Half', []);
    }

    /**
     * Realiza el proceso de mergeSort sobre el array 'array'.
     * 
     * @param array Array sobre el cual se hara el merge sort
     * @param curHalf Mitad actual siendo analizada
     * @param curInd Señala el indice de comienzo en el array sobre el cual se encuentra parado el primer
     * elemento de la mitad actual.
     * @param side Señala si la mitad actual es la mitad izquierda o derecha del padre del que salio
     */
    async mergeSort(array: Array<[number,number]>, curHalf:Array<[number,number]>, curInd : number, side : string){
        if(curHalf.length > 1 && !this.stopExec){
            let middlePoint = Math.floor(curHalf.length / 2);
            let leftHalf = curHalf.slice(0,middlePoint);
            let rightHalf = curHalf.slice(middlePoint);

            let iATrackLeft = this.indexAdjustment(middlePoint,curInd,side,"left");
            let iATrackRigth = this.indexAdjustment(middlePoint,curInd,side,"right");
            this.colorServ.addColor(iATrackRigth-1,"#F39530");
            await this.delayByRunSpeed();
            
            if(!this.stopExec){
                await this.mergeSort(array, leftHalf, iATrackLeft, "left");
            }
            if(!this.stopExec){
                await this.mergeSort(array, rightHalf, iATrackRigth, "right");
            }
            this.colorServ.extractColor(iATrackRigth-1,"#F39530");

            curInd = curInd == -1 ? 0 : curInd;
            if(!this.stopExec){
                await this.merge(array,leftHalf,rightHalf,curInd);
            }
        }
    }

    /**
     * Destruye las variables auxiliares 'Left Half' y 'Right Half' haciendo uso del
     * servicio AuxVarService.
     */
    killAuxiliarVariables(){
        this.auxServ.deleteAuxVar("Left Half");
        this.auxServ.deleteAuxVar("Right Half");
    }

    async sort(array: Array<[number,number]>, delay: number){
        this.stopExec = false;//If we are calling this method, we mean to run it
        this.delay = delay;
        await this.mergeSort(array,array,-1,"");
        this.killAuxiliarVariables();
        this.colorServ.revertEverythingToDefault();
    }
}