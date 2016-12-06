---
title: Visualizing Travel Effort
author: spencer-apple
template: article.jade
withImage: travelEffortVis.png
date: 2016-09-19 15:00
---

Some things make traveling hard: busses leave at early times, distances are large between places, traveling consumes a large portion of your day, stays at each place are short, and the stays themselves are not comfortable.

<span class="more"><span>

This post attempts to show: *Where on our trip did we put the most effort into traveling?*

<link rel="stylesheet" href="css/main.css"></link>
<script type="text/javascript" src="lib/d3.min.js"></script>
<script type="text/javascript" src="data/places.js"></script>
<script type="text/javascript" src="src/graphcomponents.js"></script>
<script type="text/javascript" src="src/visualization.js"></script>
<script type="text/javascript" src="src/main.js"></script>

---
## Length of Stay per Country
First, I looked at the total time we spent in each country.

We spent more time in the South American countries than the Central American ones.
This makes sense as they are larger, and we visited more destinations in each country.

<div id="lengthOfStay"></div>

Each graph uses the same color to display the country.

---
## Length of Stay per Place
Next up, how long did we stay in each place?
Here you can also see how many places we visited in each country.

<div id="lengthOfStayPerPlace"></div>

While this graph shows periods of high mobility, it doesn't contain any information regarding the travel time between two places.

---
## Travel Time to each Place
Traveling is exhausting. 
I wanted to show how much time we spent on a bus, plane, ferry, or by the side of the road waiting for a ride.

I used our memories to determine travel time.
It would be interesting to use an API to determine the distance traveled as well as approximate travel time, but it wouldn't include time spent waiting for connections and rides.

<div id="travelTimePerPlace"></div>

---
## Travel Time to Each Place over Datetime

<div id="travelTimePerPlaceScatterplot"></div>

These graphs do a good job showing how much travel we were doing, but they have some flaws. 
<span id='medellínMouse' class="colombia">Medellín,</span> for example, appears as a relatively difficult travel experience. 
While it did take us 12 hours to bus there from Bogotá, we ended up staying there longer than any other place.

---
## Travel Effort (Travel Time to / Length of Stay) over Datetime
Instead of Travel Time, a ratio of travel time / length of stay better shows our Relative Travel Effort.

Higher points mean we spent a higher amount of relative time traveling.
You can see clusters of high points such as in the <span class="patagoniaMouse chile">Chilean Patagonia</span> and <span class="patagoniaMouse argentina">Argentinian Patagonia</span> where we would spend all day hitchhiking to the next town or taking 8 hour bus rides on gravel roads.
On the more relaxed side, in <span id="boliviaMouse" class="bolivia">Bolivia</span> and <span id="colombiaMouse" class="colombia">Colombia,</span> you can note the grouping of short points which shows our relative slow travel speed.

<div id="travelTimeOverTotalTimePoints"></div>

Using the same data and axices, but with a linegraph instead of points, you can see a linear progression of our Relative Travel Effort.

<div id="travelTimeOverTotalTimeLine"></div>

This graph is confusing because between the high peaks are low valleys. 
Were those low valleys breaks from the vigors of travel? 
In reality, those valleys were momentary respites, but were apart of longer stretches of harder travel.

Perhaps a metric that dampened the highs and lows of the travel effort line would better visualize how we felt at the time, but would further abstract the visuals from the data.

---
## Relative Travel Effort per Country
Aggregating everything back up, it's easy to compare our Relative Travel Effort for each country.

<div id="travelSpeedCountry"></div>

---
## Conclusions

To answer the question: *Where on our trip did we put the most effort into traveling?* 

Our hardest traveling was through parts of <span class="peru">Peru,</span> the <span class="chile">Chilean</span> and <span class="argentina">Argentinian</span> Patagonia, <span class="panama">Panama,</span> and start of <span class="costaRica">Costa Rica</span>.
I didn't take into account the types of accommodation we stayed in, our methods of travel, or the weather.
Each of these can make traveling much easier or much harder and more tiresome.

In total, we spent **<span id="totalTravelTime"></span> hours** traveling over **<span id="totalDays"></span> days.** 
That's equivalent to commuting <span id="commuteTime"></span> hours a day, 5 days a week, 48 weeks a year.

Sitting on a bus for many hours does have it's benefits though; I was able to read many thought-provoking and entertaining books!


