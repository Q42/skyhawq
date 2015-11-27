var markers = new ReactiveVar([]),
    newMarker = new ReactiveVar(false),
    hasPanned = false,
    $panZoomElement;

/**
 * Returns the given coordinates transformed by the current matrix transformation on the pan/zoom element.
 * @param {Number} x
 * @param {Number} y
 * @returns {{x: number, y: number}}
 */
function getCanvasCoords(x,y){
    var matrix = $panZoomElement.panzoom("getMatrix");

    return {
        x: x * (1 / matrix[0]),  // multiply with inverse zoom factor
        y: y * (1 / matrix[3])
    };
}

/**
 * Initializes the 'pan/zoom' element
 * @param {Element} element
 */
function initPanZoom(element) {
    var $container = $(element),
        $canvas = $container.find('.canvas');

    $panZoomElement = $container.find('.image');

    $panZoomElement.panzoom({
        $zoomIn: $container.find('[data-do=zoom-in]'),
        $zoomOut: $container.find('[data-do=zoom-out]'),
        $zoomRange: $container.find('[data-do=zoom-range]'),
        $reset: $container.find('[data-do=reset]')
    });

    $canvas.on('mousewheel.focal dblclick', function (event) {
        var delta = event.delta || event.originalEvent.wheelDelta,
            zoomOut = delta ? delta < 0 : event.originalEvent.deltaY > 0;

        event.preventDefault();
        $panZoomElement.panzoom('zoom', zoomOut, {
            increment: event.type === 'dblclick' ? 0.5 : 0.1,
            animate: false,
            focal: event
        });
    });
}

Template.spottingMap.helpers({
    'image': function () {
        return Images.findOne();
    },
    'markers': function () {
        return markers.get();
    },
    'newMarker': function () {
        return newMarker.get();
    }
});

Template.spottingMap.events({
    'mousemove .image': function () {
        hasPanned = $panZoomElement.panzoom('isPanning');
    },
    'mouseup .image': function (event) {
        var $target = $(event.target),
            selectedClass = 'is-selected',
            markerSelector = '.marker';

        if ($target.is(markerSelector)) {
            $target.addClass(selectedClass).siblings(markerSelector).removeClass(selectedClass);
        } else {
            if (!hasPanned) {
                var imagePosition = $(event.currentTarget).offset(),
                    x = event.pageX - imagePosition.left,
                    y = event.pageY - imagePosition.top;

                // prepare a new marker with translated coordinates:
                // setting this var 'opens' the marker types menu
                newMarker.set(getCanvasCoords(x, y));
            }
        }
        hasPanned = false;
    },
    /**
     * Handles saving the markers to the current image
     * @param event
     * @this {{}} The current image
     */
    'click [data-do=save]': function (event) {
        Images.update(this._id, {
            '$set': {
                'markers': markers.get()
            }
        });
    },
    /**
     * Handles adding of a marker to the map.
     * @param event
     */
    'click [data-do=add-marker]': function (event) {
        var _markers = markers.get(),
            $button = $(event.currentTarget),
            marker = newMarker.get();

        marker.type = $button.data('marker-type');
        marker.description = $button.text();

        _markers.push(marker);
        markers.set(_markers);

        newMarker.set(false);
    },
    /**
     * Debugging handler to easily clear all markers on the given image
     * @param event
     */
    'click [data-do=clear-markers]': function (event) {
        markers.set([]);
    }
});

Template.spottingMap.onCreated(function () {
    this.autorun(function (comp) {
        var currentImage = Images.findOne();
        if (currentImage) {
            markers.set(currentImage.markers);
            comp.stop();
        }
    });
});

Template.spottingMap.onRendered(function () {
    this.autorun(comp => {
        if (Images.findOne()) {
            initPanZoom(this.firstNode);
            comp.stop();
        }
    });
});
