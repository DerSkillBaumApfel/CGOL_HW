// window.onload = function (e: Event) {
//   new CgolGameComponent();
// }
class CgolGameLogic {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        var container = document.querySelector('#pitchShadow');
        this.shadowDOM = container.shadowRoot;
        // Button and event subscriptions happening here
        this.shadowDOM.querySelector("#stepCounter").innerText = "Steps made: 0";
        this.shadowDOM.querySelector("#clearButton").addEventListener("click", (e) => this.clearGrid());
        this.shadowDOM.querySelector("#startButton").addEventListener("click", (e) => this.startClick());
        this.shadowDOM.querySelector("#stopButton").addEventListener("click", (e) => this.stopGame());
        this.shadowDOM.querySelector("#confirmButton").addEventListener("click", (e) => this.updateDimensions());
        this.shadowDOM.querySelector("#levelLoadButton").addEventListener("click", (e) => this.parseLevelDefinition());
        this.previousWindowWidth = window.screen.width;
        window.addEventListener("resize", (e) => {
            if (this.previousWindowWidth != window.screen.width) {
                this.remarkElements();
                this.previousWindowWidth = window.screen.width;
            }
        });
        window.addEventListener("orientationchange", (e) => {
            this.remarkElements();
        });
    }
    remarkElements() {
        var previousDivs = this.activeDivs;
        this.genDivs();
        if (previousDivs.length > 0) {
            previousDivs.forEach(combinedCoords => {
                var parsedWidth = parseInt(combinedCoords.id.split(".")[0]);
                var parsedHeight = parseInt(combinedCoords.id.split(".")[1]);
                if (parsedWidth < this.width && parsedHeight < this.height) {
                    this.markElement(parsedWidth, parsedHeight);
                }
            });
        }
    }
    updateDimensions() {
        let newW = parseInt(this.shadowDOM.querySelector('#widthBox').value);
        let newH = parseInt(this.shadowDOM.querySelector('#heightBox').value);
        if (newW < 10 || newH < 10) {
            this.customAlert("Definition must be positive and >= 10!");
        }
        else {
            this.height = newH;
            this.width = newW;
        }
        this.genDivs();
    }
    availWidthWithOffset() {
        var containerSize = window.screen.availWidth;
        // approximate rounding
        var res = Math.floor(containerSize - (containerSize * 0.1));
        return res;
    }
    genDivs() {
        // Get container and reset contents
        let container = this.shadowDOM.querySelector("#container");
        container.innerHTML = "";
        this.divDimension = 25;
        container.style.width = window.screen.availWidth + "px";
        let sizeOk = true;
        if (Math.floor((this.availWidthWithOffset() / (this.width))) >= 5 && this.width >= 10 && this.height >= 10) {
            // get equally scaled dimensions for height and width
            // change divsize only if it is in reasonable scale range
            this.divDimension = Math.floor((this.availWidthWithOffset() / (this.width)));
        }
        else {
            if (!(Math.floor((this.availWidthWithOffset() / (this.width))) >= 5)) {
                sizeOk = false;
                this.customAlert("Cell density too high for screen size! \n Use less cells or increase resolution.");
                // alert("Cell density too high for screen size! Use less cells or increase resolution.");
            }
            if (!(this.width >= 10 && this.height >= 10)) {
                sizeOk = false;
                this.customAlert("The game field needs to be atleast 10x10!");
                // alert("The game field needs to be atleast 10x10!");
            }
        }
        if (sizeOk) {
            this.activeDivs = new Array();
            let currentRow = this.shadowDOM.appendChild(document.createElement("div"));
            currentRow.className = "row col-12 mx-0 px-0 d-flex justify-content-center w-100";
            for (let i = 0; i < this.height; i++) {
                for (let j = 0; j < this.width; j++) {
                    let div = currentRow.appendChild(document.createElement("div"));
                    div.id = "tile" + j.toString() + "." + i.toString();
                    div.className = "gridDiv";
                    div.style.width = this.divDimension + "px";
                    div.style.height = div.style.width;
                    div.addEventListener("mouseenter", (e) => this.changeColorOnMouseEnter(e));
                    div.addEventListener("mouseleave", (e) => this.changeColorOnMouseLeave(e));
                    div.addEventListener("click", (e) => this.clickElement(e));
                    div.setAttribute("isMarked", "false");
                    // this.shadowDOM.getElementById("container").appendChild(div);
                    currentRow.appendChild(div);
                }
                // let jump = this.shadowDOM.createElement("br");
                // jump.setAttribute("LineBreak", "true");
                container.appendChild(currentRow);
                currentRow = this.shadowDOM.appendChild(document.createElement("div"));
                currentRow.className = "row col-12 mx-0 px-0 d-flex justify-content-center w-100";
            }
            this.virtualGameboard = new Array(this.width);
            for (let i = 0; i < this.width; i++) {
                this.virtualGameboard[i] = new Array(this.height);
                for (let j = 0; j < this.height; j++) {
                    this.virtualGameboard[i][j] = 0;
                }
            }
        }
    }
    customAlert(message) {
        // -> ts-ignore is only here, because typescript didn't recognize the cdn linked jquery lib.
        //@ts-ignore
        $.notify(message, "error");
    }
    changeColorOnMouseEnter(e) {
        if (!this.gameRunning) {
            e = e || window.event;
            let src = this.shadowDOM.getElementById(e.target.id);
            this.elementColor = src.style.backgroundColor;
            src.style.backgroundColor = "red";
        }
    }
    changeColorOnMouseLeave(e) {
        if (!this.gameRunning) {
            e = e || window.event;
            let src = this.shadowDOM.getElementById(e.target.id);
            src.style.backgroundColor = this.elementColor;
        }
    }
    clickElement(e) {
        if (!this.gameRunning) {
            e = e || window.event;
            let src = this.shadowDOM.getElementById(e.target.id);
            if (src != undefined) {
                let parsedX = parseInt(src.id.substr(4, src.id.length).split(".")[0]);
                let parsedY = parseInt(src.id.substr(4, src.id.length).split(".")[1]);
                this.markElement(parsedX, parsedY, true);
                this.elementColor = src.style.backgroundColor;
            }
        }
    }
    markElement(xCoordinate, yCoordinate, creationPhase = false) {
        var element = this.shadowDOM.getElementById('tile' + xCoordinate + "." + yCoordinate);
        if (this.virtualGameboard[xCoordinate][yCoordinate] == 1) {
            this.virtualGameboard[xCoordinate][yCoordinate] = 0;
            element.setAttribute("isMarked", "false");
            try {
                this.activeDivs.splice(this.activeDivs.indexOf(element), 1);
            }
            catch (_a) {
                console.log("Element was not in active div collection.");
            }
            if (creationPhase) {
                element.style.backgroundColor = "var(--grid-color)";
            }
            else {
                element.style.backgroundColor = "var(--grid-visited-color)";
            }
        }
        else {
            this.virtualGameboard[xCoordinate][yCoordinate] = 1;
            element.setAttribute("isMarked", "true");
            this.activeDivs.push(element);
            element.style.backgroundColor = "var(--grid-active-color)";
        }
    }
    startClick() {
        if (!this.gameRunning) {
            this.shadowDOM.getElementById("clearButton").disabled = true;
            this.shadowDOM.getElementById("startButton").disabled = true;
            this.shadowDOM.getElementById("stopButton").disabled = false;
            this.counter = 0;
            this.shadowDOM.getElementById("stepCounter").innerHTML = "Steps made: " + this.counter;
            this.gameRunning = true;
            this.startGameLoop();
        }
    }
    startGameLoop() {
        var logic = this;
        var timeout = 200;
        setTimeout(function () {
            logic.gameLogic();
            if (logic.gameRunning) {
                logic.shadowDOM.querySelector("#stepCounter").innerHTML = "Steps made: " + logic.counter;
                logic.counter++;
                logic.startGameLoop();
            }
        }, timeout);
    }
    gameLogic() {
        //while (this.gameRunning) {
        var container = this.shadowDOM.getElementById("container");
        var markedCounter = -1;
        var stateChangingCells = new Array();
        // y is inside x
        // first height second width
        // console.log("x length" + this.virtualGameboard[1].length + " y length" + this.virtualGameboard.length);
        for (let i = 0; i < this.virtualGameboard.length; i++) {
            for (let j = 0; j < this.virtualGameboard[i].length; j++) {
                var xCoordinate = i;
                var yCoordinate = j;
                var neighbours = 0;
                for (let sideShift = xCoordinate - 1; sideShift <= xCoordinate + 1; sideShift++) {
                    for (let heightShift = yCoordinate - 1; heightShift <= yCoordinate + 1; heightShift++) {
                        var wrappedxCoord = sideShift;
                        var wrappedyCoord = heightShift;
                        if (sideShift < 0) {
                            wrappedxCoord = this.width - 1;
                        }
                        if (heightShift < 0) {
                            wrappedyCoord = this.height - 1;
                        }
                        if (sideShift >= this.width) {
                            wrappedxCoord = 0;
                        }
                        if (heightShift >= this.height) {
                            wrappedyCoord = 0;
                        }
                        try {
                            if ((wrappedxCoord != xCoordinate || wrappedyCoord != yCoordinate) && this.virtualGameboard[wrappedxCoord][wrappedyCoord] == 1) {
                                neighbours++;
                            }
                        }
                        catch (_a) {
                            console.log("Calculation error:" + wrappedxCoord + " " + wrappedyCoord + " VALUE xy: " + xCoordinate + "  " + yCoordinate);
                        }
                    }
                }
                if (neighbours < 2 || neighbours > 3) {
                    if (this.virtualGameboard[xCoordinate][yCoordinate] == 1) {
                        stateChangingCells.push(xCoordinate + "." + yCoordinate);
                    }
                }
                if (neighbours == 3) {
                    if (this.virtualGameboard[xCoordinate][yCoordinate] == 0) {
                        stateChangingCells.push(xCoordinate + "." + yCoordinate);
                    }
                }
            }
        }
        if (stateChangingCells.length > 0) {
            stateChangingCells.forEach(combinedCoords => {
                var parsedWidth = parseInt(combinedCoords.split(".")[0]);
                var parsedHeight = parseInt(combinedCoords.split(".")[1]);
                this.markElement(parsedWidth, parsedHeight);
            });
        }
        else {
            this.stopGame();
        }
    }
    stopGame() {
        this.shadowDOM.getElementById("clearButton").disabled = false;
        this.shadowDOM.getElementById("startButton").disabled = false;
        this.shadowDOM.getElementById("stopButton").disabled = true;
        this.gameRunning = false;
    }
    clearGrid() {
        this.gameRunning = false;
        this.counter = 0;
        this.shadowDOM.getElementById("stepCounter").innerText = "Steps made: 0";
        this.genDivs();
    }
    rand(lowest, highest) {
        var adjustedHigh = (highest - lowest) + 1;
        return Math.floor(Math.random() * adjustedHigh) + lowest;
    }
    parseLevelDefinition() {
        let inputRows = this.shadowDOM.querySelector("#levelDesignZone").value.trim().split('\n');
        let longestLineLength = 0;
        for (let i = 0; i < inputRows.length; i++) {
            if (inputRows[i].length > longestLineLength) {
                longestLineLength = inputRows[i].length;
            }
        }
        this.width = longestLineLength;
        this.height = inputRows.length;
        if (this.width < 10) {
            this.width = 10;
        }
        if (this.height < 10) {
            this.height = 10;
        }
        this.genDivs();
        for (let height = 0; height < inputRows.length; height++) {
            for (let width = 0; width < inputRows[height].length; width++) {
                // try {
                let value = parseInt(inputRows[height].charAt(width));
                if (inputRows[height].charAt(width).toLowerCase() == "x") {
                    if (this.rand(0, 100) > 50) {
                        this.markElement(width, height);
                    }
                }
                if (value == 1) {
                    this.markElement(width, height);
                }
            }
        }
        console.log(this.virtualGameboard);
    }
}
class CgolPitchComponent extends HTMLElement {
    constructor() {
        super();
        // let templateContent = template.content;
        const template = document.querySelector("#cgolTemplate");
        let shadowRoot = this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = template.innerHTML;
        //  (templateContent.cloneNode(true));
    }
    connectedCallback() {
        // console.log((document.querySelector("#cgolTemplate")).innerHTML);
        var pitch = document.querySelector('cgol-pitch');
        var width = 60;
        var height = 25;
        if (pitch.hasAttribute('width')) {
            width = parseInt(pitch.getAttribute('width'));
        }
        if (pitch.hasAttribute('height')) {
            height = parseInt(pitch.getAttribute('height'));
        }
        if (typeof (width) == 'number' && typeof (height) == 'number') {
            let gameLogic = new CgolGameLogic(width, height);
            gameLogic.genDivs();
        }
        else {
            alert('Area not valid!');
        }
    }
}
window.customElements.define('cgol-pitch', CgolPitchComponent);
