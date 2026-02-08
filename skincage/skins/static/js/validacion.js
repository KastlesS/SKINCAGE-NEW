'use strict'

//Creo un mensaje de error y una bandera para comprobar los campos
let error = document.createElement('span');
let flag;

function validarCampo(e) {
    //Obtengo el campo input que estamos modificando
    let campo = e.target;
    //Obtengo el padre
    let padre = campo.parentElement;
    //Quito los espacios en blaco
    let valor = campo.value.trim();

    //Añado estilos al error
    error.style.border = "2px solid red";
    error.style.borderRadius = "1px";
    error.style.backgroundColor = "#4d1b1b";
    
    //Si el campo está vacío:
    if (valor === "") {
        campo.style.border = "2px solid red";
        error.textContent = "El campo no puede estar vacío";
        //Añado texto al campo de error, hago que flag=false y añado el  error al padre del elemento
        flag = false;
        padre.appendChild(error);
    } else if (campo.id === "id_desgaste") {
        //Paso a valor flotante el valor del campo 
        let num = parseFloat(valor);
        console.log(num);
        //En mi lógica el Float o desgaste no puede ser igual o mayor que 1 e igual o menor que 0
        if (num >= 1 || num <= 0) {
            //Si se cumple está función hago lo mismo que con los campos vacíos
            campo.style.border = "2px solid red";
            error.textContent = "Valor del Float no válido";
            padre.appendChild(error);
            flag = false;

            //NOTA: no sé por qué cuando añado un valor correcto (ejemplo: 0.3456) me sale que el campo está vacío
        }
    }else{
        //Si todo está bien
        campo.style.border = "2px solid green";
        flag = true
        padre.removeChild(error);
    }
}

//Obtengo todos los campos del form
let campos = document.querySelectorAll("input");

//Añado los manejadores de evento a cada input
campos.forEach(input => {
    input.addEventListener("input", validarCampo);
});

//Obtengo el formulario
let formulario = document.getElementsByTagName('form');

//Le añado un addEventListener de tipo submit para el envío
formulario.addEventListener("submit", function(e){
    //Si la variable flag es flase no envío el formulario (no funciona debido al erorr del valor del desgaste o Float de arriba)
    (!flag)?e.preventDefault():'';
});