var ivsChart = {
    candlesAsLines: false,
    currentGraphRes: EFeedResolutionLevel.Tick
};

function ChartiqDataPoint(time, open, high, low, close) {
    this.DT = time;
    this.Open = open;
    this.High = high;
    this.Low = low;
    this.Close = close;
}

function parseDataToChartPoint(data) {
    if (data.hasOwnProperty('FeedResolutionLevel') && !data.Parsed) {
        data.DateTime = readDateTimesInBase64(data.DateTime);
        data.CloseRate = readDecimalsInBase64(data.CloseRate);
        data.HighRate = readDecimalsInBase64(data.HighRate);
        data.LowRate = readDecimalsInBase64(data.LowRate);
        data.OpenRate = readDecimalsInBase64(data.OpenRate);
        data.Parsed = true;
    } else {
        if (!data.Parsed) {
            data.DeltaDateTime = readIntegersInBase64(data.DeltaDateTime);
            data.SellRate = readDecimalsInBase64(data.SellRate);
            data.StartPointDate = stdFormatUTCToLocalDateTime(data.StartPointDate);
            data.Parsed = true;
        }
    }

    return data;
}

function startChart(data, fixedTime) {
    var histData = [];

    for (var i = 0; i < data.CloseRate.length; i++) {
        histData.push(new ChartiqDataPoint(data.DateTime[i].getTime(),
            data.OpenRate[i],
            data.HighRate[i],
            data.LowRate[i],
            data.CloseRate[i]));
    }

    ivsChart.currentMax = histData[histData.length - 1].DT;
    ivsChart.currentMin = histData[0].DT;
    ivsChart.currentGraphRes = StringToEFeedResolutionLevel(data.FeedResolutionLevel);
    initChartiq(data, histData, fixedTime);
    return histData;
}

function initChartiq(data, histData, fixedTime) {
    if (!ivsChart.stxx) {
        ivsChart.stxx = new CIQ.ChartEngine({
            container: $("#chartContainer")[0],
            xaxisHeight: 30,
            xAxisAsFooter: true,
            reverseMouseWheel: true, //The world is divided on whether mousewheel/trackpad upward strokes should zoom in or zoom out. The default is that upward movement zooms out. This behavior can be reversed
            preferences: {
                labels: false,
                currentPriceLine: false,
                whitespace: 0 //The initial amount of whitespace to display between the right edge of the chart and the y-axis
            }
        });
        ivsChart.stxx.setMarketFactory(CIQ.Market.Symbology.factory);

        new CIQ.ExtendedHours(ivsChart.stxx, ["post", "pre"]);//make table show 24 h time 

        ivsChart.stxx.controls["mSticky"] = null;
        var tooltip = new CIQ.Tooltip({
            stx: ivsChart.stxx,
            ohl: true,
            volume: true,
            series: true
        });
        ivsChart.stxx.layout.crosshair = true;
    }
    startUI(data, histData, fixedTime);
}

function startUI(data, histData, fixedTime) {
    ivsChart.stxx.setChartType(ivsChart.candlesAsLines || ivsChart.currentGraphRes === 0 ? "line" : "candle");

    ivsChart.stxx.newChart(data["InstrumentName"],
        histData,
        null,
        function () {
            ivsChart.stxx.chart.yAxis.decimalPlaces = 5;
            ivsChart.stxx.chart.yAxis.maxDecimalPlaces = 5;

            //set visible ranges by min and max calculated in genChartObject
            ivsChart.stxx.setRange({
                dtLeft: new Date(ivsChart.currentMin),
                dtRight: new Date(ivsChart.currentMax)
            });

        });
    if (ivsChart.currentGraphRes !== EFeedResolutionLevel.Minute) {
        ivsChart.stxx.setPeriodicity({
            period: 1,
            interval: 5,
            timeUnit: "minute"
        });
    } 
	//else {
    //    ivsChart.stxx.setPeriodicity({
    //        period: 1,
    //        interval: "day"
    //    });
    //}
}
