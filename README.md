# StudySpace

[__Check it out here!__](https://silkthyme.github.io/studyspace/studyspace.html)

![Squiggly the Squid](https://github.com/silkthyme/studyspace/blob/master/krakenkid.png)

__Let Squiggly the Squid help determine the best study spot on campus!__

Tired of vying for charging ports in crowded MU cafes or finding an empty spot at the Silo? Never fear, Squiggly is here. Created with almost-real-time WiFi data from [OSISoft PI Web API](https://ucd-pi-iis.ou.ad3.ucdavis.edu/piwebapi)
).

## How we built it

It uses OSISoft's PI Web API to retrieve WiFi statistics from buildings around campus in order to estimate and analyze which ones are currently the most occupied based on the number of devices connected to the internet at the current time. Then, we extract interpolated data from the past week for a certain building and take the maximum of the WiFi occupants in order to compute which building is most likely to be quiet, i.e. least used in real time. We display our top ten recommendations on our web app, but the user can view real-time stats for all the UC Davis buildings on the bottom.

## References

- [Source](https://codepen.io/hexagoncircle/pen/ZQrvyR)
- [Logo](https://dribbble.com/shots/2080003-Kraken-Kid)
