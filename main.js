"use strict";

// objects

const GameFrameSpeed = {
    Slow: 1500,
    Normal: 1000,
    Fast: 750
}


// classes

// enum pattern:
class Type {
    static standard = new Type('C');
    static priority = new Type('P');
    static express = new Type('E');
    // static internal = new Type('I');

    constructor(name) {
        this.name = name;
    }

    toString() {
        return this.name;
    }
}

class Difficulty {
    static easy = new Type('easy');
    static normal = new Type('normal');
    static hard = new Type('hard');

    constructor(name) {
        this.name = name;
    }

    toString() {
        return this.name;
    }
}

class Customer {
    constructor(type, rage, complaint, documents, startTime, abandonTime) {
        this.type = type;
        this.rage = rage; // 0 to 10, affects complaints
        this.complaint = complaint; // boolean will depend on patience and time of waiting
        this.documents = documents;
        this.startTime = startTime; // to measure waiting time
        this.abandonTime = abandonTime
    }
}

class Teller {
    active = false;
    type = Type.standard; // enum Type, type of customer this teller will serve
    speed = 1; // random generated document processing speed, from 1 to 10
    pro = false; // pro teller will work faster but more expensive
    documentsProcessed = 0; // number of docs processed from customers (also used to check if already activated and worked)
    customer; // customer being served
    constructor(number) {
        this.number = number;
    }
}


// variables

// Records
let recordScoreEasy = 0;
let recordScoreNormal = 0;
let recordScoreHard = 0;
// let recordComplaints = 0;
let recordCalls = 0;
let recordDocuments = 0;
// let recordCallsOntime = 0;
// let recordCallsOvertime = 0;

// match
let matchScore = 0;
let matchComplaints = 0;
let matchCalls = 0;
let matchDocuments = 0;
let matchCallsOntime = 0;
let matchCallsOvertime = 0;
let matchStartBudget = 0;
let matchCurrentBudget = 0;

let match = false;
let pause = false;
let time = 0;
let loop;

let difficulty = Difficulty.normal;
let gameSpeed = GameFrameSpeed.Normal;
let generationDelay = 0;
let maxWaitingTime = 15;

let customerServingTime = -1;

// objects
let servingCustomer;
let selectedTeller;
const lineReception = [];
const lineStandard = [];
const linePriority = [];
const lineExpress = [];
const tellers = new Map([
    ["1", new Teller(1)],
    ["2", new Teller(2)],
    ["3", new Teller(3)],
    ["4", new Teller(4)],
    ["5", new Teller(5)],
    ["6", new Teller(6)],
    ["7", new Teller(7)],
    ["8", new Teller(8)],
    ["9", new Teller(9)],
]);

window.addEventListener('load', (event) => {
    startup();
});

// when game loads
function startup() {
    let tabFooters = document.getElementsByClassName("tabMainFooter");
    for (let tabFooter of tabFooters) {
        tabFooter.addEventListener('click', selectMainSector, false);
    }
    tabFooters[0].click();

    tabFooters = document.getElementsByClassName("tabStartFooter");
    for (let tabFooter of tabFooters) {
        tabFooter.addEventListener('click', selectStartSector, false);
    }
    tabFooters[0].click();

    let tellerElements = document.getElementsByClassName("teller");
    for (let tellerElement of tellerElements) {
        if (tellerElement.id !== "tellerSelected") {
            tellerElement.addEventListener('click', tellerSelect, false);
        }
    }

    document.getElementById("modalStop").style.display = "none";

    document.getElementById("modalStopCancel").addEventListener('click', modalStopCancel, false);

    document.getElementById("modalStopConfirm").addEventListener('click', modalStopConfirm, false);

    document.getElementById("difficultySelector").value = "normal";

    document.getElementById("buttonCustomerAccept").addEventListener('click', receptionAccept, false);

    document.getElementById("buttonCustomerRefuse").addEventListener('click', receptionRefuse, false);

    document.getElementById("buttonServe").addEventListener('click', receptionServe, false);

    document.getElementById("buttonStop").style.display = "none";

    document.getElementById("receptionCustomer").style.display = "none";

    document.getElementById("tellerEnable").addEventListener('click', tellerActivate, false);

    document.getElementById("tellerDisable").addEventListener('click', tellerDeactivate, false);

    document.getElementById("tellerSelectPro").addEventListener('change', tellerChangePro, false);

    document.getElementById("tellerSelectType").addEventListener('change', tellerChangeType, false);

    document.getElementById("buttonStart").addEventListener('click', startStopGame, false);

    document.getElementById("buttonStop").addEventListener('click', startStopGame, false);

    document.getElementById("tellerBack").addEventListener('click', tellerBack, false);
    tellerBack();

    for (let i = 1; i <= 9; i++) {
        document.getElementById("tellerType" + i).innerHTML = "-";
        document.getElementById("progressBar" + i).style.width = 0;
        document.getElementById("teller" + i).className =
            document.getElementById("teller" + i).className.replace(" tellerEnabled", "");
    }
}


// game loop
function startStopGame() {
    let buttonStart = document.getElementById("buttonStart");
    let buttonStop = document.getElementById("buttonStop");
    let difficultySelector = document.getElementById("difficultySelector");
    if (match) {
        document.getElementById("modalStop").style.display = "flex";
    } else {
        buttonStart.style.display = "none";
        buttonStop.style.display = "flex";
        document.getElementById("headerInfoTime").innerHTML = "09:50";
        switch (difficultySelector.value) {
            case "easy":
                difficulty = Difficulty.easy;
                gameSpeed = GameFrameSpeed.Slow;
                matchStartBudget = 1200;
                break;
            case "hard":
                difficulty = Difficulty.hard;
                gameSpeed = GameFrameSpeed.Fast;
                matchStartBudget = 800;
                break;
            default:
                difficulty = Difficulty.normal;
                gameSpeed = GameFrameSpeed.Normal;
                matchStartBudget = 1000;
                break;
        }
        difficultySelector.disabled = true;
        time = 590;
        // time = 790;
        match = true;
        generationDelay = Math.floor(Math.random() * 10);
        tellers.forEach(teller => {
            teller.active = false;
            teller.customer = undefined;
            teller.documentsProcessed = 0;
            teller.pro = false;
            teller.type = Type.standard;
            selectedTeller = teller;
            tellerDeactivate();
        });
        matchCurrentBudget = matchStartBudget;
        lineExpress.length = 0;
        linePriority.length = 0;
        lineReception.length = 0;
        lineStandard.length = 0;
        matchCalls = 0;
        matchCallsOntime = 0;
        matchCallsOvertime = 0;
        matchComplaints = 0;
        matchDocuments = 0;
        matchScore = 0;
        loop = setInterval(updateGame, gameSpeed);
    }
}

function updateGame() {
    if (!match) {
        clearInterval(loop);
    } else if (!pause) {
        time++;
        let hours;
        let minutes;
        hours = parseInt(time / 60).toFixed();
        minutes = (time % 60).toFixed();
        updateTimer(hours, minutes);
        updateTellerBars();
        updatelines();
        processDocuments();
        customerEntrance();
        customerCall();
        customerAbandon();
        updateStatistics();
        calculateScore();
        if (time >= 600 && time < 900) {
            generateCustomers();
        }
        if (time >= 960) {
            match = false;
            document.getElementById("buttonStart").style.display = "flex";
            document.getElementById("buttonStop").style.display = "none";
            document.getElementById("difficultySelector").disabled = false;
        }
    }
}


// game functions
function updateTimer(hours, minutes) {
    let headerInfoTime = document.getElementById("headerInfoTime");
    headerInfoTime.innerHTML
        = hours.padStart(2, '0') + ":" + minutes.padStart(2, '0');
    if (time > 840 && time < 960){
        if (time % 2 > 0){
            headerInfoTime.className += " critical";
        }else{
            headerInfoTime.className = headerInfoTime.className.replace(" critical", "");
        }
    }else{
        headerInfoTime.className = headerInfoTime.className.replace(" critical", "");
    }
}

function generateCustomers() {
    if (generationDelay <= 0) {
        let customer = new Customer();
        let type;
        switch (difficulty) {
            case Difficulty.easy:
                type = Math.floor(Math.random() * 100) + 1;
                if (type < 30) {
                    customer.type = Type.priority;
                } else {
                    customer.type = Type.standard;
                }
                customer.documents = Math.floor(Math.random() * 20) + 1;
                if (customer.documents <= 10){
                    customer.type = Type.express;
                }
                customer.rage = Math.floor(Math.random() * 3);
                customer.complaint = false;
                if (time > 840){
                    generationDelay = Math.floor(Math.random() * (15 - 1 + 1)) + 1;
                }else{
                    generationDelay = Math.floor(Math.random() * (20 - 5 + 1)) + 5;
                }
                break;
            case Difficulty.hard:
                type = Math.floor(Math.random() * 100) + 1;
                if (type < 50) {
                    customer.type = Type.priority;
                } else {
                    customer.type = Type.standard;
                }
                customer.documents = Math.floor(Math.random() * (50 - 10 + 1)) + 10;
                if (customer.documents <= 25){
                    customer.type = Type.express;
                }
                customer.rage = Math.floor(Math.random() * 10);
                customer.complaint = false;
                if (time > 840){
                    generationDelay = Math.floor(Math.random() * (5 - 1 + 1)) + 1;
                }else{
                    generationDelay = Math.floor(Math.random() * (10 - 1 + 1)) + 1;
                }
                break;
            default:
                type = Math.floor(Math.random() * 100) + 1;
                if (type < 40) {
                    customer.type = Type.priority;
                } else {
                    customer.type = Type.standard;
                }
                customer.documents = Math.floor(Math.random() * (30 - 5 + 1)) + 5;
                if (customer.documents <= 15){
                    customer.type = Type.express;
                }
                customer.rage = Math.floor(Math.random() * 6) + 1;
                customer.complaint = false;
                if (time > 840){
                    generationDelay = Math.floor(Math.random() * (10 - 1 + 1)) + 1;
                }else{
                    generationDelay = Math.floor(Math.random() * (15 - 1 + 1)) + 1;
                }
                break;
        }
        customer.startTime = time;
        customer.abandonTime = maxWaitingTime + (maxWaitingTime - customer.rage);
        lineReception.push(customer);
    } else {
        generationDelay--;
    }
}

function processDocuments() {
    let teller;
    for (let i = 1; i <= tellers.size; i++) {
        teller = tellers.get(i.toString());
        if (teller.active && teller.customer) {
            if (teller.pro && teller.customer.documents > 1) {
                teller.documentsProcessed += 2;
                matchDocuments += 2;
            } else {
                teller.documentsProcessed++;
                matchDocuments++;
            }
            if (teller.documentsProcessed > teller.customer.documents) {
                teller.documentsProcessed = 0;
                teller.customer = undefined;
            }
        }
    }
}

function customerEntrance(acceptedCustomer) {

    if (lineReception.length > 0) {
        let nextCustomer = lineReception[0];
        if (customerServingTime >= 0) {
            document.getElementById("servingCustomerTime").innerHTML = customerServingTime;
            customerServingTime--;
        } else {
            document.getElementById("receptionLine").style.display = "flex";
            document.getElementById("receptionCustomer").style.display = "none";
            if ((acceptedCustomer) || (time - nextCustomer.startTime >= 10)) {
                if (time - nextCustomer.startTime == maxWaitingTime) {
                    nextCustomer.complaint = customerComplaint(nextCustomer.rage);
                }
                if (nextCustomer.type == Type.priority) {
                    if (acceptedCustomer || linePriority.length == 0 || (time - linePriority[0].startTime < maxWaitingTime)) {
                        nextCustomer = lineReception.shift();
                        nextCustomer.startTime = time;
                        linePriority.push(nextCustomer);
                    }
                } else if (nextCustomer.type == Type.express) {
                    if (acceptedCustomer || lineExpress.length == 0 || (time - lineExpress[0].startTime < maxWaitingTime)) {
                        nextCustomer = lineReception.shift();
                        nextCustomer.startTime = time;
                        lineExpress.push(nextCustomer);
                    }
                } else {
                    if (acceptedCustomer || lineStandard.length == 0 || (time - lineStandard[0].startTime < maxWaitingTime)) {
                        nextCustomer = lineReception.shift();
                        nextCustomer.startTime = time;
                        lineStandard.push(nextCustomer);
                    }
                }
            }
        }
    }
}

function customerCall() {
    if (lineExpress.length > 0) {
        for (let teller of tellers) {
            if (teller[1].active && !teller[1].customer && teller[1].type == Type.express) {
                teller[1].customer = lineExpress.shift();
                matchCalls++;
                if (time - teller[1].customer.startTime > maxWaitingTime) {
                    matchCallsOvertime++;
                    if (!teller[1].customer.complaint) {
                        teller[1].customer.complaint = customerComplaint(teller[1].customer.rage);
                    }
                } else {
                    matchCallsOntime++;
                }
                if (teller[1].customer.complaint) {
                    matchComplaints++;
                }
                return;
            }
        }
    }
    if (linePriority.length > 0) {
        for (let teller of tellers) {
            if (teller[1].active && !teller[1].customer && teller[1].type == Type.priority) {
                teller[1].customer = linePriority.shift();
                matchCalls++;
                if (time - teller[1].customer.startTime > maxWaitingTime) {
                    matchCallsOvertime++;
                    if (!teller[1].customer.complaint) {
                        teller[1].customer.complaint = customerComplaint(teller[1].customer.rage);
                    }
                } else {
                    matchCallsOntime++;
                }
                if (teller[1].customer.complaint) {
                    matchComplaints++;
                }
                return;
            }
        }
    }
    if (lineStandard.length > 0) {
        for (let teller of tellers) {
            if (teller[1].active && !teller[1].customer && teller[1].type == Type.standard) {
                teller[1].customer = lineStandard.shift();
                matchCalls++;
                if (time - teller[1].customer.startTime > maxWaitingTime) {
                    matchCallsOvertime++;
                    if (!teller[1].customer.complaint) {
                        teller[1].customer.complaint = customerComplaint(teller[1].customer.rage);
                    }
                } else {
                    matchCallsOntime++;
                }
                if (teller[1].customer.complaint) {
                    matchComplaints++;
                }
                return;
            }
        }
    }
}

function updateTellerBars() {
    let progressBar;
    for (let i = 1; i <= tellers.size; i++) {
        let teller = tellers.get(i.toString());
        progressBar = document.getElementById("progressBar" + i);
        if (teller.active && teller.customer) {
            progressBar.style.width = (100 / teller.customer.documents) * teller.documentsProcessed + "%";
        } else {
            progressBar.style.width = "0%";
        }
    }
    if (selectedTeller) {
        if (selectedTeller.customer) {
            document.getElementById("progressBarSelected").style.width =
                (100 / selectedTeller.customer.documents) * selectedTeller.documentsProcessed + "%";
        } else {
            document.getElementById("progressBarSelected").style.width = "0";
        }
    }
}

function updatelines() {
    let progressBar = document.getElementById("progressBarLineReception");
    let customerCount = document.getElementById("customerCountReception");
    let timeCount = document.getElementById("timeCountReception");
    if (lineReception.length > 0) {
        let firstCustomerWaitingTime = (time - lineReception[0].startTime);
        progressBar.style.width =
            (firstCustomerWaitingTime * 10) + "%";
        if (firstCustomerWaitingTime > 10) {
            if (!progressBar.className.includes(" over")) {
                progressBar.className += " over";
            }
        } else {
            progressBar.className = progressBar.className.replace(" over", "");
        }
        customerCount.innerHTML = lineReception.length;
        timeCount.innerHTML = (firstCustomerWaitingTime);
    } else {
        progressBar.style.width = "0%";
        customerCount.innerHTML = "0";
        timeCount.innerHTML = "0";
    }

    progressBar = document.getElementById("progressBarLineStandard");
    customerCount = document.getElementById("customerCountStandard");
    timeCount = document.getElementById("timeCountStandard");
    if (lineStandard.length > 0) {
        let firstCustomerWaitingTime = (time - lineStandard[0].startTime);
        progressBar.style.width =
            (100 / maxWaitingTime) * (firstCustomerWaitingTime) + "%";
        if (firstCustomerWaitingTime >= maxWaitingTime) {
            if (!progressBar.className.includes(" over")) {
                progressBar.className += " over";
            }
        } else if (firstCustomerWaitingTime >= 10) {
            if (!progressBar.className.includes(" alert")) {
                progressBar.className += " alert";
            }
        } else {
            progressBar.className = progressBar.className.replace(" alert", "");
            progressBar.className = progressBar.className.replace(" over", "");
        }
        customerCount.innerHTML = lineStandard.length;
        timeCount.innerHTML = (firstCustomerWaitingTime);
    } else {
        progressBar.style.width = "0%";
        customerCount.innerHTML = "0";
        timeCount.innerHTML = "0";
    }

    progressBar = document.getElementById("progressBarLineExpress");
    customerCount = document.getElementById("customerCountExpress");
    timeCount = document.getElementById("timeCountExpress");
    if (lineExpress.length > 0) {
        let firstCustomerWaitingTime = (time - lineExpress[0].startTime);
        progressBar.style.width =
            (100 / maxWaitingTime) * (firstCustomerWaitingTime) + "%";
        if (firstCustomerWaitingTime >= maxWaitingTime) {
            if (!progressBar.className.includes(" over")) {
                progressBar.className += " over";
            }
        } else if (firstCustomerWaitingTime >= 10) {
            if (!progressBar.className.includes(" alert")) {
                progressBar.className += " alert";
            }
        } else {
            progressBar.className = progressBar.className.replace(" alert", "");
            progressBar.className = progressBar.className.replace(" over", "");
        }
        customerCount.innerHTML = lineExpress.length;
        timeCount.innerHTML = (firstCustomerWaitingTime);
    } else {
        progressBar.style.width = "0%";
        customerCount.innerHTML = "0";
        timeCount.innerHTML = "0";
    }

    progressBar = document.getElementById("progressBarLinePriority");
    customerCount = document.getElementById("customerCountPriority");
    timeCount = document.getElementById("timeCountPriority");
    if (linePriority.length > 0) {
        let firstCustomerWaitingTime = (time - linePriority[0].startTime);
        progressBar.style.width =
            (100 / maxWaitingTime) * (firstCustomerWaitingTime) + "%";
        if (firstCustomerWaitingTime >= maxWaitingTime) {
            if (!progressBar.className.includes(" over")) {
                progressBar.className += " over";
            }
        } else if (firstCustomerWaitingTime >= 10) {
            if (!progressBar.className.includes(" alert")) {
                progressBar.className += " alert";
            }
        } else {
            progressBar.className = progressBar.className.replace(" alert", "");
            progressBar.className = progressBar.className.replace(" over", "");
        }
        customerCount.innerHTML = linePriority.length;
        timeCount.innerHTML = (firstCustomerWaitingTime);
    } else {
        progressBar.style.width = "0%";
        customerCount.innerHTML = "0";
        timeCount.innerHTML = "0";
    }
}

function selectStartSector(e) {
    let tabFooters = document.getElementsByClassName("tabStartFooter");
    for (let t of tabFooters) {
        t.className = t.className.replace(" tabActive", "");
    }
    e.currentTarget.className += " tabActive";

    switch (parseInt(e.currentTarget.tabIndex)) {
        case 2:
            document.getElementById("menu").style.display = "none";
            document.getElementById("statistics").style.display = "flex";
            break;
        default:
            document.getElementById("menu").style.display = "flex";
            document.getElementById("statistics").style.display = "none";
            break;
    }
}

function selectMainSector(e) {

    // change selected tab css class
    let tabFooters = document.getElementsByClassName("tabMainFooter");
    for (let t of tabFooters) {
        t.className = t.className.replace(" tabActive", "");
    }
    e.currentTarget.className += " tabActive";

    // select corresponding sector
    switch (parseInt(e.currentTarget.tabIndex)) {
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

function tellerActivate() {
    //
    let tellerElement = document.getElementById("teller" + selectedTeller.number);
    let tellerType = document.getElementById("tellerType" + selectedTeller.number);
    let tellerImage;
    selectedTeller.active = true;

    for (let child of tellerElement.children) {
        if (child.className.includes("tellerImage")) {
            tellerImage = child;
            break;
        }
    }
    if (selectedTeller.pro) {
        if (!tellerImage.className.includes("pro")) {
            tellerImage.className += " pro";
        }
        updateBudget(-150);
    } else {
        tellerImage.className = tellerImage.className.replace(" pro", "");
        updateBudget(-100);
    }

    tellerType.innerHTML = selectedTeller.type;
    tellerElement.className += " tellerEnabled";

    tellerBack();
}

function tellerDeactivate() {
    //
    let tellerElement = document.getElementById("teller" + selectedTeller.number);
    let tellerType = document.getElementById("tellerType" + selectedTeller.number);
    let tellerImage;
    selectedTeller.active = false;
    matchCurrentBudget += 50;

    for (let child of tellerElement.children) {
        if (child.className.includes("tellerImage")) {
            tellerImage = child;
            break;
        }
    }
    tellerImage.className = tellerImage.className.replace(" pro", "");

    tellerType.innerHTML = "-";
    tellerElement.className = tellerElement.className.replace(" tellerEnabled", "");

    tellerBack();
}

function tellerChangeType() {
    let tellerSelectType = document.getElementById("tellerSelectType");
    let tellerTypeSelected = document.getElementById("tellerTypeSelected");

    switch (tellerSelectType.value) {
        // case "internal":
        //     selectedTeller.type = Type.internal;
        //     tellerTypeSelected.innerHTML = Type.internal.toString();
        //     break;
        case "express":
            selectedTeller.type = Type.express;
            tellerTypeSelected.innerHTML = Type.express.toString();
            break;
        case "priority":
            selectedTeller.type = Type.priority;
            tellerTypeSelected.innerHTML = Type.priority.toString();
            break;
        default:
            selectedTeller.type = Type.standard;
            tellerTypeSelected.innerHTML = Type.standard.toString();
            break;
    }

    if (selectedTeller.active) {
        document.getElementById("tellerType" + selectedTeller.number).innerHTML =
            selectedTeller.type;
    }
}

function tellerChangePro() {
    let tellerSelectPro = document.getElementById("tellerSelectPro");
    let tellerImage;
    for (let child of document.getElementById("tellerSelected").children) {
        if (child.className.includes("tellerImage")) {
            tellerImage = child;
            break;
        }
    }
    if (tellerSelectPro.value == "pro") {
        if (!tellerImage.className.includes("pro")) {
            tellerImage.className += " pro";
        }
        selectedTeller.pro = true;
    } else {
        tellerImage.className = tellerImage.className.replace(" pro", "");
        selectedTeller.pro = false;
    }
}

function tellerSelect(e) {
    document.getElementById("tellerSelectedContainer").style.display = "flex";
    document.getElementById("tellerList").style.display = "none";

    selectedTeller = tellers.get(e.currentTarget.id.replace("teller", ""));

    let tellerSelected = document.getElementById("tellerSelected");
    let tellerSelectedPro = document.getElementById("tellerSelectPro");
    let tellerSelectedType = document.getElementById("tellerSelectType");
    let tellerNumberSelected = document.getElementById("tellerNumberSelected");
    let tellerTypeSelected = document.getElementById("tellerTypeSelected");
    let tellerEnable = document.getElementById("tellerEnable");
    let tellerDisable = document.getElementById("tellerDisable");
    let tellerImage;
    for (let child of document.getElementById("tellerSelected").children) {
        if (child.className.includes("tellerImage")) {
            tellerImage = child;
            break;
        }
    }

    tellerNumberSelected.innerHTML = e.currentTarget.id.replace("teller", "")

    if (selectedTeller.active) {
        tellerTypeSelected.innerHTML = selectedTeller.type.toString();

        if (selectedTeller.pro) {
            tellerSelectedPro.value = "pro";
        } else {
            tellerSelectedPro.value = "regular";
        }
        tellerSelectedPro.disabled = true;

        switch (selectedTeller.type) {
            // case Type.internal:
            //     tellerSelectedType.value = "internal";
            //     break;
            case Type.priority:
                tellerSelectedType.value = "priority";
                break;
            case Type.express:
                tellerSelectedType.value = "express";
                break;
            default:
                tellerSelectedType.value = "standard";
                break;
        }

        if (selectedTeller.pro) {
            if (!tellerImage.className.includes("pro")) {
                tellerImage.className += " pro";
            }

        } else {
            tellerImage.className = tellerImage.className.replace(" pro", "");
        }

        tellerEnable.style.display = "none";
        tellerDisable.style.display = "flex";
    } else {
        tellerTypeSelected.innerHTML = Type.standard.toString();
        tellerSelectedPro.value = "regular";
        tellerSelectedPro.disabled = false;
        tellerSelectedType.selectedIndex = 0;

        tellerImage.className = tellerImage.className.replace(" pro", "");
        tellerEnable.style.display = "flex";
        tellerDisable.style.display = "none";
    }

    if (!match) {
        tellerEnable.disabled = true;
    } else {
        tellerEnable.disabled = false;
    }

    if (selectedTeller.active) {
        tellerSelected.className += " tellerEnabled";
    } else {
        tellerSelected.className = tellerSelected.className.replace(" tellerEnabled", "");
    }
}

function tellerBack() {
    document.getElementById("tellerSelectedContainer").style.display = "none";
    document.getElementById("tellerList").style.display = "flex";
    selectedTeller = undefined;
}

function receptionServe() {
    if (lineReception.length > 0) {
        document.getElementById("receptionLine").style.display = "none";
        document.getElementById("receptionCustomer").style.display = "flex";

        document.getElementById("lineInfoDocuments").innerHTML = lineReception[0].documents;

        let customerType = document.getElementById("customerType");
        switch (lineReception[0].type) {
            case Type.express:
                customerType.value = "express";
                break;
            case Type.priority:
                customerType.value = "priority";
                break;
            default:
                customerType.value = "standard";
                break;
        }
        customerServingTime = 10;
        document.getElementById("servingCustomerTime").innerHTML = customerServingTime;
    }
}

function receptionAccept() {
    let nextCustomer = lineReception[0];
    let customerType = document.getElementById("customerType");
    switch (customerType.value) {
        case "express":
            nextCustomer.type = Type.express;
            break;
        case "priority":
            nextCustomer.type = Type.priority;
            break;
        default:
            nextCustomer.type = Type.standard;
            break;
    }
    customerServingTime = -1;
    customerEntrance(nextCustomer);
}

function receptionRefuse() {
    let nextCustomer = lineReception.shift();
    if (!nextCustomer.complaint) {
        nextCustomer.rage * 2;
        nextCustomer.complaint = customerComplaint(nextCustomer.rage);
    }
    if (nextCustomer.complaint) {
        matchComplaints++;
    }
    document.getElementById("servingCustomerTime").innerHTML = "0";
    document.getElementById("receptionLine").style.display = "flex";
    document.getElementById("receptionCustomer").style.display = "none";
    customerServingTime = -1;
}

function customerComplaint(rage) {
    return Math.floor(Math.random() * 10) < rage;
}

function customerAbandon() {
    let abandoningCustomer;
    for (let i = 0; i < lineReception.length; i++) {
        if (i == 0 && customerServingTime >= 0) {
            continue;
        }
        if (time - lineReception[i].startTime > lineReception[i].abandonTime) {
            abandoningCustomer = lineReception[i];
            if (!abandoningCustomer.complaint) {
                abandoningCustomer.rage * 2;
                abandoningCustomer.complaint = customerComplaint(abandoningCustomer.rage);
            }
            if (abandoningCustomer.complaint) {
                matchComplaints++;
            }
            lineReception.splice(i, 1);
            return;
        }
    }
    for (let i = 0; i < lineStandard.length; i++) {
        if (time - lineStandard[i].startTime > lineStandard[i].abandonTime) {
            abandoningCustomer = lineStandard[i];
            if (!abandoningCustomer.complaint) {
                abandoningCustomer.rage = Math.floor(Math.random() * 10);
                abandoningCustomer.complaint = customerComplaint(abandoningCustomer.rage);
            }
            if (abandoningCustomer.complaint) {
                matchComplaints++;
            }
            lineStandard.splice(i, 1);
            return;
        }
    }
    for (let i = 0; i < linePriority.length; i++) {
        if (time - linePriority[i].startTime > linePriority[i].abandonTime) {
            abandoningCustomer = linePriority[i];
            if (!abandoningCustomer.complaint) {
                abandoningCustomer.rage = Math.floor(Math.random() * 10);
                abandoningCustomer.complaint = customerComplaint(abandoningCustomer.rage);
            }
            if (abandoningCustomer.complaint) {
                matchComplaints++;
            }
            linePriority.splice(i, 1);
            return;
        }
    }
    for (let i = 0; i < lineExpress.length; i++) {
        if (time - lineExpress[i].startTime > lineExpress[i].abandonTime) {
            abandoningCustomer = lineExpress[i];
            if (!abandoningCustomer.complaint) {
                abandoningCustomer.rage = Math.floor(Math.random() * 10);
                abandoningCustomer.complaint = customerComplaint(abandoningCustomer.rage);
            }
            if (abandoningCustomer.complaint) {
                matchComplaints++;
            }
            lineExpress.splice(i, 1);
            return;
        }
    }
}

function updateStatistics() {
    document.getElementById("statisticsRecordCalls").innerHTML = recordCalls;
    document.getElementById("statisticsRecordDocuments").innerHTML = recordDocuments;
    document.getElementById("statisticsRecordScoreEasy").innerHTML = recordScoreEasy;
    document.getElementById("statisticsRecordScoreNormal").innerHTML = recordScoreNormal;
    document.getElementById("statisticsRecordScoreHard").innerHTML = recordScoreHard;

    document.getElementById("statisticsMatchCalls").innerHTML = matchCalls;
    document.getElementById("statisticsMatchCallsOntime").innerHTML = matchCallsOntime;
    document.getElementById("statisticsMatchCallsOvertime").innerHTML = matchCallsOvertime;
    document.getElementById("statisticsMatchDocuments").innerHTML = matchDocuments;
    document.getElementById("statisticsMatchComplaints").innerHTML = matchComplaints;
    document.getElementById("statisticsMatchCurrentBudget").innerHTML = matchCurrentBudget;

    let headerInfoGame = document.getElementById("headerInfoGame");
    headerInfoGame.innerHTML = matchScore;
    if (matchScore <= 0){
        if (!headerInfoGame.className.includes(" critical")){
            headerInfoGame.className += " critical";
        }
    }else{
        headerInfoGame.className = headerInfoGame.className.replace(" critical", "");
    }
}

function updateBudget(amount) {
    // matchCurrentBudget = matchStartBudget
    //     - matchComplaints * 100
    //     - matchCallsOvertime * 50;
    matchCurrentBudget += amount;
}

function calculateScore() {
    matchScore
        = matchDocuments
        + matchCurrentBudget * Math.floor(matchCurrentBudget / matchStartBudget + 1)
        + matchCallsOntime * 10 * Math.floor(matchCallsOntime / matchCalls + 1)
        - Math.floor((matchComplaints * 10 * matchStartBudget) / matchCalls);
    if (Number.isNaN(matchScore)) {
        matchScore = 0;
    }
}

function modalStopCancel() {
    document.getElementById("modalStop").style.display = "none";
}

function modalStopConfirm() {
    let buttonStart = document.getElementById("buttonStart");
    let buttonStop = document.getElementById("buttonStop");
    let difficultySelector = document.getElementById("difficultySelector");

    document.getElementById("modalStop").style.display = "none";
    match = false;
    buttonStart.style.display = "flex";
    buttonStop.style.display = "none";
    difficultySelector.disabled = false;
}

// SOME REFERENCE ABOUT STORING DATA INTO SESSIONSTORAGE (OR LOCALSTORAGE):

// let testObject = { 'one': 1, 'two': 2, 'three': 3 };

// // Put the object into storage
// sessionStorage.setItem('testObject', JSON.stringify(testObject));

// // Retrieve the object from storage
// let retrievedObject = sessionStorage.getItem('testObject');

// console.log('retrievedObject: ', JSON.parse(retrievedObject));