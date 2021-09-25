"use strict";

// simple variables
let match = false;
let pause = false;


// pseudo classes
const Type = {
    Standard: 1,
    Priority: 2,
    Express: 3
}

let Customer = {
    customerType: 0, // enum const Type above
    customerPatience: 0, // 1 to 10, affects complaints
    complaint: false, // will depend on patience and time of waiting
    documents: 0
}

const Teller = {
    tellerType: Type, // enum Type, type of customer this teller will serve
    active: false,
    speed: 0, // random generated teller documents processing speed, from 1 to 5
    pro: false, // pro teller will work faster but more expensive
    documentsProcessed: 0, // number of docs processed from customers (also used to check if already activated and worked)
    customer: Customer // customer being served
}

// objects
const lineReception = [];
const lineStandard = [];
const linePriority = [];
const lineExpress = [];
const tellers = [{teller1: Teller},{teller2: Teller},{teller3: Teller},{teller4: Teller},{teller5: Teller},
    {teller6: Teller},{teller7: Teller},{teller8: Teller},{teller9: Teller}];


window.addEventListener('load', (event) => {
    startup();
});


// functions //
function startup(){
    let tabFooters = document.getElementsByClassName("tabMainFooter");
    for (let t of tabFooters){
        t.addEventListener('click', selectMainSector, false);
    }
    tabFooters[0].click();
}

function selectMainSector(e){

    // change selected tab css class
    let tabFooters = document.getElementsByClassName("tabMainFooter");
    for (let t of tabFooters){
        t.className = t.className.replace(" active", "");
    }
    e.currentTarget.className += " active";

    // select corresponding sector
    switch(parseInt(e.currentTarget.tabIndex)){
        case 3:
            document.getElementById("lines").style.display = "flex";
            document.getElementById("tellers").style.display = "none";
            document.getElementById("start").style.display = "none";
        break;
        case 2:
            document.getElementById("lines").style.display = "none";
            document.getElementById("tellers").style.display = "flex";
            document.getElementById("start").style.display = "none";
        break;
        default:
            document.getElementById("lines").style.display = "none";
            document.getElementById("tellers").style.display = "none";
            document.getElementById("start").style.display = "flex";
        break;
    }
}


function showSubSector(){
    
}

function tellerClick(tellerNum){
    
}

function tellerBack(){
    
}


// SOME REFERENCE ABOUT STORING DATA INTO SESSIONSTORAGE (OR LOCALSTORAGE):

// let testObject = { 'one': 1, 'two': 2, 'three': 3 };

// // Put the object into storage
// sessionStorage.setItem('testObject', JSON.stringify(testObject));

// // Retrieve the object from storage
// let retrievedObject = sessionStorage.getItem('testObject');

// console.log('retrievedObject: ', JSON.parse(retrievedObject));