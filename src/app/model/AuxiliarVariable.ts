export interface DisplayStatus{
    leftHiding : boolean,//Define si en el display por pantalla existen elementos a la izquierda del array
    // de la variable auxiliar que actualmente no estan siendo visualizados por falta de espacio
    rightHiding : boolean, //Define si en el display por pantalla existen elementos a la derecha del array
    // de la variable auxiliar que actualmente no estan siendo visualizados por falta de espacio
    iStart : number, //Indice del array de la variable auxiliar que debido a que fue priorizado
    //se encuentra en el display en la 'primera posicion'
    iEnd : number //Indice del array de la variable auxiliar hasta el cual pudimos hacer un display en pantalla
  }

export interface AuxiliarVariable{
    varName: string,
    data: any,
    dataSize : number,
    colorList : string[],
    priorityIndex : number,//Indice del string que debemos priorizar, por temas de tamaño no podemos
    //mostrar todos por pantalla, asi que esta variable nos dira el elemento que debe mostrarse si o si
    displayStatus : DisplayStatus
}