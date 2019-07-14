(async () => {
    "use strict";

    class Storage {
        constructor() {
            this.storage = window.localStorage
        }
        set(item, value) {
            if (typeof value === "string") {
                return this.storage.setItem(item, value)
            } else {
                return this.storage.setItem(item, JSON.stringify(value))
            }

        }
        get(item) {
            return JSON.parse(this.storage.getItem(item))
        }
        remove(item) {
            return this.storage.removeItem(item)
        }

        keys() {
            return Object.keys(this.storage)
        }

        clear() {
            return this.storage.clear()
        }

        isEmpty() {
            return this.storage.length > 0
        }
    }



    let textInstance;
    const slicedClassTag = "char";
    const textsPath =
        window.location.host === "https://arttu.pennanen.org"
            ? "https://arttu.pennanen.org/sub/typechase/assets/texts.json"
            : "./assets/texts.json";

    const destination = document.querySelector("#textbox");




    let storage = new Storage()
    let focused = true;

    // Mobile check
    window.addEventListener("load", () => {
        window.mobilecheck = function () {
            let check = false;
            (function (a) {
                if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
            })(navigator.userAgent || navigator.vendor || window.opera);
            return check;
        };
        if (mobilecheck()) {
            alert("Huomaathan, että tämä sivu ei toimi ilman fyysistä näppäimistöä.");
        }
    });

    /**
    * Calculate a 32 bit FNV-1a hash
    * Found here: https://gist.github.com/vaiorabbit/5657561
    * Ref.: http://isthe.com/chongo/tech/comp/fnv/
    *
    * @param {string} str the input value
    * @param {boolean} [asString=false] set to true to return the hash value as 
    *     8-digit hex string instead of an integer
    * @param {integer} [seed] optionally pass the hash of the previous chunk
    * @returns {integer | string}
    */
    function hashFnv32a(str, asString, seed) {
        let i, l,
            hval = (seed === undefined) ? 0x811c9dc5 : seed;

        for (i = 0, l = str.length; i < l; i++) {
            hval ^= str.charCodeAt(i);
            hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
        }
        if (asString) {
            // Convert to 8 digit hex string
            return ("0000000" + (hval >>> 0).toString(16)).substr(-8);
        }
        return hval >>> 0;
    }

    // Calculate a 64 bit hash
    function hash64(str, asString) {
        let h1 = hashFnv32a(str, asString);
        return h1 + hashFnv32a(h1 + str, asString);
    }

    // Return a random item from an array
    function randomFromArray(arr) {
        return arr[Math.floor(Math.random() * arr.length)]
    }

    // Return a random child from an object
    function randomFromObject(obj) {
        let keys = Object.keys(obj)
        return obj[keys[keys.length * Math.random() << 0]];
    }

    // Slice DOM element into one character long span elements.
    function sliceString(text, classtag = "sliced") {
        let outputElement = document.createElement("DIV")
        outputElement.setAttribute("class", "slicedString")

        for (let i = 0; i < text.length; i++) {
            let char = document.createElement("span");
            let charAtIndex = text.charAt(i);
            char.setAttribute("class", `slicedChar ${classtag}${i} ${charAtIndex.match(/\ /) ? 'slicedSpace' : null}`)
            char.innerText = charAtIndex
            outputElement.appendChild(char)
        }

        while (destination.firstChild) {
            destination.removeChild(destination.firstChild);
        }

        destination.appendChild(outputElement)
    }

    // Loads content from a json file. Returns a promise.
    function loadJSON(path) {
        let req = new XMLHttpRequest();
        return new Promise((resolve, reject) => {
            req.overrideMimeType("application/json");
            req.open("GET", path, true);
            req.onreadystatechange = () => {
                if (req.readyState == 4 && req.status == "200") {
                    let response = JSON.parse(req.responseText);
                    return resolve(response);
                }
            }
            req.send(null);
        })
    }

    // Calculate amount of failed characters
    function calculateMissedCharacters(textInstance) {
        return textInstance.text.characters.reduce((accumulated, current) => current.failed ? accumulated + 1 : accumulated, 0)
    }

    // Calculate amount of not-typed characters in a textinstance
    function calculateMissingCharacters(textInstance) {
        return textInstance.text.characters.reduce((accumulated, current) => !current.typed ? accumulated + 1 : accumulated, 0)
    }

    // Calculate current WPM from a textinstance
    function getWPM(textInstance) {
        return parseInt((textInstance.characterindex) / 5 / ((Date.now() - textInstance.timing) * 0.0000166666));
    }

    // Calculate accuracy from a textinstance
    function getAccuracy(textInstance) {
        const missed = calculateMissedCharacters(textInstance)
        const characterindex = textInstance.maxcharacterindex
        let accuracy = parseInt((characterindex - missed) / characterindex * 100)
        accuracy < 0 ? accuracy = 0 : null
        return accuracy
    }

    // Calculate a skilllevel from WPM
    function getSkillLevel(wpm) {
        let level = 0;
        if (wpm <= 25) {
            level = 1;
        } else if (wpm <= 30) {
            level = 2;
        } else if (wpm <= 50) {
            level = 3;
        } else if (wpm <= 70) {
            level = 4
        } else if (wpm <= 95) {
            level = 5
        } else if (wpm <= 120) {
            level = 6
        } else if (wpm <= 140) {
            level = 7
        }
        return level
    }

    function completedChase() {
        setVisualStats(textInstance, "completed")
        let missing = calculateMissingCharacters(textInstance)
        if (textInstance.stats.accuracy > 25 && textInstance.stats.wpm > 10 && missing <= 1) {
            pushInstanceToStorage(textInstance, storage)
            loadChaseToDOM(textInstance, document.getElementById("chaselist"))
            updateLast10Stats(storage)
        } else if (missing > 1) {
            popup("Some characters were left in incorrectly. Score not saved.", "#b94400", 4200)
        }
        updateCursor("none")
    }

    // Set WPM style/content changes
    function setVisualStats(textInstance, state = "ongoing") {
        let { wpm = 0, accuracy = 100 } = textInstance.stats;
        const wpmDisplay = document.querySelector("#wpmdisplay")
        const accuracyDisplay = document.querySelector("#accuracydisplay")
        const statsQuery = document.querySelector(".stats")
        const missing = calculateMissingCharacters(textInstance)
        wpmDisplay.textContent = wpm;

        switch (state) {
            case "default":
                statsQuery.style.color = "inherit";
                statsQuery.style.backgroundColor = "inherit";
                break;
            case "completed":
                statsQuery.style.color = "white";
                statsQuery.style.backgroundColor = missing > 0 ? "#f5b645" : "#4dda4f";
                break;
        }

        wpmDisplay.textContent = wpm;
        accuracyDisplay.textContent = accuracy;
    }

    // Push a trimmed version of texinstance into storage
    function pushInstanceToStorage(instance, storage) {
        if (!instance.timing) return;
        let trimmedInstance = createTrimmedTextInstance(instance)
        storage.set(`chase_${instance.timing}`, trimmedInstance)
    }

    // Remove existing textinstance from storage
    function removeInstanceFromStorage(tag, storage) {
        let instance = storage.get(tag)
        if (!instance) return;
        storage.remove(tag);
    }

    // Removes textinstance by tag from both storage and current dom view
    function removeChase(tag, storage) {
        let instance = storage.get(tag)
        let element = document.getElementById(tag)

        if (!instance && !element) return

        if (instance) {
            removeInstanceFromStorage(tag, storage)
        }

        if (element) {
            removeElement(element)
        }
    }

    // For character style changing
    function setVisualCharacter(element, state, key) {
        switch (state) {
            case "incorrect":
                element.style.color = "black"
                element.style.backgroundColor = "#fbd2d2"
                break;
            case "correct":
                element.style.color = key.failed ? "#7eaf21" : "#25b72b"
                element.style.backgroundColor = key.failed ? "#fff0d3" : "#f3f3f3"
                break;
            case "default":
                element.style.color = "inherit"
                element.style.backgroundColor = "inherit"
                break;
        }

    }

    // Toggle between game focus states
    function changeFocusState(focus = undefined, textInstance, changeUnfocusElement = true) {
        const unfocusElement = document.getElementById("unfocus");
        if (focus == true) {
            focused = true;
            textInstance.focused = false;
            changeUnfocusElement ? showElement(unfocusElement, 2) : null
        } else if (focus == false) {
            focused = false
            textInstance.focused = true;
            changeUnfocusElement ? hideElement(unfocusElement, -1) : null
        }
    }

    // Load a new text into the game and set text instance as loaded.
    function loadText(textInstance) {
        sliceString(textInstance.text.content, slicedClassTag)
        textInstance.loaded = true;
        return null;
    }

    // Check if received key is valid and needs to be registered.
    function validKey(event, textInstance) {
        let keycode = event.keyCode;

        // If instance is not in focus, or the instance is completed, return.
        if (textInstance.completed || !textInstance.focused) {
            return false;
        }

        // If the key does not need to be registered, return.
        if (event.ctrlKey || event.metaKey || event.altKey) {
            return false;
        }

        // Check if key is valid
        let valid = (keycode === 8) || (keycode > 47 && keycode < 58) || (keycode === 32) || (keycode > 64 && keycode < 91) || (keycode > 95 && keycode < 112) || (keycode > 185 && keycode < 193) || (keycode > 218 && keycode < 223);

        if (valid) {
            return true;
        } else {
            return false;
        }
    }

    // Create text instances for game to run upon.
    function createTextInstance(text, custom = false) {
        let content;
        let textHash;
        let title;
        if (custom) {
            content = text
            textHash = hash64(text, true)
            title = text.split(" ").slice(0, 6).join(" ")
        } else {
            content = text.content
            textHash = text.id
            title = text.title
        }
        let words = [];
        content.split(" ").forEach((w, i) => {
            words[i] = {
                word: w,
                length: w.length,
                characters: []
            }
            for (let j = 0; j < w.length; j++) {
                words[i].characters.push(w[j]);
            }
        })

        let characters = [];
        content.split("").forEach((c, i) => {
            if (c.match(/\ /)) {
                characters.push({
                    character: "&nbsp;",
                    typed: false,
                    failed: false
                })
            } else {
                characters.push({
                    character: c,
                    typed: false,
                    failed: false
                })
            }
        })

        let textInstance = {
            text: {
                content: content,
                words: words,
                characters: characters,
                id: textHash,
                title: title
            },
            keypresses: {
                ok: 0,
                fail: 0
            },
            stats: {
                wpm: undefined,
                accuracy: undefined,
                skillLevel: undefined
            },
            custom: custom,
            completed: false,
            focused: true,
            loaded: false,
            characterindex: 0,
            maxcharacterindex: 0,
            timing: null
        }
        return textInstance
    }

    // Trim useless information from textinstance
    function createTrimmedTextInstance(textInstance) {
        let full = textInstance
        let trimmedInstance = {
            text: {
                content: full.text.content,
                id: full.text.id,
                title: full.text.title
            },
            stats: {
                wpm: full.stats.wpm,
                accuracy: full.stats.accuracy,
                skillLevel: full.stats.skillLevel
            },
            custom: full.custom,
            timing: full.timing
        }
        return trimmedInstance;
    }

    // Creates a new empty textinstance from old textinstance's content
    function resetTextInstance(textInstance) {
        let id = textInstance.text.id;

        if (textInstance.custom) {
            textInstance = createTextInstance(textInstance.text.content, true)
        } else {
            let text = texts[id]
            textInstance = createTextInstance(text)
        }

        setTextInstance(textInstance)
        return textInstance
    }

    // Set textinstance as the current loaded textinstance
    function setTextInstance(textInstance) {
        loadText(textInstance)
        setVisualStats(textInstance, "default")
        return textInstance
    }

    // Create a text instance from a custon text
    function setCustomTextInstance(customText, textInstance) {
        customText = customText.trim()

        // Return if the custom text is faulty
        if (!customText || customText.length < 1) {
            return;
        }

        textInstance = createTextInstance(customText, true)
        setTextInstance(textInstance)
        openCustomTextMenu(false, textInstance)

        return textInstance
    }

    // Sets a random text from an object as the current textinstance
    function setRandomTextInstance(texts, textInstance) {
        let text = randomFromObject(texts)
        textInstance = createTextInstance(text, false)
        setTextInstance(textInstance)
        updateCursor(0)
        return textInstance
    }

    // Opens, and closes, the customtext element 
    function openCustomTextMenu(state, textInstance) {
        const element = document.getElementById("input-text")

        // Open
        if (state === true) {
            changeFocusState(true, textInstance)
            showElement(element, 3, "flex")

            // Close
        } else if (state === false) {
            changeFocusState(false, textInstance)
            hideElement(element, -1)
        }

    }

    // Opens, and closes, the history element 
    function openHistory(state, textInstance) {
        const element = document.getElementById("chasehistory")

        // Open
        if (state === true) {
            changeFocusState(true, textInstance, false)
            showElement(element, 3, "flex")

            // Close
        } else if (state === false) {
            changeFocusState(false, textInstance, false)
            hideElement(element, -1)
        }

    }

    // Main listening function, a so called main function
    function typingListener(event, textInstance) {

        // Prevent default behaviour for different browser features.
        if ([13, 8, 222, 160, 32].indexOf(event.keyCode) > -1 && ["input", "textarea"].indexOf(event.target.nodeName.toLowerCase()) === -1) {
            event.preventDefault();
        }

        let key = event.key;
        let keycode = event.keyCode;
        let characterindex = textInstance.characterindex

        if (!validKey(event, textInstance)) return null;

        if (!textInstance.timing) {
            textInstance.timing = Date.now()
        }

        // Change spacebars to &nbsp; to ease stuff later.
        if (keycode === 32) {
            key = "&nbsp;";
        }

        let keyToMatch = textInstance.text.characters[characterindex];

        // DOM element for the ongoing character.
        let keyElement = document.querySelector(`.${slicedClassTag}${characterindex}`)

        // letiable to contain wether typed key was correct etc.
        let keyState;



        if (key === keyToMatch.character) {
            keyState = "correct";

            keyToMatch.typed = true;

            textInstance.keypresses.ok++;

        } else if (keycode === 8 || key === "Backspace") {
            keyState = "default";

            characterindex === 0 ? null : keyElement = document.querySelector(`.${slicedClassTag}${characterindex - 1}`)

        } else {
            keyState = "incorrect";

            keyToMatch.typed = false;

            if (key !== "Backspace") {
                keyToMatch.failed = true;
            }


            textInstance.keypresses.fail++;
        }

        setVisualCharacter(keyElement, keyState, keyToMatch)

        if (characterindex > 0) {
            let wpm = getWPM(textInstance)
            let accuracy = getAccuracy(textInstance)
            let skillLevel = getSkillLevel(wpm)
            textInstance.stats.wpm = wpm
            textInstance.stats.accuracy = accuracy
            textInstance.stats.skillLevel = skillLevel
            setVisualStats(textInstance, "default")
        }

        // Change index of the ongoing character
        if (key === "Backspace") {
            characterindex > 0 ? textInstance.characterindex-- : null;
        } else {
            textInstance.characterindex++;
        }

        if (textInstance.characterindex >= textInstance.text.characters.length) {
            textInstance.completed = true;
            completedChase(textInstance)
        }

        if (textInstance.characterindex > textInstance.maxcharacterindex) {
            textInstance.maxcharacterindex = textInstance.characterindex
        }
        updateCursor(textInstance.characterindex)
    }

    // Slice a date into an object
    function sliceTime(time) {
        let date = new Date(time)
        let year = date.getFullYear()
        let month = date.getMonth() + 1
        let day = date.getDate()
        let hours = date.getHours()
        let minutes = date.getMinutes()
        let seconds = date.getSeconds()

        return {
            year,
            month,
            day,
            hours: hours < 10 ? "0" + hours : hours,
            minutes: minutes < 10 ? "0" + minutes : minutes,
            seconds: seconds < 10 ? "0" + seconds : seconds
        }
    }

    // Creates a text object from external data
    function createTextsObject(data) {
        let texts = {}
        data.forEach((str) => {
            let text = {
                content: str,
                id: hash64(str, true),
                title: str.split(" ").slice(0, 6).join(" ")
            }
            texts[text.id] = text
        })
        return texts
    }

    // Removes a domm element
    function removeElement(element) {
        element.outerHTML = "";
    }

    // Create a chaseElement from trimmed textinstance
    function createChaseElement(trimmedInstance) {
        let { hours, minutes, seconds, year, month, day } = sliceTime(trimmedInstance.timing)

        let main = document.createElement('div')
        main.setAttribute('id', `chase_${trimmedInstance.timing}`)
        main.setAttribute('class', 'chase')
        main.setAttribute('title', 'Click to copy full text')
        let head = document.createElement('div')
        head.setAttribute('class', 'chaseHead')
        let body = document.createElement('div')
        body.setAttribute('class', 'chaseBody skillLevel_' + (trimmedInstance.stats.skillLevel | getSkillLevel(trimmedInstance.stats.wpm)))
        let footer = document.createElement('div')
        footer.setAttribute('class', 'chaseFooter')

        let headLeft = document.createElement('div')
        headLeft.setAttribute('class', 'chaseHeadLeft')
        let headRight = document.createElement('div')
        headRight.setAttribute('class', 'chaseHeadRight')

        let esc = document.createElement('button')
        esc.setAttribute('class', 'button removeChaseButton')
        esc.setAttribute('title', 'remove from history and stats')
        let escapeIcon = document.createElement('i')
        escapeIcon.setAttribute('class', 'fas fa-times')
        escapeIcon.setAttribute('aria-hidden', 'true')

        let title = document.createElement('span')
        title.setAttribute('class', 'chaseTitle')
        let id = document.createElement('span')
        id.setAttribute('class', 'chaseId')
        let wpmwrapper = document.createElement('div')
        wpmwrapper.setAttribute('class', 'chaseWpmWrapper')
        let accwrapper = document.createElement('div')
        accwrapper.setAttribute('class', 'chaseAccuracyWrapper')
        let wpm = document.createElement('span')
        wpm.setAttribute('class', 'chaseWpm')
        let acc = document.createElement('span')
        acc.setAttribute('class', 'chaseAccuracy')
        let wpmtext = document.createElement('span')
        wpmtext.setAttribute('class', 'chaseWpmText')
        let acctext = document.createElement('span')
        acctext.setAttribute('class', 'chaseAccuracyText')
        let fulltext = document.createElement('span')
        fulltext.setAttribute('class', 'chaseFullText')
        let custom = document.createElement('div')
        custom.setAttribute('class', 'chaseCustomTextWrapper')
        let customValue = document.createElement('span')
        trimmedInstance.custom ? customValue.setAttribute('class', 'chaseCustomText') : customValue.setAttribute('class', 'chaseDefaultText')
        trimmedInstance.custom ? customValue.setAttribute('title', 'custom text') : customValue.setAttribute('title', 'default text')
        let time = document.createElement('div')
        time.setAttribute('class', 'chaseTime')
        let hhmmss = document.createElement('span')
        hhmmss.setAttribute('class', "chasehhmmss")
        let ddmmyy = document.createElement('span')
        ddmmyy.setAttribute('class', "chaseddmmyy")



        title.textContent = trimmedInstance.text.title
        id.textContent = trimmedInstance.text.id

        wpm.textContent = trimmedInstance.stats.wpm
        acc.textContent = trimmedInstance.stats.accuracy
        wpmtext.textContent = "WPM"
        acctext.textContent = "%"

        fulltext.textContent = trimmedInstance.text.content

        hhmmss.textContent = `${hours}:${minutes}:${seconds}`
        ddmmyy.textContent = `${day}.${month}.${year}`

        esc.appendChild(escapeIcon)

        time.appendChild(ddmmyy)
        time.appendChild(hhmmss)

        wpmwrapper.appendChild(wpm)
        wpmwrapper.appendChild(wpmtext)

        accwrapper.appendChild(acc)
        accwrapper.appendChild(acctext)

        headLeft.appendChild(title)
        headLeft.appendChild(esc)

        headRight.appendChild(id)

        custom.appendChild(customValue)

        head.appendChild(headLeft)
        head.appendChild(headRight)

        body.appendChild(wpmwrapper)
        body.appendChild(accwrapper)

        footer.appendChild(custom)
        footer.appendChild(time)

        main.appendChild(head)
        main.appendChild(body)
        main.appendChild(footer)
        main.appendChild(fulltext)

        return main;
    }

    // Updates visual blinking cursor
    function updateCursor(characterindex) {
        if (characterindex === "none") {
            [...document.querySelectorAll(".currentChar")].forEach(element => {
                element.classList.remove('currentChar')
            })
            return;
        }
        let query = `.${slicedClassTag}${characterindex}`
        let cursor = document.querySelector(query);
        if (!cursor) return;
        [...document.querySelectorAll(".currentChar")].forEach(element => {
            element.classList.remove('currentChar')
        })
        cursor.classList.add('currentChar')
    }

    // Hide element visually
    function hideElement(element, zIndex = -1) {
        element.style.display = "none"
        element.style.zIndex = zIndex
    }

    // Show element visually
    function showElement(element, zIndex = 2, display = "block") {
        element.style.display = display
        element.style.zIndex = zIndex
    }

    // Retrieve archieved chases from storage
    function getTextHistory(storage) {
        let history = []
        storage.keys().forEach(key => {
            if (key.match(/^chase_[\d]+$/)) {
                history.push(storage.get(key))
            }
        })
        return history;
    }

    // Load (trimmed) textinstance into DOM
    function loadChaseToDOM(chase, destination) {
        destination.prepend(createChaseElement(chase))
    }

    /**
    * Sorts a history array either by ascending or descending
    *
    * @param {array} history array that has textinstances
    * @param {string} direction Either "ascending" or "descending"
    * @returns {array}
    */
    function sortHistory(history, direction) {
        let sortedHistory;
        if (direction === "descending") {
            sortedHistory = history.sort((a, b) => (a.timing > b.timing) ? -1 : 1)
        } else if (direction === "ascending") {
            sortedHistory = history.sort((a, b) => (a.timing > b.timing) ? 1 : -1)
        } else {
            throw new Error("Did not receive direction as ascending or descending")
        }
        return sortedHistory;
    }

    // Load every past chase from history into dom
    function loadHistoryToDOM(history, destination) {
        if (history.length === 0) {
            return;
        }
        let sortedHistory = sortHistory(history, "ascending")
        sortedHistory.forEach((chase) => {
            loadChaseToDOM(chase, destination)
        })
    }

    // Create a visual text popup
    function popup(text = "", color = "", delay = 2000) {
        let destination = document.getElementById("popuptext")
        let popupbox = document.querySelector(".popupbox")

        destination.textContent = text;
        popupbox.style.backgroundColor = color;

        if ([...popupbox.classList].indexOf("hidden") === -1) return;

        popupbox.classList.remove("closed", "hidden")

        setTimeout(() => {
            popupbox.classList.add("hidden")
        }, delay)

        setTimeout(() => {
            // if not hidden, return. (fixes spam clicking visual glitches)
            if ([...popupbox.classList].indexOf("hidden") === -1) return;
            popupbox.classList.add("closed")
        }, delay + 1100)
    }

    // Chase element click handling
    function chaseElementClick(event, storage) {

        let targetClasslist = [...event.target.classList];
        let parentClasslist = [...event.target.parentNode.classList]



        function findChaseObj(el) {
            if (el.className === "chase") {
                return el;
            } else {
                return el.parentNode ? findChaseObj(el.parentNode) : false
            }
        }
        let chase = findChaseObj(event.target)
        if (!chase) return;

        if (targetClasslist.indexOf('removeChaseButton') > -1 || parentClasslist.indexOf('removeChaseButton') > -1) {
            removeChase(chase.getAttribute('id'), storage)
            popup("Removed chase from memory", "#3283ca", 1750)
            return;
        }

        navigator.clipboard.writeText(chase.querySelector(".chaseFullText").textContent).catch(console.log)
        popup("Full text copied to clipboard", "#3283ca", 1750)


    }


    /**
   * Calculate average WPM from history array
   * @param {array} history  the chase history array
   * @param {number} timePeriod the last n amount of chases
   * @param {string} direction either "ascending" or "descending"
   * @returns {number}
   */
    function calculateAverageWPM(history, timePeriod, direction) {
        let sortedHistory = sortHistory(history, direction)
        let addedWpm = 0;
        let slicedSortedHistory = sortedHistory.slice(0, timePeriod)
        slicedSortedHistory.forEach(chase => {
            addedWpm += chase.stats.wpm
        })
        let averageWpm = addedWpm / slicedSortedHistory.length
        return parseInt(averageWpm)
    }

    function updateLast10Stats(storage) {
        let history = getTextHistory(storage)
        let wpm = calculateAverageWPM(history, 10, "descending")
        let skill = getSkillLevel(wpm)
        document.getElementById("averagestats").style.visibility = "unset"
        document.getElementById("last10wpm").textContent = wpm;
        document.getElementById("last10WpmParent").className = "skillLevel_" + skill;
    }


    const textdata = await loadJSON(textsPath)
    const texts = await createTextsObject(textdata.texts)
    const history = getTextHistory(storage);

    textInstance = setRandomTextInstance(texts)
    loadHistoryToDOM(history, document.getElementById("chaselist"))

    if (history.length > 2) {
        updateLast10Stats(storage)
    }


    // Add eventlistener to chase objects
    document.addEventListener("click", (event) => {
        chaseElementClick(event, storage)
    })

    // Detect keypresses and handle them in typing listener
    document.addEventListener("keydown", (event) => {
        typingListener(event, textInstance)
    })

    // Handle open custom text "events"
    document.querySelector("#customtext").addEventListener("click", (event) => {
        openCustomTextMenu(true, textInstance)
    })

    // Handle custom text cancel "events"
    document.querySelector("#cancelcustomtext").addEventListener("click", (event) => {
        openCustomTextMenu(false, textInstance)
    })

    // Handle open history"events"
    document.querySelector("#showhistory").addEventListener("click", (event) => {
        openHistory(true, textInstance)
    })

    // Handle close history "events"
    document.querySelector("#closehistory").addEventListener("click", (event) => {
        openHistory(false, textInstance)
    })

    // Handle custom text ok "events"
    document.querySelector("#engagecustomtext").addEventListener("click", (event) => {
        let customText = document.getElementById("texttoload").value;
        textInstance = setCustomTextInstance(customText, textInstance)
    })

    // Handle reset text "events"
    document.querySelector("#resettext").addEventListener("click", (event) => {
        textInstance = resetTextInstance(textInstance)
    })

    // Handle random text "events"
    document.querySelector("#randomtext").addEventListener("click", (event) => {
        textInstance = setRandomTextInstance(texts)
    })


})();
