# Basic html5 audio player

basic html5 audio player(with playlist) using material icons, css and js api.

[live demo](https://imbillal.github.io/basic-html5-audio-player/)

<img width="695" alt="Screenshot 2023-09-17 at 2 33 55 PM" src="https://github.com/imbillal/basic-html5-audio-player/assets/20609150/4d1e61a2-22ba-4d5c-9970-cf888c57436a">

CDN [JS](https://cdn.jsdelivr.net/gh/imbillal/basic-html5-audio-player/js/audio.min.js) [CSS](https://cdn.jsdelivr.net/gh/imbillal/basic-html5-audio-player/css/audio.css)

```html
<link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/gh/imbillal/basic-html5-audio-player/css/audio.css"
/>
```

```html
<script src="https://cdn.jsdelivr.net/gh/imbillal/basic-html5-audio-player/js/audio.min.js" />
```

Supported browsers: `Chrome`, `Firefox`, `Safari`, `Edge`

## 2. how to use plagin

1. insert Js and CSS CDN in your file
2. use AudioPlayer.init function

code example:

```html
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8" />
        <title>Basic HTML5 Audio player</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="./css/audio.css" />
        <style>
            #player {
                position: relative;
                max-width: 800px;
                margin: 100px auto;
                border: solid 1px #dadada;
            }
        </style>
    </head>

    <body>
        <div id="player" />
        <script src="./js/audio.js"></script>
        <script>
            AudioPlayer.init({
                container: "#player",
                volume: 0.7,
                autoPlay: false,
                playList: [
                    {
                        file: "./mp3/audio1.mp3",
                    },
                    {
                        file: "./mp3/audio2.mp3",
                    },
                ],
            });
        </script>
    </body>
</html>
```

### Available Props

<!-- ReactNode -->

| Props       | Type            | Default        | Note                                                                                                |
| ----------- | --------------- | -------------- | --------------------------------------------------------------------------------------------------- |
| playList    | Array           |                |
| autoPlay    | boolean         | false          |                                                                                                     |
| layout      | string          | stacked        | layout options `stacked` `stacked-reverse` `horizontal` `horizontal-reverse`                        |
| loop        | boolean         | false          |                                                                                                     |
| hideVolume  | boolean         | false          |
| hideTitle   | boolean         | true           |                                                                                                     |
| volume      | number          | 0.5            |                                                                                                     |
| shuffle     | boolean         | true           |                                                                                                     |
| customIcons | Object `NodeEl` | material-icons | material-icons used for action buttons. icons. customIcons options { `prev` `next` `play` `pause` } |
| themeColor  | string          | blue           |                                                                                                     |
