var shit = {"comments": [
        {"text": "Hadar needs to suck a dick", "tension-value": "-0.8", "timestamp": "21:00:00"},
        {"text": "Hadar should die", "tension-value": "-1", "timestamp": "21:15:00"},
        {"text": "I love Hadar!", "tension-value": "1", "timestamp": "21:30:00"}
    ]
}


//goddamnit

$(function () {
        $('#container').highcharts({
            chart: {
                zoomType: 'x',
                spacingRight: 20
            },
            title: {
                text: 'LA Hacks Feedback'
            },
            subtitle: {
                text: document.ontouchstart === undefined ?
                    'Click and drag in the plot area to zoom in' :
                    'Pinch the chart to zoom in'
            },
            xAxis: {
                type: 'datetime',
                maxZoom: 60000, // 1 minute
                title: {
                    text: 'Time'
                }
            },
            yAxis: {
                title: {
                    text: 'How low can you go?'
                }
            },
            tooltip: {
                shared: true
            },
            legend: {
                enabled: true
            },
            plotOptions: {
                
            },
    
            series: [{
                type: 'spline',
                name: 'Hadar Dor',
                pointStart: Date.UTC(2014, 0, 01),
                pointInterval: 5000,
                data: [1, 0.5, 0.6, 0.3, 0, -1],
                negativeColor: '#FF0000',
                point: {
                        events: {
                            click: function() {
                                hs.htmlExpand(null, {
                                    pageOrigin: {
                                        x: this.pageX,
                                        y: this.pageY
                                    },
                                    headingText: this.series.name,
                                    maincontentText: 'Hadar Dor sucks',
                                    width: 200
                                });
                            }
                        }
                    }
                },
            {
                type: 'spline',
                name: 'WiFi',
                pointStart: Date.UTC(2014, 0, 01),
                pointInterval: 10000,
                data: [-1, 0.5, -0.3, 0.7, 1],
                negativeColor: '#880088',
                point: {
                        events: {
                            click: function() {
                                hs.htmlExpand(null, {
                                    pageOrigin: {
                                        x: this.pageX,
                                        y: this.pageY
                                    },
                                    headingText: this.series.name,
                                    maincontentText: Highcharts.dateFormat('%A, %b %e, %Y', this.x) +':<br/> '+
                                        this.y +' visits',
                                    width: 200
                                });
                            }
                        }
                    }
            }]
        });
    });