'use strict'

//Parte Visualización de skins:
//Obtenemos los elementos html
let contenedorSkins = document.getElementById('skins');
let skins = document.querySelectorAll(".link-skin");

//Borramos los elementos obtenidos por Django
while(contenedorSkins.children.length > 0){
    contenedorSkins.removeChild(contenedorSkins.children[0]);
}

//Recorremos todos los elementos
skins.forEach(skin=>{
    console.log(skin.href);
    //Creamos la estructura de cartas
    let card = document.createElement('div');
    card.className = 'skin';
    let nombre = document.createElement('h3');
    let precio = document.createElement('p');
    let desgaste = document.createElement('p');
    //Como Django nos devuelve texto hago un trim por guiones y obtengo los campos del modelo con sus campos
    let objeto = skin.textContent.split('-');
    let actualizar = document.createElement('a');
    actualizar.textContent = "Actualizar";
    //Añadimos la url del html original
    actualizar.href = skin.href;
    nombre.textContent = objeto[0];
    precio.textContent = "Precio: " + objeto[1];
    desgaste.textContent = "Float: " + objeto[2];
    //Añado los elementos
    card.appendChild(nombre);
    card.appendChild(precio);
    card.appendChild(desgaste);
    card.appendChild(actualizar);
    contenedorSkins.appendChild(card);
})


const URL = "http://127.0.0.1:8000/api/skin-list/";

fetch(URL).then(response=>response.ok?response.json():response.reject()).then(skins=>{
    console.log(skins);
    skins.results.forEach(skin=>console.log(skin));
}).catch(error=>console.log(error));

