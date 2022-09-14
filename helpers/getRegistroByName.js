

const getRegistroByName = ( name = '', registros = [] ) => {

    console.log('Disparada funcion get registro by name');
    
    const nameParseado = name.toLowerCase().trim().split(' ').join('');

    if ( nameParseado.length === 0 ) return [];

    return registros.filter( registro => {
    //                                      podre pasarle un arreglo de banderas? 
    const regExpResult = new RegExp( nameParseado, "i" ).test( registro.nombre.split(' ').join(''));
    return regExpResult;
    } );
    
}

export default getRegistroByName;