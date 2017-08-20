function readDateTimesInBase64(str) {
    var binaryString = Base64.decode(str);
    return readDateTimesInBinary(binaryString);
}

function readDecimalsInBase64(str) {
    var binaryString = Base64.decode(str);
    return readDecimalsInBinary(binaryString);
}

function readIntegersInBase64(str) {
    var binaryString = Base64.decode(str);
    return readIntegersInBinary(binaryString);
}

function stdFormatUTCToLocalDateTime(stdDateSt) {
    var resDate = stdFormatToDate(stdDateSt);
    if (resDate !== "") {
        resDate.setTime(resDate.getTime() - resDate.getTimezoneOffset() * 60000);
    }
    return resDate;
}

function stdFormatToDate(stdDateSt, includeTicks) {
    if (stdDateSt) {
        var dateFormatRegExpSt = /(\d{4})\-(\d{2})\-(\d{2}) (\d{2})\:(\d{2}):(\d{2})\.(\d{3})/;

        var matchRes = stdDateSt.match(dateFormatRegExpSt);

        if (!matchRes || (matchRes.length < 8 /*seven plus the whole match is 8 */)) {
            return new Date(1900, 0);
        }

        var resultDate = new Date();
        resultDate.setFullYear(matchRes[1], parseInt(matchRes[2], 10) - 1, matchRes[3]);
        if (includeTicks === false) {
            resultDate.setHours(matchRes[4], matchRes[5], matchRes[6]);
        } else {
            resultDate.setHours(matchRes[4], matchRes[5], matchRes[6], matchRes[7]);
        }

        return resultDate;
    }

    return new Date(1900, 0);
}

function readIntegersInBinary(binaryString) {
    var res = [];
    for (var start = 0; start < binaryString.length; start += 4) {
        var tmpVal = 0;
        for (var offset = 3; offset >= 0; offset--) {
            tmpVal = tmpVal * 256 + binaryString.charCodeAt(start + offset);
        }
        res.push(tmpVal);
    }
    return res;
}

function readDecimalsInBinary(binaryString) {
    var res = [];
    for (var start = 0; start < binaryString.length; start += 4) {
        var tmpVal = 0;
        for (var offset = 3; offset >= 0; offset--) {
            tmpVal = tmpVal * 256 + binaryString.charCodeAt(start + offset);
        }
        var expVal = Math.floor(tmpVal / 100000000);
        tmpVal = tmpVal % 100000000 * Math.pow(10, -expVal);
        res.push(tmpVal);
    }
    return res;
}

function readDateTimesInBinary(binaryString) {
    var res = [];
    for (var start = 0; start < binaryString.length; start += 6) {
        var tmpVal = 0;
        for (var offset = 3; offset >= 0; offset--) {
            tmpVal = tmpVal * 256 + binaryString.charCodeAt(start + offset);
        } // number of seconds from 1970

        tmpVal = tmpVal * 1000; // convert to mili-seconds

        tmpVal += 256 * binaryString.charCodeAt(start + 5) + binaryString.charCodeAt(start + 4);
        var tmpDate = new Date();
        tmpDate.setTime(tmpVal);
        res.push(tmpDate);
    }
    return res;
}

var Base64 = {

    // private property
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for encoding
    encode: function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        while (i < input.length) {
            chr1 = input.charCodeAt(i);
            i++;
            chr2 = input.charCodeAt(i);
            i++;
            chr3 = input.charCodeAt(i);
            i++;

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
                this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
        }

        return output;
    },

    // public method for decoding
    decode: function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = this._keyStr.indexOf(input.charAt(i));
            i++;
            enc2 = this._keyStr.indexOf(input.charAt(i));
            i++;
            enc3 = this._keyStr.indexOf(input.charAt(i));
            i++;
            enc4 = this._keyStr.indexOf(input.charAt(i));
            i++;

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 !== 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 !== 64) {
                output = output + String.fromCharCode(chr3);
            }
        }

        //        output = Base64._utf8_decode(output);

        return output;
    }
};

var EFeedResolutionLevel = {
    Tick: 0, Minute: 1, FiveMinutes: 2, FifteenMinutes: 3,
    ThirtyMinutes: 4, Hour: 5, TwoHours: 6, FourHours: 7, Day: 8, Week: 9
};

function GenericStringToEnum(dict, dict_name) {
    function innerGenericStringToEnum(value) {
        if (value in dict) {
            return dict[value];
        }
        return -1;
    }
    return innerGenericStringToEnum;
}

var StringToEFeedResolutionLevel = GenericStringToEnum(EFeedResolutionLevel, "EFeedResolutionLevel");