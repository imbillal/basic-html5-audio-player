(function (window, undefined) {
    "use strict";

    var AudioPlayer = (function () {
        var aphtml = `<div class="ap-inner-panel">
            <div class="ap-item ap--track">
                <div class="ap-info">
                    <div class="ap-progress-container">
                    <span class="ap-time--current">--</span>
                        <div class="ap-progress">
                            <div class="ap-bar"></div>
                            <div class="ap-preload-bar"></div>
                        </div>
                        <span class="ap-time--duration">--</span>
                    </div>
                </div>
            </div>

            <div class="ap-control-section ap-settings">
                <div class="ap-item ap--repeat-shuffle">
                    <button class="ap-controls ap-repeat-btn">
                        <i class="icon material-icons">repeat</i>
                    </button>
                    <button class="ap-controls ap-shuffle-btn">
                        <i class="icon material-icons">shuffle</i>
                    </button>
                </div>

                <div class="ap-item ap--playback">
                    <button class="ap-controls ap-prev-btn"></button>
                    <button class="ap-controls ap-toggle-btn"></button>
                    <button class="ap-controls ap-next-btn"></button>
                </div>

                <div class="ap-item ap--settings ap-volume-container">
                    <div class="ap-volume-btns">
                        <button class="ap-controls ap-volume-btn">
                            <i class="icon material-icons ap--volume-on"
                                >volume_up</i
                            >
                            <i class="icon material-icons ap--volume-off"
                                >volume_off</i
                            >
                        </button>
                        <div class="ap-volume">
                            <div class="ap-volume-progress">
                                <div class="ap-volume-bar"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

        /*===== Player vars  ===== */
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
            root,
            index = 0,
            playList,
            volumeBar,
            volumeLength,
            repeating = false,
            shuffling = null,
            played = [],
            seeking = false,
            rightClick = false,
            apActive = false,
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
                customIcon: {},
                showVolume: true,
                themeColor: "#e07a0c",
            };

        /*===== PLAYER INIT  ===== */
        function init(options) {
            addedStyles();

            if (!("classList" in document.documentElement)) {
                return false;
            }

            player = create("div", {
                className: "ap",
                id: "ap",
                innerHTML: aphtml,
            });

            if (apActive || player === null) {
                return;
            }

            settings = extend(settings, options);

            document
                .querySelector(settings.container)
                .insertBefore(player, null);

            // get player elements
            root = player.querySelector(".ap-inner-panel");
            playBtn = player.querySelector(".ap-toggle-btn");
            prevBtn = player.querySelector(".ap-prev-btn");
            nextBtn = player.querySelector(".ap-next-btn");
            repeatBtn = player.querySelector(".ap-repeat-btn");
            shuffleBtn = player.querySelector(".ap-shuffle-btn");
            volumeBtn = player.querySelector(".ap-volume-btn");
            curTime = player.querySelector(".ap-time--current");
            durTime = player.querySelector(".ap-time--duration");
            progressBar = player.querySelector(".ap-bar");
            preloadBar = player.querySelector(".ap-preload-bar");
            volumeBar = player.querySelector(".ap-volume-bar");

            playList = settings.playList;

            playBtn.addEventListener("click", playToggle);
            volumeBtn.addEventListener("click", volumeToggle);
            repeatBtn.addEventListener("click", repeatToggle);
            shuffleBtn.addEventListener("click", shuffleToggle);

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
            apActive = true;

            if (!settings.shuffle) {
                const shuffleP = player.querySelector(".ap--repeat-shuffle");
                if (shuffleP) {
                    const shuffleEl = shuffleP.querySelector(".ap-shuffle-btn");
                    shuffleP.removeChild(shuffleEl);
                }
            }

            if (!settings.loop) {
                const loopP = player.querySelector(".ap--repeat-shuffle");
                if (loopP) {
                    const loopEl = loopP.querySelector(".ap-repeat-btn");
                    loopP.removeChild(loopEl);
                }
            }

            if (!settings.showVolume) {
                const volumeP = player.querySelector(".ap-volume-container");
                if (volumeP) {
                    const volumeEl = volumeP.querySelector(".ap-volume-btns");
                    volumeP.removeChild(volumeEl);
                }
            }
            renderIcon();
            setLayout();

            // Create audio object
            audio = new Audio();
            audio.volume = settings.volume;
            if (isEmptyList()) {
                empty();
                return;
            }

            if (settings.themeColor) {
                const root_theme = document.querySelector(":root");
                root_theme.style.setProperty(
                    "--theme-color",
                    settings.themeColor
                );
            }

            audio.src = playList[index].file;
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
        }

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
                                // audio.currentTime = 0;
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

        /*===== PLAYER ICONS CDN INSERT  ===== */
        function addedStyles() {
            addIcons();
            addCss();
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
        function addCss() {
            const isLinkExist = document.head.querySelector(`#ap-main-styles`);
            if (isLinkExist) return;
            const style = document.createElement("style");
            style.id = "ap-main-styles";
            style.innerHTML = `*,
            *:before,
            *:after {
                box-sizing: border-box;
            }
            .ap-inner-panel .hide {
                display: none !important;
            }
            
            :root {
                --theme-color: #e07a0c;
                --blur: 10px;
            }
            
            .ap-inner-panel button {
                margin: 0;
                padding: 0;
                border: 0;
                outline: 0;
                background: transparent;
                cursor: pointer;
            }
            .ap-inner-panel .ap-inner-panel button:disabled {
                cursor: not-allowed;
            }
            .ap-inner-panel button:disabled .icon {
                color: #999;
            }
            
            /*------------------------
                Audio Player - AP
            ------------------------*/
            /* Player and control panel */
            .ap-inner-panel {
                max-width: 1440px;
                padding: 10px;
                display: flex;
                width: 100%;
                flex-direction: column;
                gap: 5px;
            }
            .ap-inner-panel.stacked {
                flex-direction: column;
            }
            .ap-inner-panel.horizontal {
                flex-direction: row;
                gap: 30px;
            }
            .ap-inner-panel.horizontal-reverse {
                flex-direction: row-reverse;
                gap: 30px;
            }
            .ap-inner-panel.stacked-reverse {
                flex-direction: column-reverse;
            }
            .ap-item.ap--track {
                width: 100%;
            }
            .ap-control-section {
                display: flex;
                flex: 1 1 auto;
                justify-content: space-between;
                align-items: center;
            }
            
            /* Info section */
            .ap-progress-container {
                padding: 5px 0 10px;
                cursor: pointer;
                display: flex;
                width: 100%;
                height: 100%;
                gap: 10px;
                justify-content: space-between;
                align-items: center;
            }
            .ap-time--current,
            .ap-time--duration {
                width: 50px;
            }
            .ap-time--duration {
                text-align: right;
            }
            
            .ap-progress {
                position: relative;
                height: 5px;
                width: 100%;
                border-radius: 5px;
                background: rgba(0, 0, 0, 0.2);
            }
            .ap-preload-bar,
            .ap-bar {
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                width: 0;
                border-radius: 5px 0 0 5px;
                background: rgba(0, 0, 0, 0.3);
                z-index: 999;
            }
            .ap-bar {
                background: var(--theme-color);
                z-index: 9999;
            }
            .ap-bar:after {
                position: absolute;
                top: 0;
                right: -5px;
                width: 12px;
                height: 12px;
                margin-top: -4px;
                content: "";
                border-radius: 6px;
                background: var(--theme-color);
                opacity: 0;
                -webkit-transition: opacity 0.3s ease;
                transition: opacity 0.3s ease;
            }
            .ap-progress-container:hover .ap-bar:after {
                opacity: 1;
            }
            
            /* Buttons */
            
            .ap--pause,
            .playing > .ap--play {
                display: none;
            }
            .playing > .ap--pause {
                display: inline;
            }
            
            /* volume btns -------------------- */
            .ap-control-section {
                display: flex;
                align-items: center;
            }
            .ap--repeat-shuffle,
            .ap-volume-container {
                width: 120px;
            }
            
            .ap-volume-btns {
                display: flex;
                gap: 10px;
            }
            .ap-volume {
                width: 100px;
                position: relative;
                cursor: pointer;
            }
            .ap-volume-btn {
                cursor: pointer;
            }
            .ap-volume-btn > .ap--volume-off,
            .muted > .ap--volume-on {
                display: none;
            }
            .muted > .ap--volume-off {
                display: inline;
            }
            .ap--repeat-shuffle {
                display: flex;
                flex: 1 0 auto;
                gap: 5px;
                align-items: center;
            }
            .ap-item.ap--playback {
                flex: 0 1 auto;
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 5px;
            }
            .ap-item.ap--settings {
                display: flex;
                flex: 1 0 auto;
                justify-content: flex-end;
                align-items: center;
            }
            .ap-volume-progress {
                display: block;
                height: 4px;
                width: 100%;
                margin: 10px auto;
                background: rgba(0, 0, 0, 0.2);
                position: relative;
                border-radius: 3px;
            }
            .ap-inner-panel .ap-volume-bar {
                position: absolute;
                left: 0;
                right: 0;
                bottom: 0;
                background: var(--theme-color);
                height: 100%;
                border-radius: 3px;
            }
            
            .ap-inner-panel.horizontal .ap-item.ap--playback,
            .ap-inner-panel.horizontal-reverse .ap-item.ap--playback,
            .ap-inner-panel.horizontal .ap--repeat-shuffle,
            .ap-inner-panel.horizontal-reverse .ap--repeat-shuffle,
            .ap-inner-panel.horizontal .ap-volume-container,
            .ap-inner-panel.horizontal-reverse .ap-volume-container {
                flex: 0;
            }
            
            .ap-inner-panel .ap-active {
                background: rgba(0, 0, 0, 0.15);
                background: var(--theme-color);
                color: #fff;
                opacity: 1;
            }
            .ap-inner-panel .ap-active .icon {
                color: #fff;
            }
            @media screen and (max-width: 523px) {
                .ap-item.ap--playback,
                .ap--repeat-shuffle,
                .ap-item.ap--settings,
                .ap-volume-container {
                    flex: 0;
                }
                .ap-volume-btns {
                    width: 100%;
                }
                .ap--repeat-shuffle {
                    width: auto;
                }
                .ap-volume {
                    width: 50px;
                }
            }
            
            /* @-webkit-keyframes blink {
                from {
                    opacity: 0;
                }
                50% {
                    opacity: 1;
                }
                to {
                    opacity: 0;
                }
            }
            
            @keyframes blink {
                from {
                    opacity: 0;
                }
                50% {
                    opacity: 1;
                }
                to {
                    opacity: 0;
                }
            }
            .playing > .ap--pause {
                -webkit-animation: blink 1.5s linear infinite;
                animation: blink 1.5s linear infinite;
            } */
            `;
            document.head.appendChild(style);
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
            audio.preload = "auto";
            audio.play();
        }

        /*===== PLAYER PLAY PREVIOUS  ===== */
        function prev() {
            if (played.length > 1) {
                index = played.splice(-2)[0];
            } else {
                index = 0;
            }

            play();
        }

        /*===== PLAYER PLAY NEXT  ===== */
        function next(interactive) {
            if (shuffling) {
                if (shuffling.length === 0) {
                    if (repeating || interactive) {
                        shuffling = [...Array(playList.length).keys()];
                    } else {
                        audio.pause();

                        return;
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
            root.innerHTML = '<div class="pl-empty">PlayList is empty</div>';
            root.style.textAlign = "center";
        }

        /*===== PLAYER PLAY TOGGLE  ===== */
        function playToggle() {
            if (isEmptyList()) {
                return;
            }
            if (audio.paused) {
                audio.play();
            } else {
                audio.pause();
            }
        }

        /*===== PLAYER VPLUME TOGGLE  ===== */
        function volumeToggle() {
            if (audio.muted) {
                if (parseInt(volumeLength, 10) === 0) {
                    volumeBar.style.width = "100%";
                    audio.volume = 1;
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
            if (repeat.contains("ap-active")) {
                repeating = false;
                repeat.remove("ap-active");
            } else {
                repeating = true;
                repeat.add("ap-active");
            }
        }

        /*===== PLAYER SHUFFLE TOGGLE  ===== */
        function shuffleToggle() {
            var shuffle = this.classList;
            if (shuffle.contains("ap-active")) {
                shuffling = null;
                shuffle.remove("ap-active");
            } else {
                shuffling = [...Array(playList.length).keys()];
                shuffle.add("ap-active");
            }
        }

        /*===== PLAYER RENDER ICONS  ===== */
        function renderIcon() {
            const prev = createEl(
                "i",
                ["icon", "material-icons"],
                "skip_previous"
            );
            const play = createEl(
                "i",
                ["icon", "material-icons", "ap--play"],
                "play_arrow"
            );
            const pause = createEl(
                "i",
                ["icon", "material-icons", "ap--pause"],
                "pause"
            );
            const next = createEl("i", ["icon", "material-icons"], "skip_next");

            [
                ["prev", prev],
                ["next", next],
                ["play", play],
                ["pause", pause],
            ].forEach(([type, el]) => {
                if (!settings.customIcon[type]) {
                    settings.customIcon[type] = el;
                } else {
                    const _class = {
                        pause: ["icon", "ap--pause"],
                        play: ["icon", "ap--play"],
                        next: ["icon"],
                        prev: ["icon"],
                    }[type];
                    if (_class) {
                        settings.customIcon[type].classList.add(..._class);
                    }
                }
            });

            prevBtn.appendChild(settings.customIcon.prev);
            nextBtn.appendChild(settings.customIcon.next);
            playBtn.appendChild(settings.customIcon.pause);
            playBtn.appendChild(settings.customIcon.play);
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

        /*===== PLAYER Destroy method. Clear All  ===== */
        function destroy() {
            if (!apActive) return;

            playBtn.removeEventListener("click", playToggle);
            volumeBtn.removeEventListener("click", volumeToggle);
            repeatBtn.removeEventListener("click", repeatToggle);

            progressBar.parentNode.parentNode.removeEventListener(
                "mousedown",
                handlerBar
            );
            progressBar.parentNode.parentNode.removeEventListener(
                "mousemove",
                seek
            );
            document.documentElement.removeEventListener(
                "mouseup",
                seekingFalse
            );

            volumeBar.parentNode.parentNode.removeEventListener(
                "mousedown",
                handlerVol
            );
            volumeBar.parentNode.parentNode.removeEventListener(
                "mousemove",
                setVolume
            );
            document.documentElement.removeEventListener(
                "mouseup",
                seekingFalse
            );

            prevBtn.removeEventListener("click", prev);
            nextBtn.removeEventListener("click", next);

            audio.removeEventListener("error", error);
            audio.removeEventListener("timeupdate", update);
            audio.removeEventListener("ended", doEnd);
            player.parentNode.removeChild(player);

            // Playlist
            pl.removeEventListener("click", listHandler);
            pl.parentNode.removeChild(pl);

            audio.pause();
            apActive = false;
        }

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
            destroy: destroy,
        };
    })();

    window.AP = AudioPlayer;
})(window);
