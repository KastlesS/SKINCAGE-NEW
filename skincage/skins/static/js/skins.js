'use strict'

//Parte Visualización de skins
let contenedorSkins = document.getElementById('skins');
let skins = document.querySelectorAll(".link-skin");

skins.forEach(item=>{
    let divSkin = document.createElement('div');
    divSkin.className = "skin";
    divSkin.appendChild(item);
    contenedorSkins.appendChild(divSkin);
    console.log(divSkin);
});


const URL = "http://127.0.0.1:8000/api/skin-list/";

fetch(URL).then(response=>response.ok?response.json():response.reject()).then(skins=>{
    console.log(skins);
    skins.results.forEach(skin=>console.log(skin));
}).catch(error=>console.log(error));