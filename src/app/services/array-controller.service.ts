import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Swapper } from '../model/Swapper';

@Injectable({
  providedIn: 'root'
})
export class ArrayControllerService {
  size : number;
  arr : Array<[number,number]>;
  arrObservable : BehaviorSubject<Array<[number,number]>>;
  lastSwap : Swapper = {'indexA':-1,'indexB':-1};
  swapObservable : BehaviorSubject<Swapper>;

  constructor() { 
    this.size = 4;
    this.arr = this.getRandomArray(this.size);
    this.arrObservable = new BehaviorSubject<Array<[number,number]>>(this.arr);
    this.swapObservable = new  BehaviorSubject<Swapper>(this.lastSwap);
  }

  /**
   * Retorna el tamaño del array.
   * 
   * @returns Devuelve un entero que representa el size del array
   */
  getArraySize(){
    return this.size;
  }

  /**
   * Devuelve un numero random entre el rango (min,max)
   * 
   * @param min Entero que representa el valor minimo
   * @param max Entero que representa el valor maximo
   * @returns Valor random x entre min<=x<=max
   */
  randomIntFromInterval(min: number, max: number) { 
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  /**
   * Devuelve un array random de longitud len con valores que van desde 4 hasta len*3 y donde
   * no existen valores repetidos.
   * 
   * @param len Entero que representara la longitud del array
   * @returns Array random de longitud 'len' sin valores repetidos.
   */
  getRandomArray(len: number){
    let arr = new Array<[number,number]>();
    let appearedMap = new Map<number,boolean>();//To avoid repeated values in array
    appearedMap.set(-1,true);
    for (let i = 0; i < len; i++){
      let val = -1;
      while(appearedMap.get(val)){
        val = this.randomIntFromInterval(4,len*3);
      }
      appearedMap.set(val,true);
      arr.push([i,val]);
    }
    return arr;
  }

  /**
   * Genera un array random de tamaño newSize y llama a actualizar el observable.
   * 
   * @param newSize Entero que representa el nuevo tamaño deseado
   */
  updateArray(newSize: number){
    this.arr = this.getRandomArray(newSize);
    this.eventChange();
  }

  /**
   * Actualiza el observable otorgandole como next la instancia de array actual.
   * 
   */
  eventChange(){
    this.arrObservable.next(this.arr);
  }

  /**
   * Devuelve el array actual
   * @returns Devuelve el array actual
   */
  getCurrentArray(): Array<[number,number]>{
    return this.arr;
  }

  /**
   * Intercambia los valores de los indices 'A' y 'B' contenidos en la variable 'swap'.
   * 
   * @param swap intancia de tipo Swapper que representa los indices a swapear.
   */
  swapElements(swap: Swapper){
    let temp = this.arr[swap.indexA][1];
    this.arr[swap.indexA][1] = this.arr[swap.indexB][1];
    this.arr[swap.indexB][1] = temp;
    this.lastSwap = swap;
    this.swapObservable.next(this.lastSwap);
  }

  /**
   * Asigna al array actual al otorgado por parametro y llama a actualizar el observable.
   * 
   * @param arr Array a setear
   */
  setArray(arr: Array<[number,number]>){
    this.arr = arr;
    this.eventChange();
  }
}
