# th.gl.commandline

**Please consider to download and donate via http://gumroad.com/tmhglnd**

**or become a patron on http://patreon.com/timohoogland**

---

A commandline text-editor in the Max Jitter OpenGL window for interaction with your patch in a Livecoding-like style.

## About

Live coding is starting to become more and more popular. As a new form of performance, as a way of showing transparency to the audience in what you are doing, as a challenge for the performer to come up with interesting code on the fly and as a way of exploring the computer, creative coding and improvisation. Because coding entirely from scratch is a hard task, it can be helpful to prepare some code beforehand, and then perform with that on stage by for example adjusting parameters. This command-line text editor lets you achieve just that! Build your entire audio/visual performance in max, and use the command-line to adjust parameters and play with it.

This is a command line text editor (similar to the workflow of the terminal) for the opengl world of Max build in javascript. Add the object to your setup and initialize it with the name of the render context. Then make sure you send it the render bang in the top inlet. The outlet outputs the typed text as a list that you can use in any way you like. To for example control parameters of gl objects, but it can also be used for controlling musical parameters, lighting shows, whatever you think of!

## Install

Download zip
```
1. download zip
2. unzip and place in Max Searchpath (eg. MacOS ~/Documents/Max 8/Library)
3. restart Max8
```
Git clone
```
1. $ cd ~/Documents/Max\ 8/Library
2. $ git clone https://github.com/tmhglnd/th.gl.commandline.git
3. restart Max8
```
```
4. Create a new object with "n" and type th.gl.commandline. (Alt) + Right-click to open the helpfile.
5. Read the helpfile carefully, open the Big Example to play with some of the jit.gl objects
```
## License

The software is licensed under:
The GNU Lesser General Public License v.3

The artistic and aesthetic output of the software is licensed under:
Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License
