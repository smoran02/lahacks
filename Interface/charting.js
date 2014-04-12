var shit = {"comments": [
        {"text": "Hadar needs to suck a dick", "tension-value": "-0.8", "timestamp": "21:00:00"},
        {"text": "Hadar should die", "tension-value": "-1", "timestamp": "21:15:00"},
        {"text": "I love Hadar!", "tension-value": "1", "timestamp": "21:30:00"}
    ]
}


//console.log(shit.comments[0].tension-value + " " + shit.comments[1].tension-value + " " + shit.comments[2].tension-value);

$(function () {
    $('#container').highcharts({
        chart: {
            type: 'spline'
        },
        title: {
            text: 'LA Hacks Feedback'
        },
        xAxis: {
            text: 'Time'
        },
        yAxis: {
            title: {
                text: "How's it going?",
                categories: ['Good', 'Poor']
            }
        },
        series: [{
            name: 'Hadar',
            data: [1, 0.5, 0.75, -1],
            enableMouseTracking: 'True',
            negativeColor: '#FF0000'
        }],
        plotOptions: {
            
        }
    });
});