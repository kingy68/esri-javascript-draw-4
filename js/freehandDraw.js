define([
    "dojo/_base/declare"
],
  function (declare) {
      return declare(null, {
          constructor: function (view, graphicsLayer) {
              console.log('Loading draw');
              // The map/scene view which will be paused
              this.view = view;
              // The graphics layer to draw onto
              this.graphicsLayer = graphicsLayer;
          },

          drawFreehand: function () {
              var rings = [];
              var currentGraphic, lineSymbol, fillSymbol, pointSymbol;
              var view = this.view;
              var graphicsLayer = this.graphicsLayer;

              require(["dojo/on",
                "esri/Graphic",
                "esri/geometry/Point",
                "esri/geometry/Polyline",
                "esri/geometry/Polygon",
                "esri/geometry/geometryEngine",
                "esri/symbols/SimpleLineSymbol",
                "esri/symbols/SimpleFillSymbol",
                "esri/symbols/SimpleMarkerSymbol"
              ], function (on, Graphic, Point, Polyline, Polygon, geometryEngine, SimpleLineSymbol, SimpleFillSymbol, SimpleMarkerSymbol) {

                  var grColor = [235, 0, 0];

                  // Symbology for the temporary line
                  lineSymbol = new SimpleLineSymbol({
                      color: grColor,
                      width: 3
                  });
                  // Symbology for the final polygon
                  fillSymbol = new SimpleFillSymbol({
                      color: [0, 0, 0, 0.0], // it is transparent
                      outline: lineSymbol,
                      style: "none"
                  });

                  pointSymbol = new SimpleMarkerSymbol({
                      color: grColor,
                      style: "circle",
                      size: "3px",
                      outline: null
                  });

                  var getMapPoint = function (evt) {
                      // Use offsets to account for map not being flush left/top of window
                      return view.toMap({ "x": evt.offsetX, "y": evt.offsetY });
                  };

                  // Start the freehandDrawHandle, this listens for a mousedown event on the view.container
                  var handler = on.pausable(view.container, "mousedown", function (event) {
                      event.preventDefault();

                      // We temporarily disable the ability to move the map
                      if (view.type === "3d") {
                          view.navigationControls.mouseDragLeft = 'select';
                          handler.pause();
                      } else {
                          view.gestureManager.inputManager.manager.options.enable = false;
                      }

                      // Get the start point for the temporary line
                      var drawStart = getMapPoint(event);
                      rings.push([drawStart.x, drawStart.y]);

                      currentGraphic = new Graphic({
                          geometry: new Point({ x: drawStart.x, y: drawStart.y, spatialReference: view.spatialReference }),
                          symbol: pointSymbol
                      });
                      graphicsLayer.add(currentGraphic);

                      // The next segment of the line is created by listening to the mousemove
                      // event on the view. For each event, we add to the resulting line.
                      var nextSegment = on.pausable(view.container, "mousemove", function (event) {
                          // Remove the previous graphic, as we will update it
                          // with the new graphic
                          if (currentGraphic)
                              graphicsLayer.remove(currentGraphic);

                          // Progressively add new points to the line
                          var nextPoint = getMapPoint(event);

                          if ((nextPoint.z !== undefined && view.type === '3d') || view.type === '2d') {
                              rings.push([nextPoint.x, nextPoint.y]);

                              // Update the graphic in the graphics layer
                              currentGraphic = new Graphic({
                                  geometry: new Polyline({
                                      paths: rings,
                                      spatialReference: view.spatialReference
                                  }),
                                  symbol: lineSymbol
                              });

                              graphicsLayer.graphics.add(currentGraphic);
                          }
                      });

                      // The final segment is a mouseup event on the map.view. When this fires
                      // we complete the polygon.
                      var lastSegment = on.pausable(view.container, "mouseup", function (event) {
                          handler.remove();
                          nextSegment.remove();
                          lastSegment.remove()

                          // Enable movement of the map again
                          if (view.type === "3d") {
                              view.navigationControls.mouseDragLeft = 'pan';
                          } else {
                              view.gestureManager.inputManager.manager.options.enable = true;
                          }

                          // Remove the previous line graphic
                          if (currentGraphic)
                              graphicsLayer.remove(currentGraphic);

                          // Construct the final point of the line
                          var lastPoint = getMapPoint(event);

                          // Add the original point to the end of the line to
                          // complete the polygon
                          var firstPointCopy = [rings[0][0], rings[0][1]];
                          rings.push(firstPointCopy);

                          // Create the polygon and simplify
                          var polygon = new Polygon({
                              rings: rings,
                              spatialReference: view.spatialReference
                          });

                          var simplePolygon = geometryEngine.simplify(polygon);

                          currentGraphic = new Graphic({
                              geometry: simplePolygon,
                              symbol: fillSymbol
                          });

                          // Add the graphic
                          graphicsLayer.add(currentGraphic);
                      })
                  });
              });
          }
      });
  });