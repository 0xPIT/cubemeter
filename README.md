# CubeMeter

CubeMeter, a simple Node.js Smart Meter Platform

`This is a work in progress`

<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/3.0/deed.en_US"><img alt="Creative Commons License" style="border-width:0" src="http://i.creativecommons.org/l/by-nc-sa/3.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/3.0/deed.en_US">Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License</a>.

### Info

Designed to collect periodic signals via a handware interrupt, I use CubeMeter to 
collect data sent in the form of 1000 pulses per kW/h from my Eltako DSZ12D Smart Meter.
Most power meters (Electriticy, Heating, Gas, etc.) work the same way, you can also use 
simple reflective optocpuplers to collect data from a counter using a rotating disc or 
even detect the red mark on a mechanical numerical counter. You could even use [this wireless meter monitor](http://perso.aquilenet.fr/~sven337/english/2014/03/18/Gas-meter-monitoring-wireless-battery-arduino.html).

### Practical

I run the whole blob on my Raspberry PI, using an older version of MongoDB and 
[Cube](https://github.com/square/cube), a fantastic library to collect and retrieve 
periotic data. Think of it as a smart, non-destructive round robin database.

Also integrated: [OpenWeathermap](http://openweathermap.org/API) to fetch environmental 
data as a source for reference.

This is how it currently looks:
![screenshot](https://raw.githubusercontent.com/0xPIT/cubemeter/master/misc/screenshot.0.0.1.png)

This is how the Smart Power Meter is connected:
![connect](https://raw.githubusercontent.com/0xPIT/cubemeter/master/misc/connect.png)

which, when soldered, looks like this:
![hardware](https://raw.githubusercontent.com/0xPIT/cubemeter/master/misc/hardware.png)

### Status
- Running for several month without any problems
