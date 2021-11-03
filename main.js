"use strict";

const GameFrameSpeed = {
    Slow: 2000,
    Normal: 1500,
    Fast: 1000
}

const Game = {
    recordScoreEasy: 0,
    recordScoreNormal: 0,
    recordScoreHard: 0,
    recordCalls: 0,
    recordDocuments: 0,
    totalMatches: 0
}

// enum pattern:
class Type {
    static standard = new Type('C');
    static priority = new Type('P');
    static express = new Type('E');

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
        this.rage = rage;
        this.complaint = complaint;
        this.documents = documents;
        this.startTime = startTime;
        this.abandonTime = abandonTime
    }
}

class Teller {
    active = false;
    type = Type.standard;
    speed = 1;
    pro = false;
    documentsProcessed = 0;
    customer;
    constructor(number) {
        this.number = number;
    }
}


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

function startup() {
    loadGame();
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

    document.getElementById("buttonCustomerAccept").addEventListener('click', receptionAccept, false);

    document.getElementById("buttonCustomerRefuse").addEventListener('click', receptionRefuse, false);

    document.getElementById("buttonServe").addEventListener('click', receptionServe, false);

    document.getElementById("buttonStop").style.display = "none";

    document.getElementById("receptionCustomer").style.display = "none";

    document.getElementById("tellerEnable").addEventListener('click', tellerActivate, false);

    document.getElementById("tellerDisable").addEventListener('click', tellerDeactivate, false);

    document.getElementById("proInput").addEventListener('click', tellerChangePro, false);

    document.getElementById("standardInputSelectedTeller").addEventListener('click', tellerChangeType, false);

    document.getElementById("priorityInputSelectedTeller").addEventListener('click', tellerChangeType, false);

    document.getElementById("expressInputSelectedTeller").addEventListener('click', tellerChangeType, false);

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
    updateStatistics();

    document.getElementById("headerInfoGame").innerHTML = "-";
}


// game loop
function startStopGame() {
    let buttonStart = document.getElementById("buttonStart");
    let buttonStop = document.getElementById("buttonStop");
    let easyInput = document.getElementById("easyInput");
    let hardInput = document.getElementById("hardInput");
    let normalInput = document.getElementById("normalInput");

    if (easyInput.checked) {
        difficulty = Difficulty.easy;
    } else if (hardInput.checked) {
        difficulty = Difficulty.hard;
    } else {
        difficulty = Difficulty.normal;
    }

    if (match) {
        document.getElementById("modalStop").style.display = "flex";
    } else {
        buttonStart.style.display = "none";
        buttonStop.style.display = "flex";
        document.getElementById("headerInfoTime").innerHTML = "--:--";
        switch (difficulty) {
            case Difficulty.easy:
                gameSpeed = GameFrameSpeed.Slow;
                matchStartBudget = 900;
                break;
            case Difficulty.hard:
                gameSpeed = GameFrameSpeed.Fast;
                matchStartBudget = 700;
                break;
            default:
                gameSpeed = GameFrameSpeed.Normal;
                matchStartBudget = 800;
                break;
        }
        easyInput.disabled = true;
        hardInput.disabled = true;
        normalInput.disabled = true;
        time = 589;
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
            document.getElementById("easyInput").disabled = false;
            document.getElementById("hardInput").disabled = false;
            document.getElementById("normalInput").disabled = false;
            endGame();
        }
    }
}

function updateTimer(hours, minutes) {
    let headerInfoTime = document.getElementById("headerInfoTime");
    headerInfoTime.innerHTML
        = hours.padStart(2, '0') + ":" + minutes.padStart(2, '0');
    if (time > 840 && time < 960) {
        if (time % 2 > 0) {
            headerInfoTime.className += " critical";
        } else {
            headerInfoTime.className = headerInfoTime.className.replace(" critical", "");
        }
    } else {
        headerInfoTime.className = headerInfoTime.className.replace(" critical", "");
    }
}

function generateCustomers() {
    if (generationDelay <= 0) {
        let customer = new Customer();
        let typeChance = Math.floor(Math.random() * 100) + 1;

        if (typeChance < 40 || (time < 660 && typeChance < 50)) {
            customer.type = Type.priority;
        } else {
            customer.type = Type.standard;
        }
        if (customer.type == Type.priority) {
            customer.documents = Math.floor(Math.random() * (50 - 10 + 1)) + 10;
        } else {
            customer.documents = Math.floor(Math.random() * (40 - 5 + 1)) + 5;
        }
        if (time > 840) {
            generationDelay = Math.floor(Math.random() * 5) + 1;
        } else {
            generationDelay = Math.floor(Math.random() * 10) + 1;
        }

        switch (difficulty) {
            case Difficulty.easy:
                customer.rage = Math.floor(Math.random() * 4) + 1;
                break;

            case Difficulty.hard:
                customer.rage = Math.floor(Math.random() * 8) + 1;
                break;

            default:
                customer.rage = Math.floor(Math.random() * 6) + 1;
                break;
        }

        if (customer.documents <= 10 || ((time >= 720 && time < 780) && customer.documents <= 20)) {
            customer.type = Type.express;
        }

        customer.complaint = false;
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

    let nextCustomer;

    if (acceptedCustomer) {
        nextCustomer = acceptedCustomer;
    } else if (lineReception.length > 0 && (time - lineReception[0].startTime >= 10)) {
        nextCustomer = lineReception.shift();
    } else if (servingCustomer && customerServingTime < 0) {
        nextCustomer = servingCustomer;
        servingCustomer = undefined;
    }

    if (nextCustomer) {
        if (time - nextCustomer.startTime == maxWaitingTime) {
            nextCustomer.complaint = customerComplaint(nextCustomer.rage);
        }
        if (nextCustomer.type == Type.priority) {
            if (acceptedCustomer || linePriority.length == 0 || (time - linePriority[0].startTime < maxWaitingTime)) {
                nextCustomer.startTime = time;
                linePriority.push(nextCustomer);
            }
        } else if (nextCustomer.type == Type.express) {
            if (acceptedCustomer || lineExpress.length == 0 || (time - lineExpress[0].startTime < maxWaitingTime)) {
                nextCustomer.startTime = time;
                lineExpress.push(nextCustomer);
            }
        } else {
            if (acceptedCustomer || lineStandard.length == 0 || (time - lineStandard[0].startTime < maxWaitingTime)) {
                nextCustomer.startTime = time;
                lineStandard.push(nextCustomer);
            }
        }
    }

    if (customerServingTime >= 0) {
        document.getElementById("servingCustomerTime").innerHTML = customerServingTime;
        customerServingTime--;
    } else {
        document.getElementById("receptionLine").style.display = "flex";
        document.getElementById("receptionCustomer").style.display = "none";
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
                    if (difficulty == Difficulty.hard && !teller[1].customer.complaint) {
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

    let tabFooters = document.getElementsByClassName("tabMainFooter");
    for (let t of tabFooters) {
        t.className = t.className.replace(" tabActive", "");
    }
    e.currentTarget.className += " tabActive";

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
        updateBudget(-200);
    } else {
        tellerImage.className = tellerImage.className.replace(" pro", "");
        updateBudget(-100);
    }

    tellerType.innerHTML = selectedTeller.type;
    tellerElement.className += " tellerEnabled";

    tellerBack();
}

function tellerDeactivate() {
    let tellerElement = document.getElementById("teller" + selectedTeller.number);
    let tellerType = document.getElementById("tellerType" + selectedTeller.number);
    let tellerImage;
    selectedTeller.active = false;
    if (selectedTeller.pro) {
        matchCurrentBudget += 30;
    } else {
        matchCurrentBudget += 50;
    }

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
    let tellerTypeSelected = document.getElementById("tellerTypeSelected");
    let tellerSelectType;
    if (document.getElementById("priorityInputSelectedTeller").checked) {
        tellerSelectType = Type.priority;
    } else if (document.getElementById("expressInputSelectedTeller").checked) {
        tellerSelectType = Type.express;
    } else {
        tellerSelectType = Type.standard;
    }

    switch (tellerSelectType) {
        case Type.priority:
            selectedTeller.type = Type.priority;
            tellerTypeSelected.innerHTML = Type.priority.toString();
            break;
        case Type.express:
            selectedTeller.type = Type.express;
            tellerTypeSelected.innerHTML = Type.express.toString();
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
    let tellerRadioPro = document.getElementById("proInput");
    let tellerImage;
    for (let child of document.getElementById("tellerSelected").children) {
        if (child.className.includes("tellerImage")) {
            tellerImage = child;
            break;
        }
    }
    if (!selectedTeller.pro) {
        if (!tellerImage.className.includes("pro")) {
            tellerImage.className += " pro";
        }
        selectedTeller.pro = true;
        tellerRadioPro.checked = true;
    } else {
        tellerImage.className = tellerImage.className.replace(" pro", "");
        selectedTeller.pro = false;
        tellerRadioPro.checked = false;
    }
}

function tellerSelect(e) {
    document.getElementById("tellerSelectedContainer").style.display = "flex";
    document.getElementById("tellerList").style.display = "none";

    selectedTeller = tellers.get(e.currentTarget.id.replace("teller", ""));

    let tellerSelected = document.getElementById("tellerSelected");
    let tellerRadioPro = document.getElementById("proInput");
    let tellerRadioStandard = document.getElementById("standardInputSelectedTeller");
    let tellerRadioPriority = document.getElementById("priorityInputSelectedTeller");
    let tellerRadioExpress = document.getElementById("expressInputSelectedTeller");

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
            tellerRadioPro.checked = true;
        } else {
            tellerRadioPro.checked = false;
        }
        tellerRadioPro.disabled = true;

        switch (selectedTeller.type) {
            case Type.priority:
                tellerRadioPriority.checked = true;
                tellerRadioExpress.checked = false;
                tellerRadioStandard.checked = false;
                break;
            case Type.express:
                tellerRadioPriority.checked = false;
                tellerRadioExpress.checked = true;
                tellerRadioStandard.checked = false;
                break;
            default:
                tellerRadioPriority.checked = false;
                tellerRadioExpress.checked = false;
                tellerRadioStandard.checked = true;
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
        tellerRadioPro.checked = false;
        tellerRadioPro.disabled = false;
        tellerRadioStandard.checked = true;

        tellerImage.className = tellerImage.className.replace(" pro", "");
        tellerEnable.style.display = "flex";
        tellerDisable.style.display = "none";
    }

    if (!match) {
        tellerEnable.disabled = true;
    } else {
        tellerEnable.disabled = false;
    }

    if (time < 900 || selectedTeller.customer) {
        tellerDisable.disabled = true;
        if (!tellerDisable.className.includes(" disabledButton")) {
            tellerDisable.className += " disabledButton";
        }
    } else {
        tellerDisable.disabled = false;
        tellerDisable.className = tellerDisable.className.replace(" disabledButton", "");
    }

    if (!match) {
        if (!tellerEnable.className.includes(" disabledButton")) {
            tellerEnable.className += " disabledButton";
        }
    } else {
        tellerEnable.className = tellerEnable.className.replace(" disabledButton", "");
    }

    if (selectedTeller.active) {
        if (!tellerSelected.className.includes(" tellerEnabled")) {
            tellerSelected.className += " tellerEnabled";
        }
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

        servingCustomer = lineReception.shift();
        switch (servingCustomer.type) {
            case Type.express:
                document.getElementById("expressInputReception").checked = true;
                break;
            case Type.priority:
                document.getElementById("priorityInputReception").checked = true;
                break;
            default:
                document.getElementById("standardInputReception").checked = true;
                break;
        }
        customerServingTime = 9;
        document.getElementById("servingCustomerTime").innerHTML = customerServingTime;
    }
}

function receptionAccept() {
    let nextCustomer = servingCustomer;
    let customerOriginaltype = nextCustomer.type;

    if (document.getElementById("priorityInputReception").checked) {
        nextCustomer.type = Type.priority;
    } else if (document.getElementById("expressInputReception").checked) {
        nextCustomer.type = Type.express;
    } else {
        nextCustomer.type = Type.standard;
    }

    if (nextCustomer.type != customerOriginaltype) {
        nextCustomer.complaint = customerComplaint(nextCustomer.rage);
    }
    customerServingTime = -1;
    servingCustomer = undefined;
    customerEntrance(nextCustomer);
}

function receptionRefuse() {
    let nextCustomer = servingCustomer;
    if (!nextCustomer.complaint) {
        nextCustomer.rage = Math.floor(Math.random() * 10);
        nextCustomer.complaint = customerComplaint(nextCustomer.rage);
    }
    if (nextCustomer.complaint) {
        matchComplaints++;
    }
    document.getElementById("servingCustomerTime").innerHTML = "0";
    document.getElementById("receptionLine").style.display = "flex";
    document.getElementById("receptionCustomer").style.display = "none";
    customerServingTime = -1;
    servingCustomer = undefined;
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
            matchComplaints++;
            lineReception.splice(i, 1);
            return;
        }
    }
    for (let i = 0; i < lineStandard.length; i++) {
        if (time - lineStandard[i].startTime > lineStandard[i].abandonTime) {
            abandoningCustomer = lineStandard[i];
            if (!abandoningCustomer.complaint) {
                abandoningCustomer.rage *= 2;
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
                abandoningCustomer.rage *= 2;
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
                abandoningCustomer.rage *= 2;
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
    document.getElementById("statisticsRecordCalls").innerHTML = Game.recordCalls;
    document.getElementById("statisticsRecordDocuments").innerHTML = Game.recordDocuments;
    document.getElementById("statisticsRecordScoreEasy").innerHTML = Game.recordScoreEasy;
    document.getElementById("statisticsRecordScoreNormal").innerHTML = Game.recordScoreNormal;
    document.getElementById("statisticsRecordScoreHard").innerHTML = Game.recordScoreHard;
    document.getElementById("statisticsTotalMatches").innerHTML = Game.totalMatches;

    document.getElementById("statisticsMatchCalls").innerHTML = matchCalls;
    document.getElementById("statisticsMatchCallsOntime").innerHTML = matchCallsOntime;
    document.getElementById("statisticsMatchCallsOvertime").innerHTML = matchCallsOvertime;
    document.getElementById("statisticsMatchDocuments").innerHTML = matchDocuments;
    document.getElementById("statisticsMatchComplaints").innerHTML = matchComplaints;
    document.getElementById("statisticsMatchCurrentBudget").innerHTML = matchCurrentBudget;

    let headerInfoGame = document.getElementById("headerInfoGame");
    headerInfoGame.innerHTML = matchScore;
    if (matchScore < 0) {
        if (!headerInfoGame.className.includes(" critical")) {
            headerInfoGame.className += " critical";
        }
    } else {
        headerInfoGame.className = headerInfoGame.className.replace(" critical", "");
    }
}

function updateBudget(amount) {
    matchCurrentBudget += amount;
}

function calculateScore() {
    matchScore
        = Math.floor(matchDocuments
            * (matchCurrentBudget / matchStartBudget) * 5
            + matchCallsOntime * 100 * ((matchCallsOntime / matchCalls) + 1)
            - matchComplaints * (matchStartBudget - matchCurrentBudget));
    if (Number.isNaN(matchScore) || matchCurrentBudget <= 0) {
        matchScore = 0;
    }
}

function modalStopCancel() {
    document.getElementById("modalStop").style.display = "none";
}

function modalStopConfirm() {
    let buttonStart = document.getElementById("buttonStart");
    let buttonStop = document.getElementById("buttonStop");

    document.getElementById("modalStop").style.display = "none";
    buttonStart.style.display = "flex";
    buttonStop.style.display = "none";
    document.getElementById("easyInput").disabled = false;
    document.getElementById("hardInput").disabled = false;
    document.getElementById("normalInput").disabled = false;

    match = false;
    Game.totalMatches++;
    saveGame();
    updateStatistics();
}

function endGame() {
    let teller;
    for (let i = 1; i <= tellers.size; i++) {
        teller = tellers.get(i.toString());
        if (teller.customer) {
            matchComplaints++;
            matchDocuments -= (teller.customer.documents - teller.documentsProcessed);
        }
    }
    calculateScore();

    Game.totalMatches++;
    if (matchCalls > Game.recordCalls) {
        Game.recordCalls = matchCalls;
    }
    if (matchDocuments > Game.recordDocuments) {
        Game.recordDocuments = matchDocuments;
    }
    switch (difficulty) {
        case Difficulty.easy:
            if (matchScore > Game.recordScoreEasy) {
                Game.recordScoreEasy = matchScore;
            }
            break;
        case Difficulty.hard:
            if (matchScore > Game.recordScoreHard) {
                Game.recordScoreHard = matchScore;
            }
            break;
        default:
            if (matchScore > Game.recordScoreNormal) {
                Game.recordScoreNormal = matchScore;
            }
            break;
    }
    saveGame();
    updateStatistics();
}

function saveGame() {
    let saveGame = Game;
    localStorage.setItem('saveGame', JSON.stringify(saveGame));
}

function loadGame() {
    let loadGame = localStorage.getItem('saveGame');
    let loadedGame;
    if (loadGame) {
        loadedGame = JSON.parse(loadGame);
        Game.totalMatches = loadedGame.totalMatches;
        Game.recordCalls = loadedGame.recordCalls;
        Game.recordDocuments = loadedGame.recordDocuments;
        Game.recordScoreEasy = loadedGame.recordScoreEasy;
        Game.recordScoreHard = loadedGame.recordScoreHard;
        Game.recordScoreNormal = loadedGame.recordScoreNormal;
    } else {
        Game.totalMatches = 0;
        Game.recordCalls = 0;
        Game.recordDocuments = 0;
        Game.recordScoreEasy = 0;
        Game.recordScoreHard = 0;
        Game.recordScoreNormal = 0;
    }
}
