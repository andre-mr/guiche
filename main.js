"use strict";

let match = false;
let pause = false;

const Type = {
    Convencional: 1,
    Preferencial: 2,
    Rapido: 3
}

let Cliente = {
    ClientType: 0, // enum const Type above
    ClientPatience: 0, // 1 to 10, affects complaints
    Complaint: false, // will depend on patience and time of waiting
    Documents: 0
}

const Guiche = {
    GuicheType: 0, // enum Type, type of client this guiche will serve
    Active: false,
    Speed: 0, // random generated guiche documents processing speed, from 1 to 5
    Pro: false, // pro guiche will work faster but more expensive
    DocumentsProcessed: 0, // number of docs processed from clients (also used to check if already activated and worked)
    Cliente // Client being served
}

const filaEntrada = [];
const filaConvencional = [];
const filaPreferencial = [];
const filaRapido = [];
const guiches = [{guiche1: Guiche},{guiche2: Guiche},{guiche3: Guiche},{guiche4: Guiche},{guiche5: Guiche},
    {guiche6: Guiche},{guiche7: Guiche},{guiche8: Guiche},{guiche9: Guiche}];

// functions //
function startup(){
    showScreen(1);
}

function showScreen(screen){
    switch(screen){
        case 3:
            screen1.style.display = "none";
            screen2.style.display = "none";
            screen3.style.display = "flex";
            break;
        case 2:
            screen1.style.display = "none";
            screen2.style.display = "flex";
            screen3.style.display = "none";
            break;
        default:
            screen1.style.display = "flex";
            screen2.style.display = "none";
            screen3.style.display = "none";
            break;
    }
}

function showMenu(menu){
    switch(menu){
        case 2:
            start.style.display = "none";
            statistics.style.display = "flex";
            break;
        case 1:
            start.style.display = "flex";
            statistics.style.display = "none";
            break;
    }
}

function guicheClick(guicheNum){
    // alert("você clicou no guichê " + guicheNum);
    if (guicheNum === 0){
        guicheListScreen.style.display = "flex";
        guicheSelectedScreen.style.display = "none";
    }else{
        guicheListScreen.style.display = "none";
        guicheSelectedScreen.style.display = "flex";
        guicheSelectedNumber.innerHTML = guicheNum;
    }
}

function guicheVoltar(){
    
}

let testObject = { 'one': 1, 'two': 2, 'three': 3 };

// Put the object into storage
sessionStorage.setItem('testObject', JSON.stringify(testObject));

// Retrieve the object from storage
let retrievedObject = sessionStorage.getItem('testObject');

console.log('retrievedObject: ', JSON.parse(retrievedObject));