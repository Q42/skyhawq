var markers = new ReactiveVar([]),
    newMarker = new ReactiveVar(null),
    selectedMarker = new ReactiveVar(null),
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
        return currentImage();
    },
    'markers': function () {
        return markers.get();
    },
    'newMarker': function () {
        return newMarker.get();
    },
    'selectedMarker': function () {
        return selectedMarker.get();
    }
});

Template.spottingMap.events({
    'mousemove .image': function () {
        hasPanned = $panZoomElement.panzoom('isPanning');
    },
    'click .marker': function (event) {
        var $target = $(event.target),
            selectedClass = 'is-selected',
            markerSelector = '.marker';

        $target.toggleClass(selectedClass).siblings(markerSelector).removeClass(selectedClass);
        selectedMarker.set(null);
        if ($target.hasClass(selectedClass)) {
            selectedMarker.set(this);
            console.info('selectedMarker', this);
        }
    },
    'mouseup .image': function (event) {
        var $target = $(event.target);
        if (!hasPanned && !$target.hasClass('marker')) {
            var imagePosition = $(event.currentTarget).offset(),
                x = event.pageX - imagePosition.left,
                y = event.pageY - imagePosition.top;

            // prepare a new marker with translated coordinates:
            // setting this var 'opens' the marker types menu
            newMarker.set(getCanvasCoords(x, y));
        }
        hasPanned = false;
    },
    /**
     * Handles saving the markers to the current image
     * @this {{}} The current image
     */
    'click [data-do=save]': function () {
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

        newMarker.set(null);
    },
    /**
     * Handles removal of a marker
     * @this {{}} The marker object to remove
     */
    'click [data-do=remove-marker]': function () {
        var _markers = markers.get(),
            marker = this;

        _markers = _markers.filter(function (item) {
            return item.x !== marker.x && item.y !== marker.y;
        });

        markers.set(_markers);
    },
    /**
     * Debugging handler to easily clear all markers on the given image
     */
    'click [data-do=clear-markers]': function () {
        markers.set([]);
    }
});

Template.spottingMap.onCreated(function () {
    this.autorun(function (comp) {
        var img = currentImage();
        if (img) {
            markers.set(img.markers);
            comp.stop();
        }
    });
});

Template.spottingMap.onRendered(function () {
    this.autorun(comp => {
        if (currentImage()) {
            initPanZoom(this.firstNode);
            comp.stop();
        }
    });
});

/**
 * reactive
 */
function currentImage() {
  return Images.findOne(FlowRouter.getParam('imageId'));
}