---
title: GemTD Maze Runner with Dijkstra
author: spencer-apple
template: article.jade
withImage: maze.png
date: 2014-01-04 15:00
---


The maze layout is in the classic Gem TD layout from WC3.
How many times can you force the unit to run through your maze?

<span class="more"><span>

Click and drag on squares to create a maze.
Press 'b' to send a unit moving along the path.

<script type="text/javascript" src="raphael-min.js"></script>
<script type="text/javascript" src="game.js"></script>

Color coded boxes show how many times over a square a unit has moved:
<span id="one">once,</span>
<span id="two">twice,</span>
<span id="three">thrice,</span>
<span id="four">four times,</span>
<span id="five">five times,</span> and 
<span id="six">six times.</span>

<div id="rcanvas"></div>

Check out the <a href="https://gitlab.com/splayemu/splayemu.gitlab.io/tree/master/contents/articles/pathfinding_with_djikstra" target="_blank">code</a> here.
