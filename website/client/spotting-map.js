var markers = new ReactiveVar([]),
    $panZoomElement;

function getCanvasCoords(x,y){
    var matrix = $panZoomElement.panzoom("getMatrix");

    return {
        x: x * (1 / matrix[0]),  // multiply with inverse zoom factor
        y: y * (1 / matrix[3])
    };
}

Template.spottingMap.helpers({
    'image': function () {
        return Images.findOne();
    },
    'markers': function () {
        return markers.get()
    }
});

var hasPanned = false;

Template.spottingMap.events({
    'mousemove .image': function () {
        hasPanned = $panZoomElement.panzoom('isPanning');
    },
    'mouseup .image': function (event) {
        if (!hasPanned) {
            // 'click'
            var imagePosition = $(event.currentTarget).offset(),
                x = event.pageX - imagePosition.left,
                y = event.pageY - imagePosition.top,
                pos = getCanvasCoords(x, y),
                tempMarkers = markers.get();

            tempMarkers.push(pos);

            markers.set(tempMarkers);
        }
        hasPanned = false;
    },
    /**
     * @param event
     * @this {{}} The current image
     */
    'click [data-do=save]': function (event) {
        console.info('saving!');
        Images.update(this._id, {
            '$set': {
                'markers': markers.get()
            }
        });
    }
});

Template.spottingMap.onCreated(function () {
    this.autorun(function (comp) {
        var currentImage = Images.findOne();
        console.info(currentImage);
        if (currentImage) {
            markers.set(currentImage.markers);
            comp.stop();
        }
    });
});

function initPanZoom(element) {
    var $container = $(element),
        $canvas = $container.find('.canvas');

    console.info('initializing!', element, Images.findOne());

    $panZoomElement = $container.find('.image');

    $panZoomElement.panzoom({
        $zoomIn: $container.find('[data-do=zoom-in]'),
        $zoomOut: $container.find('[data-do=zoom-out]'),
        $zoomRange: $container.find('[data-do=zoom-range]'),
        $reset: $container.find('[data-do=reset]')//,
        //contain: true
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


Template.spottingMap.onRendered(function () {
    this.autorun(comp => {
        if (Images.findOne()) {
            initPanZoom(this.firstNode);
            comp.stop();
        }
    });
});
