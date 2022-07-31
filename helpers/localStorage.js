
const guardarInLocalStorage = (data) => {

    const registros = JSON.stringify(data);
    localStorage.setItem( 'registros', registros );
}


const leerLocalStorage = () => {

    const data = JSON.parse(localStorage.getItem('registros'));
    if( !data ){
        return null;
    }

    return data;
}

export {
    guardarInLocalStorage,
    leerLocalStorage
}
