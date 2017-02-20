# esri-javascript-draw-4

A custom [Esri JavaScript 4.2 API](https://developers.arcgis.com/javascript/) freehand Draw Tool.

Currently the 4.2 API does not contain a [Draw Tool](https://developers.arcgis.com/javascript/3/jsapi/draw-amd.html), therefore this tool can be used and extended to enable draw functionality.

Currently works for the 2D and 3D version of the 4.2 API.

### Usage
Simply load the module into your code using dojo.require.

### Initialise a new object:

```js
var draw = new freehandDraw(View, GraphicsLayer);
```

Requires an Esri JavaScript MapView or SceneView and a GraphicsLayer as constructor prameters.

### Call drawFreehand:

```js
draw.drawFreehand()
```

When this is called, click and drag in the map to draw a freehand polygon.

### Example
Here is a quick example to get you started. Just copy the freehandDraw.js file into your project, add the correct dojoConfig parameters to load the module, then just use it in your code as you would a standard dojo widget.

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no">
<title>Get started with MapView - Create a 2D map</title>

<style>
  html,
  body,
  #viewDiv {
    padding: 0;
    margin: 0;
    height: 100%;
    width: 100%;
  }
</style>

<link rel="stylesheet" href="https://js.arcgis.com/4.2/esri/css/main.css">
<link rel="stylesheet" type="text/css" href="//ajax.googleapis.com/ajax/libs/dojo/1.10.4/dijit/themes/claro/claro.css"/‌​>

<script>
  var dojoConfig = {
    packages: [{
      name: 'freehandDraw',
      location: location.pathname.replace(/\/[^/]+$/, '') + '/js',
      main: 'freehandDraw'
    }]
  };
</script>
<script src="https://js.arcgis.com/4.2/"></script>

<script>
  require([
    "esri/Map",
    "esri/views/MapView",
    "esri/views/SceneView",
    "esri/layers/GraphicsLayer",
    "dijit/form/Button",
    'freehandDraw',
    "dojo/domReady!"
  ], function(Map, MapView, SceneView, GraphicsLayer, Button, freehandDraw) {
    var map = new Map({
      basemap: "streets",
      ground: "world-elevation"
    });
    // Uncomment me for 2D!
    // var view = new MapView({
    //   container: "viewDiv",
    //   map: map,
    //   zoom: 4,
    //   center: [15, 65]
    // });
    // Uncomment me for 3D!
    var view = new SceneView({
      container: "viewDiv",
      map: map,
      center: [-56.049, 38.485, 78],
      zoom: 3
    });
    var gl = new GraphicsLayer();
    map.add(gl);
    var draw = new freehandDraw(view, gl);
    var button = new Button({
      label: "draw!",
      onClick: function() {
        draw.drawFreehand();
      }
    }, "progButtonNode").startup();
  });
</script>
</head>

<body class="claro">
  <div id="viewDiv"></div>
  <div style="position:fixed;top:13px;left:60px;">
    <button id="progButtonNode" type="dojo.dijit.button" ></button>
  </div>
</body>
</html>
```
