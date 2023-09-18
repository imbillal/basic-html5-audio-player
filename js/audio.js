(function (window, undefined) {
    "use strict";

    var AudioPlayer = (function () {
        var mphtml = `<div class="mp-inner-panel">
            <div class="mp-item mp--track">
                <div class="mp-info">
                    <div class="mp-title"></div>
                    <div class="mp-progress-container">
                    <span class="mp-time--current">--</span>
                        <div class="mp-progress">
                            <div class="mp-bar"></div>
                            <div class="mp-preload-bar"></div>
                        </div>
                        <span class="mp-time--duration">--</span>
                    </div>
                </div>
            </div>

            <div class="mp-control-section mp-settings">
                <div class="mp-item mp--repeat-shuffle">
                    <button class="mp-controls mp-repeat-btn">
                        <i class="icon material-icons">repeat</i>
                    </button>
                    <button class="mp-controls mp-shuffle-btn">
                        <i class="icon material-icons">shuffle</i>
                    </button>
                </div>

                <div class="mp-item mp--playback">
                    <button class="mp-controls mp-prev-btn"></button>
                    <button class="mp-controls mp-toggle-btn"></button>
                    <button class="mp-controls mp-next-btn"></button>
                </div>

                <div class="mp-item mp--settings mp-volume-container">
                    <div class="mp-volume-btns">
                        <button class="mp-controls mp-volume-btn">
                            <i class="icon material-icons mp--volume-on"
                                >volume_up</i
                            >
                            <i class="icon material-icons mp--volume-off"
                                >volume_off</i
                            >
                        </button>
                        <div class="mp-volume">
                            <div class="mp-volume-progress">
                                <div class="mp-volume-bar"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

        /*===== Player vars  ===== */

        /*===== PLAYER INIT  ===== */
        function init(options) {
            var player,
                playBtn,
                prevBtn,
                nextBtn,
                repeatBtn,
                shuffleBtn,
                volumeBtn,
                progressBar,
                preloadBar,
                curTime,
                durTime,
                audio,
                trackTitle,
                root,
                index = 0,
                playList,
                volumeBar,
                trackEl,
                volumeLength,
                repeating = false,
                shuffling = null,
                played = [],
                seeking = false,
                rightClick = false,
                mpActive = false,
                pl,
                plLi,
                settings = {
                    container: "body",
                    volume: 0.5,
                    autoPlay: false,
                    notification: false,
                    playList: [],
                    layout: "stacked",
                    shuffle: true,
                    loop: true,
                    hideTitle: true,
                    customIcons: {},
                    hideVolume: false,
                    themeColor: "blue",
                };

            addIcons();

            if (!("classList" in document.documentElement)) {
                return false;
            }
            settings = extend(settings, options);
            let selector =
                settings.container.split("#")[1] ||
                settings.container.split(".")[1] ||
                [];
            let wrapSelector = `mp--${selector}`;

            player = create("div", {
                className: `mp-${selector}`,
                id: `mp--${selector}`,
                innerHTML: mphtml,
            });

            if (mpActive || player === null) {
                return;
            }

            document
                .querySelector(settings.container)
                .insertBefore(player, null);

            // get player elements
            root = player.querySelector(`#${wrapSelector} .mp-inner-panel`);
            playBtn = player.querySelector(`#${wrapSelector} .mp-toggle-btn`);
            prevBtn = player.querySelector(`#${wrapSelector} .mp-prev-btn`);
            nextBtn = player.querySelector(`#${wrapSelector} .mp-next-btn`);
            repeatBtn = player.querySelector(`#${wrapSelector} .mp-repeat-btn`);
            shuffleBtn = player.querySelector(
                `#${wrapSelector} .mp-shuffle-btn`
            );
            volumeBtn = player.querySelector(`#${wrapSelector} .mp-volume-btn`);
            curTime = player.querySelector(
                `#${wrapSelector} .mp-time--current`
            );
            durTime = player.querySelector(
                `#${wrapSelector} .mp-time--duration`
            );
            progressBar = player.querySelector(`#${wrapSelector} .mp-bar`);
            preloadBar = player.querySelector(
                `#${wrapSelector} .mp-preload-bar`
            );
            volumeBar = player.querySelector(`#${wrapSelector} .mp-volume-bar`);
            trackTitle = player.querySelector(`#${wrapSelector} .mp-title`);
            trackEl = player.querySelector(`#${wrapSelector} .mp--track`);

            playList = settings.playList;

            playBtn.addEventListener("click", playToggle);
            volumeBtn.addEventListener("click", volumeToggle);
            repeatBtn.addEventListener("click", repeatToggle);
            shuffleBtn.addEventListener("click", shuffleToggle);
            window.addEventListener("resize", setTitleWidth);

            progressBar.parentNode.parentNode.addEventListener(
                "mousedown",
                handlerBar
            );
            progressBar.parentNode.parentNode.addEventListener(
                "mousemove",
                seek
            );
            document.documentElement.addEventListener("mouseup", seekingFalse);

            volumeBar.parentNode.parentNode.addEventListener(
                "mousedown",
                handlerVol
            );
            volumeBar.parentNode.parentNode.addEventListener(
                "mousemove",
                setVolume
            );
            document.documentElement.addEventListener("mouseup", seekingFalse);

            prevBtn.addEventListener("click", prev);
            nextBtn.addEventListener("click", next);
            if (playList.length <= 1) {
                nextBtn.setAttribute("disabled", true);
                prevBtn.setAttribute("disabled", true);
            }
            mpActive = true;

            if (!settings.shuffle) {
                const shuffleP = player.querySelector(
                    `#${wrapSelector} .mp--repeat-shuffle`
                );
                if (shuffleP) {
                    const shuffleEl = shuffleP.querySelector(
                        `#${wrapSelector} .mp-shuffle-btn`
                    );
                    shuffleP.removeChild(shuffleEl);
                }
            }

            if (!settings.loop) {
                const loopP = player.querySelector(
                    `#${wrapSelector} .mp--repeat-shuffle`
                );
                if (loopP) {
                    const loopEl = loopP.querySelector(
                        `#${wrapSelector} .mp-repeat-btn`
                    );
                    loopP.removeChild(loopEl);
                }
            }
            if (settings.hideTitle) {
                const volumeP = player.querySelector(
                    `#${wrapSelector} .mp-info`
                );
                if (volumeP) {
                    volumeP.removeChild(trackTitle);
                }
            }

            if (settings.hideVolume) {
                const volumeP = player.querySelector(
                    `#${wrapSelector} .mp-volume-container`
                );
                if (volumeP) {
                    const volumeEl = volumeP.querySelector(
                        `#${wrapSelector} .mp-volume-btns`
                    );
                    volumeP.removeChild(volumeEl);
                }
            }
            renderIcon();
            setLayout();
            setTitleWidth();

            // Create audio object
            audio = new Audio();
            audio.volume = settings.volume;
            if (isEmptyList()) {
                empty();
                return;
            }

            if (settings.themeColor) {
                const root_theme = document.querySelector(`#${wrapSelector}`);
                root_theme.style.setProperty(
                    "--theme-color",
                    settings.themeColor
                );
            }

            audio.src = playList[index].file;
            trackTitle.innerHTML = playList[index].title || "";
            audio.preload = "auto";

            audio.addEventListener("error", error, false);
            audio.addEventListener("timeupdate", update, false);
            audio.addEventListener("ended", doEnd, false);
            audio.addEventListener(
                "play",
                () => {
                    playBtn.classList.add("playing");
                },
                false
            );
            audio.addEventListener(
                "pause",
                () => {
                    playBtn.classList.remove("playing");
                },
                false
            );

            if (settings.autoPlay) {
                audio.play();

                if (Array.isArray(plLi)) {
                    plLi[index].classList.add("pl-current");
                }
            }
            setTimeout(() => {
                updateDuration();
            }, 100);

            /*===== PLAYER LIST HANDLE  ===== */
            function listHandler(evt) {
                evt.preventDefault();
                if (evt.target.className === "pl-title") {
                    var current = parseInt(
                        evt.target.parentNode.getAttribute("data-track"),
                        10
                    );
                    index = current;
                    play();
                } else {
                    var target = evt.target;
                    while (target.className !== pl.className) {
                        if (target.className === "pl-remove") {
                            var isDel = parseInt(
                                target.parentNode.getAttribute("data-track"),
                                10
                            );

                            playList.splice(isDel, 1);
                            target.parentNode.parentNode.removeChild(
                                target.parentNode
                            );

                            plLi = pl.querySelectorAll("li");

                            [].forEach.call(plLi, function (el, i) {
                                el.setAttribute("data-track", i);
                            });

                            if (!audio.paused) {
                                if (isDel === index) {
                                    play();
                                }
                            } else {
                                if (isEmptyList()) {
                                    empty();
                                } else {
                                    audio.src = playList[index].file;
                                    progressBar.style.width = 0;
                                }
                            }
                            if (isDel < index) {
                                index--;
                            }

                            return;
                        }
                        target = target.parentNode;
                    }
                }
            }

            /*===== PLAYER ERROR HANDLE  ===== */
            function error() {
                !isEmptyList() && next();
            }
            function addIcons() {
                const href =
                    "https://fonts.googleapis.com/icon?family=Material+Icons";
                const isLinkExist = document.head.querySelector(
                    `link[href="${href}"]`
                );
                if (isLinkExist) return;
                const link = document.createElement("link");
                link.rel = "stylesheet";
                link.href = href;
                document.head.prepend(link);
            }

            /*===== PLAYER PLAY  ===== */
            function play() {
                index = index > playList.length - 1 ? 0 : index;
                if (index < 0) index = playList.length - 1;

                if (isEmptyList()) {
                    empty();
                    return;
                }

                played.push(index);

                audio.src = playList[index].file;
                trackTitle.innerHTML = playList[index].title || "";
                audio.preload = "auto";
                audio.play();
            }

            /*===== PLAYER PLAY PREVIOUS  ===== */
            function prev() {
                index = played.length > 1 ? played.splice(-2)[0] : 0;
                play();
            }

            /*===== PLAYER PLAY NEXT  ===== */
            function next(interactive) {
                if (shuffling) {
                    if (shuffling.length === 0) {
                        if (repeating || interactive) {
                            shuffling = [...Array(playList.length).keys()];
                        } else {
                            return audio.pause();
                        }
                    }
                    let i = Math.floor(Math.random() * shuffling.length);
                    index = shuffling.splice(i, 1)[0];
                } else {
                    if (
                        index === playList.length - 1 &&
                        !repeating &&
                        !interactive
                    ) {
                        audio.pause();
                        playBtn.classList.remove("playing");
                        return;
                    }

                    index = index === playList.length - 1 ? 0 : index + 1;
                }

                play();
            }

            /*===== PLAYER CHECK IF EMPTY LIST  ===== */
            function isEmptyList() {
                return playList.length === 0;
            }

            /*===== PLAYER RENDER EMPTY TEXT  ===== */
            function empty() {
                audio.pause();
                audio.src = "";
                curTime.innerHTML = "--";
                durTime.innerHTML = "--";
                progressBar.style.width = 0;
                preloadBar.style.width = 0;
                root.innerHTML =
                    '<div class="pl-empty">PlayList is empty</div>';
                trackTitle.innerHTML = "queue is empty";
                root.style.textAlign = "center";
            }

            /*===== PLAYER PLAY TOGGLE  ===== */
            function playToggle() {
                if (isEmptyList()) {
                    return;
                }
                audio.paused ? audio.play() : audio.pause();
            }

            /*===== PLAYER VPLUME TOGGLE  ===== */
            function volumeToggle() {
                if (audio.muted) {
                    if (parseInt(volumeLength, 10) === 0) {
                        volumeBar.style.width = "100%";
                        audio.volume = 0.5;
                    } else {
                        volumeBar.style.width = volumeLength;
                    }
                    audio.muted = false;
                    this.classList.remove("muted");
                } else {
                    audio.muted = true;
                    volumeBar.style.width = 0;
                    this.classList.add("muted");
                }
            }

            /*===== PLAYER REPEAT TOGGLE  ===== */
            function repeatToggle() {
                var repeat = this.classList;
                if (repeat.contains("mp-active")) {
                    repeating = false;
                    repeat.remove("mp-active");
                } else {
                    repeating = true;
                    repeat.add("mp-active");
                }
            }

            /*===== PLAYER SHUFFLE TOGGLE  ===== */
            function shuffleToggle() {
                var shuffle = this.classList;
                if (shuffle.contains("mp-active")) {
                    shuffling = null;
                    shuffle.remove("mp-active");
                } else {
                    shuffling = [...Array(playList.length).keys()];
                    shuffle.add("mp-active");
                }
            }

            /*===== PLAYER RENDER ICONS  ===== */

            function convertElementToDOM(_element) {
                if (typeof _element.type === "string") {
                    const htmlElement = document.createElement(_element.type);
                    for (const prop in _element.props) {
                        if (prop === "children") {
                            if (Array.isArray(_element.props.children)) {
                                _element.props.children.forEach((child) => {
                                    const childDOM = convertElementToDOM(child);
                                    htmlElement.appendChild(childDOM);
                                });
                            } else if (
                                typeof _element.props.children === "object"
                            ) {
                                const childDOM = convertElementToDOM(
                                    _element.props.children
                                );
                                htmlElement.appendChild(childDOM);
                            } else {
                                htmlElement.innerHTML = _element.props.children;
                            }
                        } else {
                            if (prop === "className") {
                                htmlElement.setAttribute(
                                    "class",
                                    _element.props[prop]
                                );
                            } else {
                                htmlElement.setAttribute(
                                    prop,
                                    _element.props[prop]
                                );
                            }
                        }
                    }

                    return htmlElement;
                }
                if (_element.nodeName) {
                    return _element;
                }
            }

            function renderIcon() {
                const prev = createEl(
                    "i",
                    ["icon", "material-icons"],
                    "skip_previous"
                );
                const play = createEl(
                    "i",
                    ["icon", "material-icons", "mp--play"],
                    "play_arrow"
                );
                const pause = createEl(
                    "i",
                    ["icon", "material-icons", "mp--pause"],
                    "pause"
                );
                const next = createEl(
                    "i",
                    ["icon", "material-icons"],
                    "skip_next"
                );

                [
                    ["prev", prev],
                    ["next", next],
                    ["play", play],
                    ["pause", pause],
                ].forEach(([type, el]) => {
                    if (!settings.customIcons[type]) {
                        settings.customIcons[type] = el;
                    } else {
                        const _class = {
                            pause: ["icon", "mp--pause"],
                            play: ["icon", "mp--play"],
                            next: ["icon"],
                            prev: ["icon"],
                        }[type];
                        if (_class) {
                            let element = settings.customIcons[type];
                            if (
                                typeof element !== "function" &&
                                typeof element !== "object"
                            ) {
                                return;
                            }

                            if (typeof element === "function") {
                                element = settings.customIcons[type]();
                            }

                            const dom = convertElementToDOM(element);

                            if (dom) {
                                dom.classList.add(..._class);
                                settings.customIcons[type] = dom;
                            }
                        }
                    }
                });

                prevBtn.appendChild(settings.customIcons.prev);
                nextBtn.appendChild(settings.customIcons.next);
                playBtn.appendChild(settings.customIcons.pause);
                playBtn.appendChild(settings.customIcons.play);
            }

            function createEl(tag = "div", classes = [], inner = "", parent) {
                const el = document.createElement(tag);
                if (Array.isArray(classes) && classes.length) {
                    el.classList.add(...classes);
                }
                if (inner) {
                    el.innerHTML = inner;
                }
                if (parent) {
                    parent.appendChild(el);
                    return parent;
                }
                return el;
            }

            /*===== PLAYER UPDATE PLAY TIME  ===== */
            function update() {
                if (audio.readyState === 0) return;

                var barlength = Math.round(
                    audio.currentTime * (100 / audio.duration)
                );
                progressBar.style.width = barlength + "%";

                var curMins = Math.floor(audio.currentTime / 60),
                    curSecs = Math.floor(audio.currentTime - curMins * 60),
                    mins = Math.floor(audio.duration / 60),
                    secs = Math.floor(audio.duration - mins * 60);
                curSecs < 10 && (curSecs = "0" + curSecs);
                secs < 10 && (secs = "0" + secs);

                curTime.innerHTML = curMins + ":" + curSecs;
                durTime.innerHTML = mins + ":" + secs;

                var buffered = audio.buffered;
                if (buffered.length) {
                    var loaded = Math.round(
                        (100 * buffered.end(0)) / audio.duration
                    );
                    preloadBar.style.width = loaded + "%";
                }
            }

            function doEnd() {
                next(false);
            }

            function updateDuration() {
                if (!isNaN(audio.duration)) {
                    var mins = Math.floor(audio.duration / 60),
                        secs = Math.floor(audio.duration - mins * 60);
                    durTime.innerHTML = mins + ":" + secs;
                }
            }
            function setTitleWidth() {
                let w = trackEl.css("width");
                trackTitle.style.width = `${Math.round(parseInt(w, 10))}px`;
            }

            /*===== PLAYER MOVE PROGRESSBAR WHILE MOVE  ===== */
            function moveBar(evt, el, dir) {
                var value;
                if (dir === "horizontal") {
                    value = Math.round(
                        ((evt.clientX - el.offset().left + window.pageXOffset) *
                            100) /
                            el.parentNode.offsetWidth
                    );
                    el.style.width = value + "%";
                    return value;
                } else {
                    var offset =
                        el.offset().top + el.offsetHeight - window.pageYOffset;
                    value = Math.round(offset - evt.clientY);

                    if (value > 100) value = 100;
                    if (value < 0) value = 0;
                    volumeBar.style.height = value + "%";
                    return value;
                }
            }

            function handlerBar(evt) {
                rightClick = evt.which === 3 ? true : false;
                seeking = true;
                seek(evt);
            }

            function handlerVol(evt) {
                rightClick = evt.which === 3 ? true : false;
                seeking = true;
                setVolume(evt);
            }

            function seek(evt) {
                if (seeking && rightClick === false && audio.readyState !== 0) {
                    var value = moveBar(evt, progressBar, "horizontal");
                    audio.currentTime = audio.duration * (value / 100);
                }
            }

            function seekingFalse() {
                seeking = false;
            }

            function setVolume(evt) {
                volumeLength = volumeBar.css("width");
                if (seeking && rightClick === false) {
                    var value = moveBar(evt, volumeBar, "horizontal") / 100;

                    if (value <= 0) {
                        audio.volume = 0;
                        volumeBtn.classList.add("muted");
                    } else {
                        if (audio.muted) audio.muted = false;
                        audio.volume = value;
                        volumeBtn.classList.remove("muted");
                    }
                }
            }

            function setLayout() {
                switch (settings.layout) {
                    case "stacked":
                        return root.classList.add("stacked");
                    case "stacked-reverse":
                        return root.classList.add("stacked-reverse");
                    case "horizontal":
                        return root.classList.add("horizontal");
                    case "horizontal-reverse":
                        return root.classList.add("horizontal-reverse");
                    default:
                        return root.classList.add("stacked");
                }
            }
        }

        /*===== PLAYER Destroy method. Clear All  ===== */

        /*===== PLAYER Helpers FNS  ===== */
        function extend(defaults, options) {
            for (var name in options) {
                if (defaults.hasOwnProperty(name)) {
                    defaults[name] = options[name];
                }
            }
            return defaults;
        }

        function create(el, attr) {
            var element = document.createElement(el);
            if (attr) {
                for (var name in attr) {
                    if (element[name] !== undefined) {
                        element[name] = attr[name];
                    }
                }
            }
            return element;
        }

        Element.prototype.offset = function () {
            var el = this.getBoundingClientRect(),
                scrollLeft =
                    window.pageXOffset || document.documentElement.scrollLeft,
                scrollTop =
                    window.pageYOffset || document.documentElement.scrollTop;

            return {
                top: el.top + scrollTop,
                left: el.left + scrollLeft,
            };
        };

        Element.prototype.css = function (attr) {
            if (typeof attr === "string") {
                return getComputedStyle(this, "")[attr];
            } else if (typeof attr === "object") {
                for (var name in attr) {
                    if (this.style[name] !== undefined) {
                        this.style[name] = attr[name];
                    }
                }
            }
        };

        return {
            init: init,
        };
    })();

    window.AudioPlayer = AudioPlayer;
})(window);
