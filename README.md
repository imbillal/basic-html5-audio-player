# Basic html5 audio player

basic html5 audio player(with playlist) using material icons, css and js api.

demo:

<img width="695" alt="Screenshot 2023-09-17 at 2 33 55 PM" src="https://github.com/imbillal/basic-html5-audio-player/assets/20609150/4d1e61a2-22ba-4d5c-9970-cf888c57436a">


Try it on CodePen: [Basic](https://codepen.io/lhz516/pen/dyGpmgP), [Playlist](https://codepen.io/lhz516/pen/ZExvXjx)

Supported browsers: `Chrome`, `Firefox`, `Safari`, `Edge`

## 2. how to use plagin

1. insert AudioPlayer.js
2. use AP.init function

code example:

```html
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8" />
        <title>Basic HTML5 Audio player</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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

        <script src="./audio.js"></script>
        <script>
            AP.init({
                container: "#player",
                volume: 0.7,
                autoPlay: true,
                playList: [
                    {
                        file: "./mp3/audio1.mp3",
                    },
                    {
                        file: "./mp3/SoundHelix-Song-9.mp3",
                    },
                ],
            });
        </script>
    </body>
</html>
```

### Available Props

| Props      | Type    | Default | Note                                                                         |
| ---------- | ------- | ------- | ---------------------------------------------------------------------------- |
| playList   | Array   |         |
| autoPlay   | boolean | true    |                                                                              |
| layout     | string  | stacked | layout options `stacked` `stacked-reverse` `horizontal` `horizontal-reverse` |
| loop       | boolean | false   |                                                                              |
| showVolume | boolean | true    |                                                                              |
| volume     | number  | 0.5     |                                                                              |
| shuffle    | boolean | true    |                                                                              |
| themeColor | string  | #e07a0c |                                                                              |


[license](https://github.com/likev/html5-audio-player/blob/master/license.txt)
